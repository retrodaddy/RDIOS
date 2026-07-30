import "server-only";
import { randomUUID } from "crypto";
import type { CommunityProvider } from "./provider";
import type { Address, Contact, DocumentRef, PointOfContact, Relationship } from "./types";

/** In-memory, dev-only — same `globalThis` singleton guard as every other
 *  mock provider this engagement. */
type Store = { contacts: Map<string, Contact> };

const g = globalThis as unknown as { __rdiosCommunityStore?: Store };

function store(): Store {
  if (!g.__rdiosCommunityStore) g.__rdiosCommunityStore = { contacts: new Map() };
  return g.__rdiosCommunityStore;
}

function withIds<T>(items: Omit<T, "id">[]): T[] {
  return items.map((item) => ({ ...item, id: randomUUID() })) as T[];
}

function findRelationship(relationshipId: string): { contact: Contact; relationship: Relationship } | null {
  for (const contact of store().contacts.values()) {
    const relationship = contact.relationships.find((r) => r.id === relationshipId);
    if (relationship) return { contact, relationship };
  }
  return null;
}

export const mockCommunityProvider: CommunityProvider = {
  async listContacts(institutionId) {
    return [...store().contacts.values()]
      .filter((c) => c.institutionId === institutionId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getContact(id) {
    return store().contacts.get(id) ?? null;
  },

  async createContact({ institutionId, kind, name, description, email, phone, addresses, notes, pointsOfContact, direction, type, createdByPersonId }) {
    const now = new Date().toISOString();
    const relationship: Relationship = {
      id: randomUUID(),
      contactId: "", // filled in below once the contact id exists
      direction,
      type: type.trim(),
      status: "active",
      startedAt: now,
      endedAt: null,
      lastActivityAt: now,
    };
    const contact: Contact = {
      id: randomUUID(),
      institutionId,
      kind,
      name: name.trim(),
      description: description?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      addresses: withIds<Address>(addresses),
      notes: notes?.trim() || null,
      pointsOfContact: kind === "organization" ? withIds<PointOfContact>(pointsOfContact) : [],
      relationships: [],
      documentRefs: [],
      status: "active",
      createdByPersonId,
      createdAt: now,
      archivedAt: null,
    };
    relationship.contactId = contact.id;
    contact.relationships.push(relationship);
    store().contacts.set(contact.id, contact);
    return contact;
  },

  async updateContact(id, patch) {
    const contact = store().contacts.get(id);
    if (!contact) return null;
    if (patch.name !== undefined) contact.name = patch.name.trim();
    if (patch.description !== undefined) contact.description = patch.description?.trim() || null;
    if (patch.email !== undefined) contact.email = patch.email?.trim() || null;
    if (patch.phone !== undefined) contact.phone = patch.phone?.trim() || null;
    if (patch.addresses !== undefined) contact.addresses = withIds<Address>(patch.addresses);
    if (patch.notes !== undefined) contact.notes = patch.notes?.trim() || null;
    if (patch.pointsOfContact !== undefined && contact.kind === "organization") {
      contact.pointsOfContact = withIds<PointOfContact>(patch.pointsOfContact);
    }
    return contact;
  },

  async archiveContact(id) {
    const contact = store().contacts.get(id);
    if (!contact) return null;
    contact.status = "archived";
    contact.archivedAt = new Date().toISOString();
    return contact;
  },

  async addRelationship(contactId, direction, type) {
    const contact = store().contacts.get(contactId);
    if (!contact) return null;
    const now = new Date().toISOString();
    const relationship: Relationship = {
      id: randomUUID(),
      contactId,
      direction,
      type: type.trim(),
      status: "active",
      startedAt: now,
      endedAt: null,
      lastActivityAt: now,
    };
    contact.relationships.push(relationship);
    return relationship;
  },

  async endRelationship(relationshipId) {
    const found = findRelationship(relationshipId);
    if (!found) return null;
    const { relationship } = found;
    relationship.status = "ended";
    relationship.endedAt = new Date().toISOString();
    relationship.lastActivityAt = relationship.endedAt;
    return relationship;
  },

  async setRelationshipStatus(relationshipId, status) {
    const found = findRelationship(relationshipId);
    if (!found) return null;
    const { relationship } = found;
    relationship.status = status;
    relationship.lastActivityAt = new Date().toISOString();
    if (status === "ended") relationship.endedAt = new Date().toISOString();
    return relationship;
  },

  async addDocumentRef(contactId, label) {
    const contact = store().contacts.get(contactId);
    if (!contact || !label.trim()) return null;
    const ref: DocumentRef = { id: randomUUID(), label: label.trim(), addedAt: new Date().toISOString() };
    contact.documentRefs.push(ref);
    return ref;
  },
};
