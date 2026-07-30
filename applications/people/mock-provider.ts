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

/** Is `candidateId` already an ancestor of `ofId`, walking up `ofId`'s
 *  current reporting lines? Used to reject a parent assignment that would
 *  make a Position its own descendant. */
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

export const mockPeopleProvider: PeopleProvider = {
  async listPositions(institutionId) {
    return [...store().positions.values()].filter((p) => p.institutionId === institutionId);
  },

  async getPosition(positionId) {
    return store().positions.get(positionId) ?? null;
  },

  async createPosition({ institutionId, name, reportsToPositionIds, canvasX, canvasY, createdByPersonId }) {
    const position: Position = {
      id: randomUUID(),
      institutionId,
      name: name.trim(),
      description: null,
      reportsToPositionIds,
      responsibilities: [],
      canvasX,
      canvasY,
      status: "active",
      createdByPersonId,
      createdAt: new Date().toISOString(),
    };
    store().positions.set(position.id, position);
    return position;
  },

  async updatePositionDetails(positionId, { name, description }) {
    const position = store().positions.get(positionId);
    if (!position) return null;
    if (name !== undefined) position.name = name.trim();
    if (description !== undefined) position.description = description?.trim() || null;
    return position;
  },

  async updatePositionParents(positionId, reportsToPositionIds) {
    const s = store();
    const position = s.positions.get(positionId);
    if (!position) return { ok: false, error: "Position not found." };

    const allPositions = [...s.positions.values()];
    const filtered = reportsToPositionIds.filter((id) => id !== positionId);
    for (const parentId of filtered) {
      if (isAncestorOf(positionId, parentId, allPositions)) {
        return { ok: false, error: "That would create a reporting cycle." };
      }
    }

    position.reportsToPositionIds = filtered;
    return { ok: true, position };
  },

  async movePosition(positionId, canvasX, canvasY) {
    const position = store().positions.get(positionId);
    if (!position) return null;
    position.canvasX = canvasX;
    position.canvasY = canvasY;
    return position;
  },

  async updatePositionResponsibilities(positionId, responsibilities) {
    const position = store().positions.get(positionId);
    if (!position) return null;
    position.responsibilities = responsibilities;
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

  async getPositionHolder(holderId) {
    return store().holders.get(holderId) ?? null;
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

  async getAffiliation(affiliationId) {
    return store().affiliations.get(affiliationId) ?? null;
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

  async getCapability(capabilityId) {
    return store().capabilities.get(capabilityId) ?? null;
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
