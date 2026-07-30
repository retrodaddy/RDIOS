import "server-only";
import type { AttachmentKind, Document, DocumentRelationshipType, DocumentStatus } from "./types";

/** The swappable contract Documents is built behind — the same discipline
 *  as every prior application's provider. Backed today by an in-memory
 *  mock; a real provider implements this exact interface later. */
export interface DocumentsProvider {
  listDocuments(institutionId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | null>;

  createDocument(input: {
    institutionId: string;
    title: string;
    type: string;
    description: string | null;
    ownerPersonId: string | null;
    documentNumber: string | null;
    expiresAt: string | null;
    createdByPersonId: string;
    /** A Document with no attachment yet is a real, valid state (pure
     *  institutional knowledge with nothing filed against it yet), but
     *  the ordinary path bundles a first version in one step, the same
     *  way Community's `createContact` bundles a first Relationship. */
    initialAttachment: { filename: string; kind: AttachmentKind } | null;
  }): Promise<Document>;

  updateDocumentDetails(
    id: string,
    patch: {
      title?: string;
      type?: string;
      description?: string | null;
      documentNumber?: string | null;
      expiresAt?: string | null;
    }
  ): Promise<Document | null>;

  setDocumentOwner(id: string, ownerPersonId: string | null): Promise<Document | null>;
  setDocumentStatus(id: string, status: DocumentStatus): Promise<Document | null>;

  addVersion(
    id: string,
    input: { attachment: { filename: string; kind: AttachmentKind } | null; notes: string | null; createdByPersonId: string }
  ): Promise<Document | null>;
  /** Appends a fresh version carrying an earlier version's content —
   *  never rewrites or removes anything already recorded. */
  restoreVersion(id: string, versionId: string, restoredByPersonId: string): Promise<Document | null>;

  addRelationship(id: string, relatedType: DocumentRelationshipType, relatedId: string, label: string): Promise<Document | null>;
  removeRelationship(id: string, relationshipId: string): Promise<Document | null>;

  submitForApproval(id: string): Promise<Document | null>;
  decideApproval(id: string, decidedByPersonId: string, decision: "approved" | "rejected"): Promise<Document | null>;

  archiveDocument(id: string): Promise<Document | null>;
  restoreDocument(id: string): Promise<Document | null>;
}
