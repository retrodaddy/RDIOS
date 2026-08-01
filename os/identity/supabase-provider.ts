import "server-only";
import { db, DbError } from "@/lib/db/client";
import type { IdentityProvider } from "./provider";
import type { Institution, InstitutionMembership, InstitutionType, MembershipStatus, Person } from "./types";

/**
 * Real, Postgres-backed Identity provider — the second implementation of
 * the exact interface `mock-provider.ts` already implements, per
 * Enterprise Foundation §4.1. Every method here reproduces the mock's
 * own observable behavior exactly (the same invitation lifetime, the
 * same idempotent endMembership, the same fail-closed acceptInvitation),
 * because nothing above `provider.ts` is allowed to notice which
 * implementation is running underneath it.
 */

type InstitutionRow = {
  id: string;
  name: string;
  type: InstitutionType;
  purpose: string | null;
  founder_person_id: string;
  created_at: string;
};

type PersonRow = { id: string; name: string; email: string };

type MembershipRow = {
  id: string;
  institution_id: string;
  person_id: string;
  status: MembershipStatus;
  created_at: string;
  expires_at: string | null;
};

function toInstitution(row: InstitutionRow): Institution {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    purpose: row.purpose,
    founderPersonId: row.founder_person_id,
    createdAt: row.created_at,
  };
}

function toPerson(row: PersonRow): Person {
  return { id: row.id, name: row.name, email: row.email };
}

