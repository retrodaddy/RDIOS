import "server-only";
import { db, DbError } from "@/lib/db/client";
import type { PermissionKey } from "@/engines/authority/types";
import type { PeopleProvider } from "./provider";
import type { Affiliation, AppointmentType, Capability, Position, PositionHolder } from "./types";

/**
 * Real, Postgres-backed People provider — the second implementation of
 * `PeopleProvider`, per Enterprise Foundation §4.1. Reproduces the mock's
 * own observable behavior exactly, including the one deliberate asymmetry
 * the frozen design requires: Capability is NOT append-only (revoking it
 * is a real delete), while Position and Affiliation always end, never
 * disappear.
 */

type PositionRow = {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  reports_to_position_ids: string[];
  responsibilities: string[];
  canvas_x: number;
  canvas_y: number;
  status: "active" | "archived";
  created_by_person_id: string | null;
  created_at: string;
};

type HolderRow = {
  id: string;
  position_id: string;
  person_id: string;
  appointment_type: AppointmentType;
  started_at: string;
  ended_at: string | null;
};

type AffiliationRow = { id: string; institution_id: string; person_id: string; label: string; started_at: string; ended_at: string | null };
type CapabilityRow = { id: string; institution_id: string; person_id: string; label: string; granted_at: string };

function toPosition(r: PositionRow): Position {
  return {
    id: r.id,
    institutionId: r.institution_id,
    name: r.name,
    description: r.description,
    reportsToPositionIds: r.reports_to_position_ids ?? [],
    responsibilities: (r.responsibilities ?? []) as PermissionKey[],
    canvasX: r.canvas_x,
    canvasY: r.canvas_y,
    status: r.status,
    createdByPersonId: r.created_by_person_id,
    createdAt: r.created_at,
  };
}

function toHolder(r: HolderRow): PositionHolder {
  return { id: r.id, positionId: r.position_id, personId: r.person_id, appointmentType: r.appointment_type, startedAt: r.started_at, endedAt: r.ended_at };
}

function toAffiliation(r: AffiliationRow): Affiliation {
  return { id: r.id, institutionId: r.institution_id, personId: r.person_id, label: r.label, startedAt: r.started_at, endedAt: r.ended_at };
}

function toCapability(r: CapabilityRow): Capability {
  return { id: r.id, institutionId: r.institution_id, personId: r.person_id, label: r.label, grantedAt: r.granted_at };
}

/** Identical graph-walk the mock provider already uses — reimplemented
 *  here against a fetched snapshot of the institution's own positions,
 *  since the invariant (no Position may become its own ancestor) has to
 *  be checked against the real, current shape of the graph regardless of
 *  where that graph happens to live. */
function isAncestorOf(candidateId: string, ofId: string, positions: Position[]): boolean {
  const visited = new Set<string>();
  const stack = [ofId];
  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    const current = positions.find((p) => p.id === currentId);
    if (!current) continue;
    for (const parentId of current.reportsToPositionIds) {
      if (parentId === candidateId) return true;
      stack.push(parentId);
    }
  }
  return false;
}

