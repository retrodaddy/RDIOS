import "server-only";
import { db, DbError } from "@/lib/db/client";
import type { DocumentsProvider } from "./provider";
import type { Attachment, Document, DocumentRelationship, DocumentVersion } from "./types";

type DocumentRow = {
  id: string;
  institution_id: string;
  title: string;
  type: string;
  description: string | null;
  status: Document["status"];
  approval_status: Document["approvalStatus"];
  approval_decided_by_person_id: string | null;
  approval_decided_at: string | null;
  owner_person_id: string | null;
  document_number: string | null;
  expires_at: string | null;
  versions: DocumentVersion[];
  relationships: DocumentRelationship[];
  created_by_person_id: string;
  created_at: string;
  modified_at: string;
  archived_at: string | null;
};

function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    institutionId: row.institution_id,
    title: row.title,
    type: row.type,
    description: row.description,
    status: row.status,
    approvalStatus: row.approval_status,
    approvalDecidedByPersonId: row.approval_decided_by_person_id,
    approvalDecidedAt: row.approval_decided_at,
    ownerPersonId: row.owner_person_id,
    documentNumber: row.document_number,
    expiresAt: row.expires_at,
    versions: row.versions,
    relationships: row.relationships,
    createdByPersonId: row.created_by_person_id,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
    archivedAt: row.archived_at,
  };
}

function newAttachment(input: { filename: string; kind: Attachment["kind"] } | null): Attachment | null {
  if (!input) return null;
  return { id: crypto.randomUUID(), filename: input.filename.trim(), kind: input.kind };
}

export const supabaseDocumentsProvider: DocumentsProvider = {
  async listDocuments(institutionId) {
    const { data, error } = await db()
      .from("documents")
      .select("*")
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: false });
    if (error) throw new DbError("listDocuments failed", error);
    return (data as DocumentRow[]).map(toDocument);
  },

  async getDocument(id) {
    const { data, error } = await db().from("documents").select("*").eq("id", id).maybeSingle();
    if (error) throw new DbError("getDocument failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },

  async createDocument({ institutionId, title, type, description, ownerPersonId, documentNumber, expiresAt, createdByPersonId, initialAttachment }) {
    const now = new Date().toISOString();
    const firstVersion: DocumentVersion = {
      id: crypto.randomUUID(),
      versionNumber: 1,
      attachment: newAttachment(initialAttachment),
      notes: null,
      createdByPersonId,
      createdAt: now,
      restoredFromVersionNumber: null,
    };

    const { data, error } = await db()
      .from("documents")
      .insert({
        institution_id: institutionId,
        title: title.trim(),
        type: type.trim(),
        description: description?.trim() || null,
        status: "draft",
        approval_status: "none",
        approval_decided_by_person_id: null,
        approval_decided_at: null,
        owner_person_id: ownerPersonId,
        document_number: documentNumber?.trim() || null,
        expires_at: expiresAt,
        versions: [firstVersion],
        relationships: [],
        created_by_person_id: createdByPersonId,
        modified_at: now,
      })
      .select()
      .single();
    if (error) throw new DbError("createDocument failed", error);
    return toDocument(data as DocumentRow);
  },

  async updateDocumentDetails(id, patch) {
    const update: Record<string, unknown> = { modified_at: new Date().toISOString() };
    if (patch.title !== undefined) update.title = patch.title.trim();
    if (patch.type !== undefined) update.type = patch.type.trim();
    if (patch.description !== undefined) update.description = patch.description?.trim() || null;
    if (patch.documentNumber !== undefined) update.document_number = patch.documentNumber?.trim() || null;
    if (patch.expiresAt !== undefined) update.expires_at = patch.expiresAt;

    const { data, error } = await db().from("documents").update(update).eq("id", id).select().maybeSingle();
    if (error) throw new DbError("updateDocumentDetails failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },

  async setDocumentOwner(id, ownerPersonId) {
    const { data, error } = await db()
      .from("documents")
      .update({ owner_person_id: ownerPersonId, modified_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new DbError("setDocumentOwner failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },

  async setDocumentStatus(id, status) {
    const { data, error } = await db()
      .from("documents")
      .update({ status, modified_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new DbError("setDocumentStatus failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },

  // versionNumber is computed server-side from the live array length
  // inside one atomic UPDATE (RPC) — computing it from a prior client read
  // would let two concurrent uploads both claim the same version number.
  async addVersion(id, { attachment, notes, createdByPersonId }) {
    const { data, error } = await db().rpc("documents_add_version", {
      p_id: id,
      p_attachment: newAttachment(attachment),
      p_notes: notes?.trim() || null,
      p_created_by_person_id: createdByPersonId,
    });
    if (error) throw new DbError("addVersion failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },

  async restoreVersion(id, versionId, restoredByPersonId) {
    const { data, error } = await db().rpc("documents_restore_version", {
      p_id: id,
      p_version_id: versionId,
      p_restored_by_person_id: restoredByPersonId,
    });
    if (error) throw new DbError("restoreVersion failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },

  async addRelationship(id, relatedType, relatedId, label) {
    if (!label.trim()) return null;
    const { data, error } = await db().rpc("documents_add_relationship", {
      p_id: id,
      p_related_type: relatedType,
      p_related_id: relatedId,
      p_label: label.trim(),
    });
    if (error) throw new DbError("addRelationship failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },

  async removeRelationship(id, relationshipId) {
    const { data, error } = await db().rpc("documents_remove_relationship", { p_id: id, p_relationship_id: relationshipId });
    if (error) throw new DbError("removeRelationship failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },

  async submitForApproval(id) {
    const { data: existing, error: fetchError } = await db().from("documents").select("approval_status").eq("id", id).maybeSingle();
    if (fetchError) throw new DbError("submitForApproval fetch failed", fetchError);
    if (!existing || existing.approval_status === "pending") return null;

    const { data, error } = await db()
      .from("documents")
      .update({ approval_status: "pending", modified_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new DbError("submitForApproval failed", error);
    return toDocument(data as DocumentRow);
  },

  async decideApproval(id, decidedByPersonId, decision) {
    const { data: existing, error: fetchError } = await db().from("documents").select("approval_status").eq("id", id).maybeSingle();
    if (fetchError) throw new DbError("decideApproval fetch failed", fetchError);
    if (!existing || existing.approval_status !== "pending") return null;

    const decidedAt = new Date().toISOString();
    const update: Record<string, unknown> = {
      approval_status: decision,
      approval_decided_by_person_id: decidedByPersonId,
      approval_decided_at: decidedAt,
      modified_at: decidedAt,
    };
    if (decision === "approved") update.status = "active";

    // Guard re-checked in the UPDATE itself — a concurrent decision finds
    // 0 matching rows and returns null instead of racing to overwrite.
    const { data, error } = await db()
      .from("documents")
      .update(update)
      .eq("id", id)
      .eq("approval_status", "pending")
      .select()
      .maybeSingle();
    if (error) throw new DbError("decideApproval failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },

  async archiveDocument(id) {
    const archivedAt = new Date().toISOString();
    const { data, error } = await db()
      .from("documents")
      .update({ status: "archived", archived_at: archivedAt, modified_at: archivedAt })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new DbError("archiveDocument failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },

  async restoreDocument(id) {
    const { data, error } = await db()
      .from("documents")
      .update({ status: "active", archived_at: null, modified_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new DbError("restoreDocument failed", error);
    return data ? toDocument(data as DocumentRow) : null;
  },
};