function toMembership(row: MembershipRow): InstitutionMembership {
  return {
    id: row.id,
    institutionId: row.institution_id,
    personId: row.person_id,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

const INVITATION_LIFETIME_DAYS = 7;

async function findPersonByEmail(email: string): Promise<PersonRow | null> {
  const { data, error } = await db()
    .from("people")
    .select("id,name,email")
    .ilike("email", email.trim())
    .maybeSingle();
  if (error) throw new DbError("findPersonByEmail failed", error);
  return data as PersonRow | null;
}

export const supabaseIdentityProvider: IdentityProvider = {
  async getPersonBySessionToken(token) {
    const { data: session, error: sessionError } = await db()
      .from("sessions")
      .select("person_id")
      .eq("token", token)
      .maybeSingle();
    if (sessionError) throw new DbError("getPersonBySessionToken: session lookup failed", sessionError);
    if (!session) return null;
    return supabaseIdentityProvider.getPerson((session as { person_id: string }).person_id);
  },

  async getPerson(personId) {
    const { data, error } = await db().from("people").select("id,name,email").eq("id", personId).maybeSingle();
    if (error) throw new DbError("getPerson failed", error);
    return data ? toPerson(data as PersonRow) : null;
  },

  async listMembershipsForPerson(personId) {
    const { data, error } = await db()
      .from("institution_memberships")
      .select("id,institution_id,person_id,status,created_at,expires_at")
      .eq("person_id", personId);
    if (error) throw new DbError("listMembershipsForPerson failed", error);
    return (data as MembershipRow[]).map(toMembership);
  },

  async listMembershipsForInstitution(institutionId) {
    const { data, error } = await db()
      .from("institution_memberships")
      .select("id,institution_id,person_id,status,created_at,expires_at")
      .eq("institution_id", institutionId);
    if (error) throw new DbError("listMembershipsForInstitution failed", error);
    return (data as MembershipRow[]).map(toMembership);
  },

  async getInstitution(institutionId) {
    const { data, error } = await db()
      .from("institutions")
      .select("id,name,type,purpose,founder_person_id,created_at")
      .eq("id", institutionId)
      .maybeSingle();
    if (error) throw new DbError("getInstitution failed", error);
    return data ? toInstitution(data as InstitutionRow) : null;
  },

  async getMembership(personId, institutionId) {
    const { data, error } = await db()
      .from("institution_memberships")
      .select("id,institution_id,person_id,status,created_at,expires_at")
      .eq("person_id", personId)
      .eq("institution_id", institutionId)
      .maybeSingle();
    if (error) throw new DbError("getMembership failed", error);
    return data ? toMembership(data as MembershipRow) : null;
  },

  async createInstitution({ institutionName, institutionType, purpose, founderName, founderEmail }) {
    const client = db();

    const { data: personData, error: personError } = await client
      .from("people")
      .insert({ name: founderName.trim(), email: founderEmail.trim().toLowerCase() })
      .select("id,name,email")
      .single();
    if (personError) throw new DbError("createInstitution: person insert failed", personError);
    const person = toPerson(personData as PersonRow);

    const { data: institutionData, error: institutionError } = await client
      .from("institutions")
      .insert({
        name: institutionName.trim(),
        type: institutionType,
        purpose: purpose?.trim() || null,
        founder_person_id: person.id,
      })
      .select("id,name,type,purpose,founder_person_id,created_at")
      .single();
    if (institutionError) throw new DbError("createInstitution: institution insert failed", institutionError);
    const institution = toInstitution(institutionData as InstitutionRow);

    const { data: membershipData, error: membershipError } = await client
      .from("institution_memberships")
      .insert({ institution_id: institution.id, person_id: person.id, status: "active", expires_at: null })
      .select("id,institution_id,person_id,status,created_at,expires_at")
      .single();
    if (membershipError) throw new DbError("createInstitution: membership insert failed", membershipError);
    const membership = toMembership(membershipData as MembershipRow);

    const { data: sessionData, error: sessionError } = await client
      .from("sessions")
      .insert({ person_id: person.id })
      .select("token")
      .single();
    if (sessionError) throw new DbError("createInstitution: session insert failed", sessionError);

    return { institution, person, membership, token: (sessionData as { token: string }).token };
  },

  async inviteMembership(institutionId, email, name) {
    const client = db();
    const { data: institutionExists, error: institutionCheckError } = await client
      .from("institutions")
      .select("id")
      .eq("id", institutionId)
      .maybeSingle();
    if (institutionCheckError) throw new DbError("inviteMembership: institution check failed", institutionCheckError);
    if (!institutionExists) throw new Error("Institution not found.");

    let person = await findPersonByEmail(email);
    if (!person) {
      const { data, error } = await client
        .from("people")
        .insert({ name: name.trim() || email, email: email.trim().toLowerCase() })
        .select("id,name,email")
        .single();
      if (error) throw new DbError("inviteMembership: person insert failed", error);
      person = data as PersonRow;
    }

    const { data: existingData, error: existingError } = await client
      .from("institution_memberships")
      .select("id,institution_id,person_id,status,created_at,expires_at")
      .eq("person_id", person.id)
      .eq("institution_id", institutionId)
      .maybeSingle();
    if (existingError) throw new DbError("inviteMembership: existing membership lookup failed", existingError);
    const existing = existingData as MembershipRow | null;
    if (existing && existing.status !== "ended") return toMembership(existing);

    const expiresAt = new Date(Date.now() + INVITATION_LIFETIME_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const upsertPayload = {
      institution_id: institutionId,
      person_id: person.id,
      status: "invited" as const,
      expires_at: expiresAt,
    };

    const { data: membershipData, error: membershipError } = existing
      ? await client
          .from("institution_memberships")
          .update(upsertPayload)
          .eq("id", existing.id)
          .select("id,institution_id,person_id,status,created_at,expires_at")
          .single()
      : await client
          .from("institution_memberships")
          .insert(upsertPayload)
          .select("id,institution_id,person_id,status,created_at,expires_at")
          .single();
    if (membershipError) throw new DbError("inviteMembership: membership upsert failed", membershipError);
    return toMembership(membershipData as MembershipRow);
  },

  async acceptInvitation(membershipId) {
    const client = db();
    const { data: membershipData, error: membershipError } = await client
      .from("institution_memberships")
      .select("id,institution_id,person_id,status,created_at,expires_at")
      .eq("id", membershipId)
      .maybeSingle();
    if (membershipError) throw new DbError("acceptInvitation: membership lookup failed", membershipError);
    const membership = membershipData as MembershipRow | null;
    if (!membership) return { error: "Invitation not found." };
    if (membership.status === "active") return { error: "This invitation has already been accepted." };
    if (membership.status !== "invited") return { error: "This invitation is no longer valid." };
    if (membership.expires_at && new Date(membership.expires_at).getTime() < Date.now()) {
      return { error: "This invitation has expired — ask whoever invited you to send a new one." };
    }

    const { data: updatedData, error: updateError } = await client
      .from("institution_memberships")
      .update({ status: "active", expires_at: null })
      .eq("id", membershipId)
      .select("id,institution_id,person_id,status,created_at,expires_at")
      .single();
    if (updateError) throw new DbError("acceptInvitation: membership update failed", updateError);

    const person = await supabaseIdentityProvider.getPerson(membership.person_id);
    if (!person) return { error: "Person not found." };

    const { data: sessionData, error: sessionError } = await client
      .from("sessions")
      .insert({ person_id: person.id })
      .select("token")
      .single();
    if (sessionError) throw new DbError("acceptInvitation: session insert failed", sessionError);

    return { person, membership: toMembership(updatedData as MembershipRow), token: (sessionData as { token: string }).token };
  },

  async cancelInvitation(membershipId) {
    const client = db();
    const { data: membershipData, error: membershipError } = await client
      .from("institution_memberships")
      .select("id,status")
      .eq("id", membershipId)
      .maybeSingle();
    if (membershipError) throw new DbError("cancelInvitation: membership lookup failed", membershipError);
    const membership = membershipData as { id: string; status: MembershipStatus } | null;
    if (!membership) return { error: "Invitation not found." };
    if (membership.status !== "invited") return { error: "This invitation is no longer pending." };

    const { error: updateError } = await client.from("institution_memberships").update({ status: "ended" }).eq("id", membershipId);
    if (updateError) throw new DbError("cancelInvitation: membership update failed", updateError);
    return { ok: true };
  },

  async endMembership(institutionId, personId) {
    const client = db();
    const { data, error } = await client
      .from("institution_memberships")
      .select("id,status")
      .eq("institution_id", institutionId)
      .eq("person_id", personId)
      .maybeSingle();
    if (error) throw new DbError("endMembership: lookup failed", error);
    const membership = data as { id: string; status: MembershipStatus } | null;
    if (!membership || membership.status === "ended") return;
    const { error: updateError } = await client.from("institution_memberships").update({ status: "ended" }).eq("id", membership.id);
    if (updateError) throw new DbError("endMembership: update failed", updateError);
  },

  async createSessionForEmail(email) {
    const person = await findPersonByEmail(email);
    if (!person) {
      return { error: "No ARUMBU account found for that email yet — ask an admin to invite you, or create a new institution." };
    }
    const { data, error } = await db().from("sessions").insert({ person_id: person.id }).select("token").single();
    if (error) throw new DbError("createSessionForEmail: session insert failed", error);
    return { token: (data as { token: string }).token };
  },
};