export const supabasePeopleProvider: PeopleProvider = {
  async listPositions(institutionId) {
    const { data, error } = await db().from("positions").select("*").eq("institution_id", institutionId);
    if (error) throw new DbError("listPositions failed", error);
    return (data as PositionRow[]).map(toPosition);
  },

  async getPosition(positionId) {
    const { data, error } = await db().from("positions").select("*").eq("id", positionId).maybeSingle();
    if (error) throw new DbError("getPosition failed", error);
    return data ? toPosition(data as PositionRow) : null;
  },

  async createPosition({ institutionId, name, reportsToPositionIds, canvasX, canvasY, createdByPersonId }) {
    const { data, error } = await db()
      .from("positions")
      .insert({
        institution_id: institutionId,
        name: name.trim(),
        reports_to_position_ids: reportsToPositionIds,
        responsibilities: [],
        canvas_x: canvasX,
        canvas_y: canvasY,
        status: "active",
        created_by_person_id: createdByPersonId,
      })
      .select("*")
      .single();
    if (error) throw new DbError("createPosition failed", error);
    return toPosition(data as PositionRow);
  },

  async updatePositionDetails(positionId, { name, description }) {
    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name.trim();
    if (description !== undefined) patch.description = description?.trim() || null;
    if (Object.keys(patch).length === 0) return supabasePeopleProvider.getPosition(positionId);
    const { data, error } = await db().from("positions").update(patch).eq("id", positionId).select("*").maybeSingle();
    if (error) throw new DbError("updatePositionDetails failed", error);
    return data ? toPosition(data as PositionRow) : null;
  },

  async updatePositionParents(positionId, reportsToPositionIds) {
    const client = db();
    const { data: positionData, error: positionError } = await client.from("positions").select("*").eq("id", positionId).maybeSingle();
    if (positionError) throw new DbError("updatePositionParents: lookup failed", positionError);
    const positionRow = positionData as PositionRow | null;
    if (!positionRow) return { ok: false, error: "Position not found." };

    const { data: allData, error: allError } = await client.from("positions").select("*").eq("institution_id", positionRow.institution_id);
    if (allError) throw new DbError("updatePositionParents: institution scan failed", allError);
    const allPositions = (allData as PositionRow[]).map(toPosition);

    const filtered = reportsToPositionIds.filter((id) => id !== positionId);
    for (const parentId of filtered) {
      if (isAncestorOf(positionId, parentId, allPositions)) {
        return { ok: false, error: "That would create a reporting cycle." };
      }
    }

    const { data: updatedData, error: updateError } = await client
      .from("positions")
      .update({ reports_to_position_ids: filtered })
      .eq("id", positionId)
      .select("*")
      .single();
    if (updateError) throw new DbError("updatePositionParents: update failed", updateError);
    return { ok: true, position: toPosition(updatedData as PositionRow) };
  },

  async movePosition(positionId, canvasX, canvasY) {
    const { data, error } = await db()
      .from("positions")
      .update({ canvas_x: canvasX, canvas_y: canvasY })
      .eq("id", positionId)
      .select("*")
      .maybeSingle();
    if (error) throw new DbError("movePosition failed", error);
    return data ? toPosition(data as PositionRow) : null;
  },

  async updatePositionResponsibilities(positionId, responsibilities) {
    const { data, error } = await db()
      .from("positions")
      .update({ responsibilities })
      .eq("id", positionId)
      .select("*")
      .maybeSingle();
    if (error) throw new DbError("updatePositionResponsibilities failed", error);
    return data ? toPosition(data as PositionRow) : null;
  },

  async listPositionHolders(positionId) {
    const { data, error } = await db()
      .from("position_holders")
      .select("*")
      .eq("position_id", positionId)
      .order("started_at", { ascending: false });
    if (error) throw new DbError("listPositionHolders failed", error);
    return (data as HolderRow[]).map(toHolder);
  },

  async listPositionHoldersForPerson(personId) {
    const { data, error } = await db()
      .from("position_holders")
      .select("*")
      .eq("person_id", personId)
      .order("started_at", { ascending: false });
    if (error) throw new DbError("listPositionHoldersForPerson failed", error);
    return (data as HolderRow[]).map(toHolder);
  },

  /** Closing the prior holder and inserting the new one happens inside a
   *  single Postgres function (`appoint_holder`), not as two separate
   *  round trips — this is what actually guarantees at most one active
   *  holder per Position under concurrent appointments; two sequential
   *  client-side statements could not. */
  async appointHolder({ positionId, personId, appointmentType }) {
    const { data, error } = await db().rpc("appoint_holder", {
      p_position_id: positionId,
      p_person_id: personId,
      p_appointment_type: appointmentType,
    });
    if (error) throw new DbError("appointHolder failed", error);
    return toHolder(data as HolderRow);
  },

  async getPositionHolder(holderId) {
    const { data, error } = await db().from("position_holders").select("*").eq("id", holderId).maybeSingle();
    if (error) throw new DbError("getPositionHolder failed", error);
    return data ? toHolder(data as HolderRow) : null;
  },

  async endHolder(holderId) {
    const { data, error } = await db().from("position_holders").select("id,ended_at").eq("id", holderId).maybeSingle();
    if (error) throw new DbError("endHolder: lookup failed", error);
    if (!data) return { ok: false, error: "Not found." };
    if ((data as { ended_at: string | null }).ended_at) return { ok: true };
    const { error: updateError } = await db().from("position_holders").update({ ended_at: new Date().toISOString() }).eq("id", holderId);
    if (updateError) throw new DbError("endHolder: update failed", updateError);
    return { ok: true };
  },

  async listAffiliationsForPerson(personId) {
    const { data, error } = await db()
      .from("affiliations")
      .select("*")
      .eq("person_id", personId)
      .order("started_at", { ascending: false });
    if (error) throw new DbError("listAffiliationsForPerson failed", error);
    return (data as AffiliationRow[]).map(toAffiliation);
  },

  async addAffiliation({ institutionId, personId, label }) {
    const { data, error } = await db()
      .from("affiliations")
      .insert({ institution_id: institutionId, person_id: personId, label: label.trim(), ended_at: null })
      .select("*")
      .single();
    if (error) throw new DbError("addAffiliation failed", error);
    return toAffiliation(data as AffiliationRow);
  },

  async getAffiliation(affiliationId) {
    const { data, error } = await db().from("affiliations").select("*").eq("id", affiliationId).maybeSingle();
    if (error) throw new DbError("getAffiliation failed", error);
    return data ? toAffiliation(data as AffiliationRow) : null;
  },

  async endAffiliation(affiliationId) {
    const { data, error } = await db().from("affiliations").select("id,ended_at").eq("id", affiliationId).maybeSingle();
    if (error) throw new DbError("endAffiliation: lookup failed", error);
    if (!data) return { ok: false, error: "Not found." };
    if ((data as { ended_at: string | null }).ended_at) return { ok: true };
    const { error: updateError } = await db().from("affiliations").update({ ended_at: new Date().toISOString() }).eq("id", affiliationId);
    if (updateError) throw new DbError("endAffiliation: update failed", updateError);
    return { ok: true };
  },

  async listCapabilitiesForPerson(personId) {
    const { data, error } = await db().from("capabilities").select("*").eq("person_id", personId);
    if (error) throw new DbError("listCapabilitiesForPerson failed", error);
    return (data as CapabilityRow[]).map(toCapability);
  },

  async grantCapability({ institutionId, personId, label }) {
    const { data, error } = await db()
      .from("capabilities")
      .insert({ institution_id: institutionId, person_id: personId, label: label.trim() })
      .select("*")
      .single();
    if (error) throw new DbError("grantCapability failed", error);
    return toCapability(data as CapabilityRow);
  },

  async getCapability(capabilityId) {
    const { data, error } = await db().from("capabilities").select("*").eq("id", capabilityId).maybeSingle();
    if (error) throw new DbError("getCapability failed", error);
    return data ? toCapability(data as CapabilityRow) : null;
  },

  /** Genuinely deletes — Capability is deliberately not append-only, per
   *  the frozen Capability Domain Reconsideration: "a capability is an
   *  attribute of present state, not a history of holding a slot." */
  async revokeCapability(capabilityId) {
    const { data, error } = await db().from("capabilities").delete().eq("id", capabilityId).select("id");
    if (error) throw new DbError("revokeCapability failed", error);
    return (data as { id: string }[]).length > 0 ? { ok: true } : { ok: false, error: "Not found." };
  },

  /** Both closes happen inside a single Postgres function so offboarding
   *  is all-or-nothing — a network failure between the two writes can no
   *  longer leave someone's positions closed but their affiliations
   *  still open. */
  async offboardPerson(institutionId, personId) {
    const { data, error } = await db().rpc("offboard_person", {
      p_institution_id: institutionId,
      p_person_id: personId,
    });
    if (error) throw new DbError("offboardPerson failed", error);
    const row = (data as { closed_positions: number; closed_affiliations: number }[])[0];
    return { closedPositions: row?.closed_positions ?? 0, closedAffiliations: row?.closed_affiliations ?? 0 };
  },
};
