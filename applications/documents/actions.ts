"use server";

import { getIdentityContext } from "@/os/identity/session";
import { supabaseIdentityProvider } from "@/os/identity/supabase-provider";
import { recordHistory, listHistoryForSubject } from "@/os/attention/supabase-history-store";
import type { HistoryEntry } from "@/os/attention/types";
import { DbError } from "@/lib/db/client";
import { supabaseDocumentsProvider } from "./supabase-provider";
import type { AttachmentKind, Document, DocumentRelationshipType } from "./types";
import { ATTACHMENT_KINDS, DOCUMENT_RELATIONSHIP_TYPES } from "./types";

export type ActionResult = { ok: boolean; error?: string };

const SUBJECT_TYPE = "documents.document";

function notResponsible(what: string): ActionResult {
  return { ok: false, error: `${what} isn't your responsibility here.` };
}

async function nameOf(personId: string): Promise<string> {
  return (await supabaseIdentityProvider.getPerson(personId))?.name ?? "Someone";
}

async function getOwnedDocument(id: string, institutionId: string): Promise<Document | null> {
  const document = await supabaseDocumentsProvider.getDocument(id);
  if (!document || document.institutionId !== institutionId) return null;
  return document;
}

function parseAttachment(formData: FormData): { filename: string; kind: AttachmentKind } | null {
  const filename = String(formData.get("attachmentFilename") ?? "").trim();
  if (!filename) return null;
  const kind = String(formData.get("attachmentKind") ?? "other");
  return { filename, kind: (ATTACHMENT_KINDS as readonly string[]).includes(kind) ? (kind as AttachmentKind) : "other" };
}

export async function createDocumentAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Creating documents");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required." };
  const type = String(formData.get("type") ?? "").trim();
  if (!type) return { ok: false, error: "Type is required." };
  const description = String(formData.get("description") ?? "").trim() || null;
  const ownerPersonId = String(formData.get("ownerPersonId") ?? "").trim() || null;
  const documentNumber = String(formData.get("documentNumber") ?? "").trim() || null;
  const expiresAt = String(formData.get("expiresAt") ?? "").trim() || null;

  const document = await supabaseDocumentsProvider.createDocument({
    institutionId: ctx.institution.id,
    title,
    type,
    description,
    ownerPersonId,
    documentNumber,
    expiresAt,
    createdByPersonId: ctx.person.id,
    initialAttachment: parseAttachment(formData),
  });

  recordHistory(ctx.institution.id, `${ctx.person.name} created "${document.title}" (${document.type}).`, {
    subjectType: SUBJECT_TYPE,
    subjectId: document.id,
  });
  return { ok: true };
}

export async function updateDocumentDetailsAction(id: string, formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Managing documents");

  const document = await getOwnedDocument(id, ctx.institution.id);
  if (!document) return { ok: false, error: "Document not found." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required." };
  const type = String(formData.get("type") ?? "").trim();
  if (!type) return { ok: false, error: "Type is required." };

  await supabaseDocumentsProvider.updateDocumentDetails(id, {
    title,
    type,
    description: String(formData.get("description") ?? "").trim() || null,
    documentNumber: String(formData.get("documentNumber") ?? "").trim() || null,
    expiresAt: String(formData.get("expiresAt") ?? "").trim() || null,
  });

  recordHistory(ctx.institution.id, `${ctx.person.name} updated "${document.title}"'s details.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: document.id,
  });
  return { ok: true };
}

export async function setDocumentOwnerAction(id: string, ownerPersonId: string | null): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Managing documents");

  const document = await getOwnedDocument(id, ctx.institution.id);
  if (!document) return { ok: false, error: "Document not found." };

  await supabaseDocumentsProvider.setDocumentOwner(id, ownerPersonId);
  const name = ownerPersonId ? (ownerPersonId === ctx.person.id ? "themselves" : await nameOf(ownerPersonId)) : null;
  recordHistory(
    ctx.institution.id,
    name ? `${ctx.person.name} made ${name} the owner of "${document.title}".` : `${ctx.person.name} removed the owner from "${document.title}".`,
    { subjectType: SUBJECT_TYPE, subjectId: document.id }
  );
  return { ok: true };
}

export async function addDocumentVersionAction(id: string, formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Managing documents");

  const document = await getOwnedDocument(id, ctx.institution.id);
  if (!document) return { ok: false, error: "Document not found." };

  const attachment = parseAttachment(formData);
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!attachment && !notes) return { ok: false, error: "Add a file or a note for this version." };

  const nextVersionNumber = document.versions.length + 1;
  await supabaseDocumentsProvider.addVersion(id, { attachment, notes, createdByPersonId: ctx.person.id });
  recordHistory(ctx.institution.id, `${ctx.person.name} added version ${nextVersionNumber} of "${document.title}".`, {
    subjectType: SUBJECT_TYPE,
    subjectId: document.id,
  });
  return { ok: true };
}

export async function restoreDocumentVersionAction(id: string, versionId: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Managing documents");

  const document = await getOwnedDocument(id, ctx.institution.id);
  if (!document) return { ok: false, error: "Document not found." };
  const target = document.versions.find((v) => v.id === versionId);
  if (!target) return { ok: false, error: "Version not found." };

  await supabaseDocumentsProvider.restoreVersion(id, versionId, ctx.person.id);
  recordHistory(ctx.institution.id, `${ctx.person.name} restored "${document.title}" to version ${target.versionNumber}.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: document.id,
  });
  return { ok: true };
}

