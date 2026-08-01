import "server-only";
import { db, DbError } from "@/lib/db/client";
import type { CommunityProvider } from "./provider";
import type { Address, Contact, DocumentRef, PointOfContact, Relationship } from "./types";

type ContactRow = {
  id: string;
  institution_id: string;
  kind: Contact["kind"];
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  addresses: Address[];
  notes: string | null;
  points_of_contact: PointOfContact[];
  relationships: Relationship[];
  document_refs: DocumentRef[];
  status: Contact["status"];
  created_by_person_id: string;
  created_at: string;
  archived_at: string | null;
  project_id: string | null;
};

function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    institutionId: row.institution_id,
    kind: row.kind,
    name: row.name,
    description: row.description,
    email: row.email,
    phone: row.phone,
    addresses: row.addresses,
    notes: row.notes,
    pointsOfContact: row.points_of_contact,
    relationships: row.relationships,
    documentRefs: row.document_refs,
    status: row.status,
    createdByPersonId: row.created_by_person_id,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
    projectId: row.project_id,
  };
}

function withIds<T>(items: Omit<T, "id">[]): T[] {
  return items.map((item) => ({ ...item, id: crypto.randomUUID() })) as T[];
}

export const supabaseCommunityProvider: CommunityProvider = {
  async listContacts(institutionId) {
    const { data, error } = await db()
      .from("contacts")
      .select("*")
      .eq("institution_id", institutionId)
      .order("name", { ascending: true });
    if (error) throw new DbError("listContacts failed", error);
    return (data as ContactRow[]).map(toContact);
  },

  async getContact(id) {
    const { data, error } = await db().from("contacts").select("*").eq("id", id).maybeSingle();
    if (error) throw new DbError("getContact failed", error);
    return data ? toContact(data as ContactRow) : null;
  },

  async createContact({ institutionId, kind, name, description, email, phone, addresses, notes, pointsOfContact, direction, type, createdByPersonId, projectId }) {
    // The contact id is generated here, client-side, so the first
    // Relationship can carry the correct `contactId` from the start —
    // the whole row goes in with one INSERT instead of an insert then a
    // follow-up update to backfill it. This removes the window where a
    // crash between the two statements would leave a Contact with no
    // Relationship at all.
    const now = new Date().toISOString();
    const contactId = crypto.randomUUID();
    const relationship: Relationship = {
      id: crypto.randomUUID(),
      contactId,
      direction,
      type: type.trim(),
      status: "active",
      startedAt: now,
      endedAt: null,
      lastActivityAt: now,
    };

    const { data, error } = await db()
      .from("contacts")
      .insert({
        id: contactId,
        institution_id: institutionId,
        kind,
        name: name.trim(),
        description: description?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        addresses: withIds<Address>(addresses),
        notes: notes?.trim() || null,
        points_of_contact: kind === "organization" ? withIds<PointOfContact>(pointsOfContact) : [],
        relationships: [relationship],
        document_refs: [],
        status: "active",
        created_by_person_id: createdByPersonId,
        project_id: projectId,
      })
      .select()
      .single();
    if (error) throw new DbError("createContact failed", error);
    return toContact(data as ContactRow);
  },

  async updateContact(id, patch) {
    const { data: existing, error: fetchError } = await db().from("contacts").select("*").eq("id", id).maybeSingle();
    if (fetchError) throw new DbError("updateContact fetch failed", fetchError);
    if (!existing) return null;

    const update: Record<string, unknown> = {};
    if (patch.name !== undefined) update.name = patch.name.trim();
    if (patch.description !== undefined) update.description = patch.description?.trim() || null;
    if (patch.email !== undefined) update.email = patch.email?.trim() || null;
    if (patch.phone !== undefined) update.phone = patch.phone?.trim() || null;
    if (patch.addresses !== undefined) update.addresses = withIds<Address>(patch.addresses);
    if (patch.notes !== undefined) update.notes = patch.notes?.trim() || null;
    if (patch.pointsOfContact !== undefined && existing.kind === "organization") {
      update.points_of_contact = withIds<PointOfContact>(patch.pointsOfContact);
    }

    const { data, error } = await db().from("contacts").update(update).eq("id", id).select().single();
    if (error) throw new DbError("updateContact failed", error);
    return toContact(data as ContactRow);
  },

  async archiveContact(id) {
    const { data, error } = await db()
      .from("contacts")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new DbError("archiveContact failed", error);
    return data ? toContact(data as ContactRow) : null;
  },

  async addRelationship(contactId, direction, type) {
    const { data, error } = await db().rpc("contacts_add_relationship", {
      p_id: contactId,
      p_direction: direction,
      p_type: type.trim(),
    });
    if (error) throw new DbError("addRelationship failed", error);
    if (!data) return null;
    const relationships = (data as ContactRow).relationships;
    return relationships[relationships.length - 1] ?? null;
  },

  // Relationship ids are unique institution-wide and the interface never
  // passes a contactId alongside a relationshipId — the RPC reproduces
  // that same lookup-by-relationship-id-alone behavior as one atomic
  // statement instead of a fetch-every-contact-then-scan-in-JS.
  async endRelationship(relationshipId) {
    const { data, error } = await db().rpc("contacts_end_relationship", { p_relationship_id: relationshipId });
    if (error) throw new DbError("endRelationship failed", error);
    if (!data) return null;
    return (data as ContactRow).relationships.find((r) => r.id === relationshipId) ?? null;
  },

  async setRelationshipStatus(relationshipId, status) {
    const { data, error } = await db().rpc("contacts_set_relationship_status", {
      p_relationship_id: relationshipId,
      p_status: status,
    });
    if (error) throw new DbError("setRelationshipStatus failed", error);
    if (!data) return null;
    return (data as ContactRow).relationships.find((r) => r.id === relationshipId) ?? null;
  },

  async addDocumentRef(contactId, label) {
    if (!label.trim()) return null;
    const { data, error } = await db().rpc("contacts_add_document_ref", { p_id: contactId, p_label: label.trim() });
    if (error) throw new DbError("addDocumentRef failed", error);
    if (!data) return null;
    const documentRefs = (data as ContactRow).document_refs;
    return documentRefs[documentRefs.length - 1] ?? null;
  },

  async setContactProject(contactId, projectId) {
    const { data, error } = await db().from("contacts").update({ project_id: projectId }).eq("id", contactId).select().maybeSingle();
    if (error) throw new DbError("setContactProject failed", error);
    return data ? toContact(data as ContactRow) : null;
  },
};
