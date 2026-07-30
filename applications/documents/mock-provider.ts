import "server-only";
import { randomUUID } from "crypto";
import type { DocumentsProvider } from "./provider";
import type { Attachment, Document, DocumentRelationship, DocumentVersion } from "./types";

/** In-memory, dev-only — same `globalThis` singleton guard as every other
 *  mock provider this engagement. */
type Store = { documents: Map<string, Document> };

const g = globalThis as unknown as { __rdiosDocumentsStore?: Store };

function store(): Store {
  if (!g.__rdiosDocumentsStore) g.__rdiosDocumentsStore = { documents: new Map() };
  return g.__rdiosDocumentsStore;
}

function newAttachment(input: { filename: string; kind: Attachment["kind"] } | null): Attachment | null {
  if (!input) return null;
  return { id: randomUUID(), filename: input.filename.trim(), kind: input.kind };
}

export const mockDocumentsProvider: DocumentsProvider = {
  async listDocuments(institutionId) {
    return [...store().documents.values()]
      .filter((d) => d.institutionId === institutionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getDocument(id) {
    return store().documents.get(id) ?? null;
  },

  async createDocument({ institutionId, title, type, description, ownerPersonId, documentNumber, expiresAt, createdByPersonId, initialAttachment }) {
    const now = new Date().toISOString();
    const firstVersion: DocumentVersion = {
      id: randomUUID(),
      versionNumber: 1,
      attachment: newAttachment(initialAttachment),
      notes: null,
      createdByPersonId,
      createdAt: now,
      restoredFromVersionNumber: null,
    };
    const document: Document = {
      id: randomUUID(),
      institutionId,
      title: title.trim(),
      type: type.trim(),
      description: description?.trim() || null,
      status: "draft",
      approvalStatus: "none",
      approvalDecidedByPersonId: null,
      approvalDecidedAt: null,
      ownerPersonId,
      documentNumber: documentNumber?.trim() || null,
      expiresAt,
      versions: [firstVersion],
      relationships: [],
      createdByPersonId,
      createdAt: now,
      modifiedAt: now,
      archivedAt: null,
    };
    store().documents.set(document.id, document);
    return document;
  },

  async updateDocumentDetails(id, patch) {
    const document = store().documents.get(id);
    if (!document) return null;
    if (patch.title !== undefined) document.title = patch.title.trim();
    if (patch.type !== undefined) document.type = patch.type.trim();
    if (patch.description !== undefined) document.description = patch.description?.trim() || null;
    if (patch.documentNumber !== undefined) document.documentNumber = patch.documentNumber?.trim() || null;
    if (patch.expiresAt !== undefined) document.expiresAt = patch.expiresAt;
    document.modifiedAt = new Date().toISOString();
    return document;
  },

  async setDocumentOwner(id, ownerPersonId) {
    const document = store().documents.get(id);
    if (!document) return null;
    document.ownerPersonId = ownerPersonId;
    document.modifiedAt = new Date().toISOString();
    return document;
  },

  async setDocumentStatus(id, status) {
    const document = store().documents.get(id);
    if (!document) return null;
    document.status = status;
    document.modifiedAt = new Date().toISOString();
    return document;
  },

  async addVersion(id, { attachment, notes, createdByPersonId }) {
    const document = store().documents.get(id);
    if (!document) return null;
    const version: DocumentVersion = {
      id: randomUUID(),
      versionNumber: document.versions.length + 1,
      attachment: newAttachment(attachment),
      notes: notes?.trim() || null,
      createdByPersonId,
      createdAt: new Date().toISOString(),
      restoredFromVersionNumber: null,
    };
    document.versions.push(version);
    document.modifiedAt = version.createdAt;
    return document;
  },

  async restoreVersion(id, versionId, restoredByPersonId) {
    const document = store().documents.get(id);
    if (!document) return null;
    const target = document.versions.find((v) => v.id === versionId);
    if (!target) return null;
    const restored: DocumentVersion = {
      id: randomUUID(),
      versionNumber: document.versions.length + 1,
      attachment: target.attachment,
      notes: target.notes,
      createdByPersonId: restoredByPersonId,
      createdAt: new Date().toISOString(),
      restoredFromVersionNumber: target.versionNumber,
    };
    document.versions.push(restored);
    document.modifiedAt = restored.createdAt;
    return document;
  },

  async addRelationship(id, relatedType, relatedId, label) {
    const document = store().documents.get(id);
    if (!document || !label.trim()) return null;
    if (document.relationships.some((r) => r.relatedType === relatedType && r.relatedId === relatedId)) return document;
    const relationship: DocumentRelationship = { id: randomUUID(), relatedType, relatedId, label: label.trim(), addedAt: new Date().toISOString() };
    document.relationships.push(relationship);
    document.modifiedAt = relationship.addedAt;
    return document;
  },

  async removeRelationship(id, relationshipId) {
    const document = store().documents.get(id);
    if (!document) return null;
    document.relationships = document.relationships.filter((r) => r.id !== relationshipId);
    document.modifiedAt = new Date().toISOString();
    return document;
  },

  async submitForApproval(id) {
    const document = store().documents.get(id);
    if (!document || document.approvalStatus === "pending") return null;
    document.approvalStatus = "pending";
    document.modifiedAt = new Date().toISOString();
    return document;
  },

  async decideApproval(id, decidedByPersonId, decision) {
    const document = store().documents.get(id);
    if (!document || document.approvalStatus !== "pending") return null;
    document.approvalStatus = decision;
    document.approvalDecidedByPersonId = decidedByPersonId;
    document.approvalDecidedAt = new Date().toISOString();
    if (decision === "approved") document.status = "active";
    document.modifiedAt = document.approvalDecidedAt;
    return document;
  },

  async archiveDocument(id) {
    const document = store().documents.get(id);
    if (!document) return null;
    document.status = "archived";
    document.archivedAt = new Date().toISOString();
    document.modifiedAt = document.archivedAt;
    return document;
  },

  async restoreDocument(id) {
    const document = store().documents.get(id);
    if (!document) return null;
    document.status = "active";
    document.archivedAt = null;
    document.modifiedAt = new Date().toISOString();
    return document;
  },
};