export async function addDocumentRelationshipAction(
  id: string,
  relatedType: string,
  relatedId: string,
  label: string
): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Managing documents");
  if (!(DOCUMENT_RELATIONSHIP_TYPES as readonly string[]).includes(relatedType)) return { ok: false, error: "Choose a valid type." };
  if (!relatedId || !label.trim()) return { ok: false, error: "Choose what to reference." };

  const document = await getOwnedDocument(id, ctx.institution.id);
  if (!document) return { ok: false, error: "Document not found." };

  await supabaseDocumentsProvider.addRelationship(id, relatedType as DocumentRelationshipType, relatedId, label);
  recordHistory(ctx.institution.id, `${ctx.person.name} linked "${document.title}" to ${label}.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: document.id,
  });
  return { ok: true };
}

export async function removeDocumentRelationshipAction(id: string, relationshipId: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Managing documents");

  const document = await getOwnedDocument(id, ctx.institution.id);
  if (!document) return { ok: false, error: "Document not found." };
  const relationship = document.relationships.find((r) => r.id === relationshipId);
  if (!relationship) return { ok: false, error: "Relationship not found." };

  await supabaseDocumentsProvider.removeRelationship(id, relationshipId);
  recordHistory(ctx.institution.id, `${ctx.person.name} removed the link from "${document.title}" to ${relationship.label}.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: document.id,
  });
  return { ok: true };
}

export async function submitDocumentForApprovalAction(id: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Managing documents");

  const document = await getOwnedDocument(id, ctx.institution.id);
  if (!document) return { ok: false, error: "Document not found." };
  if (document.approvalStatus === "pending") return { ok: false, error: "Already awaiting approval." };

  await supabaseDocumentsProvider.submitForApproval(id);
  recordHistory(ctx.institution.id, `${ctx.person.name} submitted "${document.title}" for approval.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: document.id,
  });
  return { ok: true };
}

/** Same-actor exclusion (Governance & Responsibility Model v1 §6), the
 *  same permanent default every other Approval-shaped decision on this
 *  platform already enforces: whoever submitted a Document for approval
 *  may never also be the one who decides it. */
export async function decideDocumentApprovalAction(id: string, decision: "approved" | "rejected"): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Managing documents");

  const document = await getOwnedDocument(id, ctx.institution.id);
  if (!document) return { ok: false, error: "Document not found." };
  if (document.approvalStatus !== "pending") return { ok: false, error: "This document isn't awaiting approval." };
  if (document.createdByPersonId === ctx.person.id) {
    return { ok: false, error: "You created this document — you can't also decide its approval." };
  }

  let result: Awaited<ReturnType<typeof supabaseDocumentsProvider.decideApproval>>;
  try {
    result = await supabaseDocumentsProvider.decideApproval(id, ctx.person.id, decision);
  } catch (err) {
    if (err instanceof DbError) return { ok: false, error: "Couldn't record this decision. Please try again." };
    throw err;
  }
  if (!result) return { ok: false, error: "Could not record this decision." };

  recordHistory(
    ctx.institution.id,
    decision === "approved" ? `${ctx.person.name} approved "${document.title}".` : `${ctx.person.name} rejected "${document.title}".`,
    { subjectType: SUBJECT_TYPE, subjectId: document.id }
  );
  return { ok: true };
}

export async function archiveDocumentAction(id: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Managing documents");

  const document = await getOwnedDocument(id, ctx.institution.id);
  if (!document) return { ok: false, error: "Document not found." };

  await supabaseDocumentsProvider.archiveDocument(id);
  recordHistory(ctx.institution.id, `${ctx.person.name} archived "${document.title}".`, {
    subjectType: SUBJECT_TYPE,
    subjectId: document.id,
  });
  return { ok: true };
}

export async function restoreDocumentAction(id: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("documents.manage")) return notResponsible("Managing documents");

  const document = await getOwnedDocument(id, ctx.institution.id);
  if (!document) return { ok: false, error: "Document not found." };
  if (document.status !== "archived") return { ok: false, error: "This document isn't archived." };

  await supabaseDocumentsProvider.restoreDocument(id);
  recordHistory(ctx.institution.id, `${ctx.person.name} restored "${document.title}" from the archive.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: document.id,
  });
  return { ok: true };
}

/** A Document's own Timeline — the same filtered-History read pattern
 *  every other Record type on the platform uses. */
export async function getDocumentHistoryAction(documentId: string): Promise<HistoryEntry[]> {
  const ctx = await getIdentityContext();
  if (!ctx) return [];
  const document = await getOwnedDocument(documentId, ctx.institution.id);
  if (!document) return [];
  return listHistoryForSubject(ctx.institution.id, SUBJECT_TYPE, documentId);
}
