import "server-only";
import { randomUUID } from "crypto";
import type { PeopleProvider } from "./provider";
import type { Affiliation, Capability, Position, PositionHolder } from "./types";

/** In-memory, dev-only — same `globalThis` singleton guard as every other
 *  mock provider this engagement, for the same reason (survive Next.js
 *  dev-mode module reloads). Not durable; superseded when Supabase and a
 *  real provider arrive. */
type Store = {
  positions: Map<string, Position>;
  holders: Map<string, PositionHolder>;
  affiliations: Map<string, Affiliation>;
  capabilities: Map<string, Capability>;
};

const g = globalThis as unknown as { __rdiosPeopleStore?: Store };

function store(): Store {
  if (!g.__rdiosPeopleStore) {
    g.__rdiosPeopleStore = { positions: new Map(), holders: new Map(), affiliations: new Map(), capabilities: new Map() };
  }
  return g.__rdiosPeopleStore;
}

export const mockPeopleProvider: PeopleProvider = {
  async listPositions(institutionId) {
    return [...store().positions.values()].filter((p) => p.institutionId === institutionId);
  },

  async getPosition(positionId) {
    return store().positions.get(positionId) ?? null;
  },

  async createPosition({ institutionId, name, reportsToPositionId }) {
    const position: Position = {
      id: randomUUID(),
      institutionId,
      name: name.trim(),
      reportsToPositionId,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    store().positions.set(position.id, position);
    return position;
  },

  async listPositionHolders(positionId) {
    return [...store().holders.values()]
      .filter((h) => h.positionId === positionId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },

  async listPositionHoldersForPerson(personId) {
    return [...store().holders.values()]
      .filter((h) => h.personId === personId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },

  async appointHolder({ positionId, personId, appointmentType }) {
    const s = store();
    for (const h of s.holders.values()) {
      if (h.positionId === positionId && !h.endedAt) h.endedAt = new Date().toISOString();
    }
    const holder: PositionHolder = {
      id: randomUUID(),
      positionId,
      personId,
      appointmentType,
      startedAt: new Date().toISOString(),
      endedAt: null,
    };
    s.holders.set(holder.id, holder);
    return holder;
  },

  async endHolder(holderId) {
    const holder = store().holders.get(holderId);
    if (!holder) return { ok: false, error: "Not found." };
    if (!holder.endedAt) holder.endedAt = new Date().toISOString();
    return { ok: true };
  },

  async listAffiliationsForPerson(personId) {
    return [...store().affiliations.values()]
      .filter((a) => a.personId === personId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },

  async addAffiliation({ institutionId, personId, label }) {
    const affiliation: Affiliation = {
      id: randomUUID(),
      institutionId,
      personId,
      label: label.trim(),
      startedAt: new Date().toISOString(),
      endedAt: null,
    };
    store().affiliations.set(affiliation.id, affiliation);
    return affiliation;
  },

  async endAffiliation(affiliationId) {
    const affiliation = store().affiliations.get(affiliationId);
    if (!affiliation) return { ok: false, error: "Not found." };
    if (!affiliation.endedAt) affiliation.endedAt = new Date().toISOString();
    return { ok: true };
  },

  async listCapabilitiesForPerson(personId) {
    return [...store().capabilities.values()].filter((c) => c.personId === personId);
  },

  async grantCapability({ institutionId, personId, label }) {
    const capability: Capability = {
      id: randomUUID(),
      institutionId,
      personId,
      label: label.trim(),
      grantedAt: new Date().toISOString(),
    };
    store().capabilities.set(capability.id, capability);
    return capability;
  },

  async revokeCapability(capabilityId) {
    const existed = store().capabilities.delete(capabilityId);
    return existed ? { ok: true } : { ok: false, error: "Not found." };
  },

  async offboardPerson(institutionId, personId) {
    const s = store();
    let closedPositions = 0;
    let closedAffiliations = 0;
    const now = new Date().toISOString();
    for (const h of s.holders.values()) {
      const position = s.positions.get(h.positionId);
      if (position?.institutionId === institutionId && h.personId === personId && !h.endedAt) {
        h.endedAt = now;
        closedPositions++;
      }
    }
    for (const a of s.affiliations.values()) {
      if (a.institutionId === institutionId && a.personId === personId && !a.endedAt) {
        a.endedAt = now;
        closedAffiliations++;
      }
    }
    return { closedPositions, closedAffiliations };
  },
};
