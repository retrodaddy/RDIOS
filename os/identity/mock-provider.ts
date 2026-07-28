import "server-only";
import { randomUUID } from "crypto";
import type { IdentityProvider } from "./provider";
import type { Institution, InstitutionMembership, InstitutionType, Person } from "./types";

/**
 * In-memory Identity provider — dev-only, exists solely so RDIOS is
 * clickable before a Supabase project is provisioned (explicit founder
 * instruction: "do NOT create a Supabase project yet"). State lives for
 * the life of the dev server process only; nothing here is durable, and
 * nothing here should be mistaken for production auth. Kept behind
 * `globalThis` so Next.js's dev-mode module reloading doesn't reset it
 * mid-session, the same guard pattern used for dev-mode singleton clients
 * generally.
 */
type Store = {
  institutions: Map<string, Institution>;
  people: Map<string, Person>;
  memberships: Map<string, InstitutionMembership>;
  sessions: Map<string, string>; // token -> personId
};

const g = globalThis as unknown as { __rdiosMockStore?: Store };

function store(): Store {
  if (!g.__rdiosMockStore) {
    g.__rdiosMockStore = {
      institutions: new Map(),
      people: new Map(),
      memberships: new Map(),
      sessions: new Map(),
    };
  }
  return g.__rdiosMockStore;
}

function findPersonByEmail(email: string): Person | undefined {
  const target = email.trim().toLowerCase();
  return [...store().people.values()].find((p) => p.email.toLowerCase() === target);
}

export const mockIdentityProvider: IdentityProvider = {
  async getPersonBySessionToken(token) {
    const personId = store().sessions.get(token);
    if (!personId) return null;
    return store().people.get(personId) ?? null;
  },

  async getPerson(personId) {
    return store().people.get(personId) ?? null;
  },

  async listMembershipsForPerson(personId) {
    return [...store().memberships.values()].filter((m) => m.personId === personId);
  },

  async listMembershipsForInstitution(institutionId) {
    return [...store().memberships.values()].filter((m) => m.institutionId === institutionId);
  },

  async getInstitution(institutionId) {
    return store().institutions.get(institutionId) ?? null;
  },

  async getMembership(personId, institutionId) {
    return (
      [...store().memberships.values()].find((m) => m.personId === personId && m.institutionId === institutionId) ??
      null
    );
  },

  async createInstitution({ institutionName, institutionType, purpose, founderName, founderEmail }) {
    const s = store();
    const person: Person = { id: randomUUID(), name: founderName.trim(), email: founderEmail.trim().toLowerCase() };
    const institution: Institution = {
      id: randomUUID(),
      name: institutionName.trim(),
      type: institutionType,
      purpose: purpose?.trim() || null,
      founderPersonId: person.id,
      createdAt: new Date().toISOString(),
    };
    const membership: InstitutionMembership = {
      id: randomUUID(),
      institutionId: institution.id,
      personId: person.id,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    s.institutions.set(institution.id, institution);
    s.people.set(person.id, person);
    s.memberships.set(membership.id, membership);
    const token = randomUUID();
    s.sessions.set(token, person.id);
    return { institution, person, membership, token };
  },

  async inviteMembership(institutionId, email, name) {
    const s = store();
    const institution = s.institutions.get(institutionId);
    if (!institution) throw new Error("Institution not found.");
    let person = findPersonByEmail(email);
    if (!person) {
      person = { id: randomUUID(), name: name.trim() || email, email: email.trim().toLowerCase() };
      s.people.set(person.id, person);
    }
    const existing = [...s.memberships.values()].find((m) => m.personId === person!.id && m.institutionId === institutionId);
    if (existing) return existing;
    const membership: InstitutionMembership = {
      id: randomUUID(),
      institutionId,
      personId: person.id,
      status: "invited",
      createdAt: new Date().toISOString(),
    };
    s.memberships.set(membership.id, membership);
    return membership;
  },

  async acceptInvitation(membershipId) {
    const s = store();
    const membership = s.memberships.get(membershipId);
    if (!membership) return { error: "Invitation not found." };
    membership.status = "active";
    const person = s.people.get(membership.personId);
    if (!person) return { error: "Person not found." };
    const token = randomUUID();
    s.sessions.set(token, person.id);
    return { person, membership, token };
  },

  async createSessionForEmail(email) {
    const person = findPersonByEmail(email);
    if (!person) return { error: "No RDIOS account found for that email yet — ask an admin to invite you, or create a new institution." };
    const token = randomUUID();
    store().sessions.set(token, person.id);
    return { token };
  },
};

export type { InstitutionType };
