/**
 * Documents — M10, ARUMBU's institutional memory, built exactly per the
 * founder's own brief. Not cloud storage, not a file manager: a Document
 * represents institutional knowledge — a Policy, a Contract, a Meeting
 * Minutes, a Certificate — and a file is only one possible attachment to
 * that knowledge, never the thing itself.
 *
 * `type` is deliberately free text with suggested defaults, not a fixed
 * enum — the exact reasoning Expense.category, Relationship.type, and
 * Project.stage already established: no institution's real document
 * vocabulary fits one hardcoded list, and the brief's own examples read
 * as a starting vocabulary, not an exhaustive one.
 */

export const DOCUMENT_STATUSES = ["draft", "active", "archived"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

/** Most documents need nobody's decision — recording a Photograph or a
 *  Manual documents something that already exists, the same reasoning
 *  Finance's Income deliberately has no approval workflow. `"none"` is
 *  the default and stays the default for most documents; `"pending"` is
 *  only ever reached by deliberately submitting. */
export const DOCUMENT_APPROVAL_STATUSES = ["none", "pending", "approved", "rejected"] as const;
export type DocumentApprovalStatus = (typeof DOCUMENT_APPROVAL_STATUSES)[number];

/** The brief's own list — a starting vocabulary for the `type` datalist,
 *  not an enum. */
export const DOCUMENT_TYPE_SUGGESTIONS = [
  "Policy",
  "Meeting Minutes",
  "Purchase Order",
  "Invoice",
  "Contract",
  "Blueprint",
  "Legal Notice",
  "Certificate",
  "Drawing",
  "Manual",
  "Photograph",
  "Video",
  "Audio",
  "Research",
  "Report",
  "Presentation",
  "Spreadsheet",
  "Letter",
  "Memo",
  "Standard Operating Procedure",
  "Checklist",
  "Training Material",
] as const;

export const ATTACHMENT_KINDS = [
  "pdf",
  "image",
  "video",
  "audio",
  "spreadsheet",
  "presentation",
  "text",
  "cad",
  "other",
] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];
export const ATTACHMENT_KIND_LABELS: Record<AttachmentKind, string> = {
  pdf: "PDF",
  image: "Image",
  video: "Video",
  audio: "Audio",
  spreadsheet: "Spreadsheet",
  presentation: "Presentation",
  text: "Text",
  cad: "CAD",
  other: "Other",
};

/** A file is only one possible attachment to a Document's knowledge, per
 *  the brief's own framing — never the Document itself. Mocked exactly
 *  like every prior milestone's `DocumentRef`: a filename and kind a
 *  person records, not a real upload — no storage provider is built. */
export type Attachment = {
  id: string;
  filename: string;
  kind: AttachmentKind;
};

/** Versions are strictly append-only — "No Git. No branching. No merge
 *  conflicts," per the brief. Restoring an old version never rewrites or
 *  removes anything; it appends a fresh version carrying that old
 *  version's content, exactly the same discipline Finance's append-only
 *  ledger entries already established for a different reason (trustworthy
 *  history over editable state). The last entry in `Document.versions` is
 *  always the current one — no separate pointer to get out of sync. */
export type DocumentVersion = {
  id: string;
  versionNumber: number;
  attachment: Attachment | null;
  notes: string | null;
  createdByPersonId: string;
  createdAt: string;
  /** Set only when this version exists because an earlier version was
   *  restored — which version, so the Timeline and version list can both
   *  say so honestly instead of looking like an ordinary new version. */
  restoredFromVersionNumber: number | null;
};

/** The Universal Record Model's own polymorphic `subjectType`/`subjectId`
 *  shape, reused unchanged — a Document references another real record,
 *  never duplicates its data. One-directional: the Document names what it
 *  relates to; the referenced record (a Person, a Project, ...) carries no
 *  matching field back, so no other application's schema needed touching
 *  to build this. */
export const DOCUMENT_RELATIONSHIP_TYPES = [
  "person",
  "project",
  "transaction",
  "contact",
  "work_item",
  "asset",
] as const;
export type DocumentRelationshipType = (typeof DOCUMENT_RELATIONSHIP_TYPES)[number];
export const DOCUMENT_RELATIONSHIP_TYPE_LABELS: Record<DocumentRelationshipType, string> = {
  person: "Person",
  project: "Project",
  transaction: "Money",
  contact: "Community",
  work_item: "Work",
  asset: "Asset",
};

export type DocumentRelationship = {
  id: string;
  relatedType: DocumentRelationshipType;
  relatedId: string;
  /** A human-readable label captured at the time the reference was added
   *  — so the relationship still reads correctly even if the referenced
   *  record is later renamed, the same "don't duplicate data, but don't
   *  require a live join just to render a list" tradeoff every other
   *  reference-by-id list on the platform already makes (e.g. Finance's
   *  `acquiredViaExpenseId`). */
  label: string;
  addedAt: string;
};

export type Document = {
  id: string;
  institutionId: string;
  title: string;
  type: string;
  description: string | null;
  status: DocumentStatus;
  approvalStatus: DocumentApprovalStatus;
  approvalDecidedByPersonId: string | null;
  approvalDecidedAt: string | null;
  ownerPersonId: string | null;
  documentNumber: string | null;
  /** A real, honest field — never a manufactured urgency score. Doubles
   *  as "certificate expires" and "contract expiring," per the brief's
   *  own two examples; both are the same fact (this stops being valid on
   *  a date) read two ways depending on the document's `type`. */
  expiresAt: string | null;
  versions: DocumentVersion[];
  relationships: DocumentRelationship[];
  createdByPersonId: string;
  createdAt: string;
  modifiedAt: string;
  archivedAt: string | null;
};
