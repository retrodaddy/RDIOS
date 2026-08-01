"use server";

import { getIdentityContext } from "@/os/identity/session";
import { recordHistory, listHistoryForSubject } from "@/os/attention/supabase-history-store";
import type { HistoryEntry } from "@/os/attention/types";
import { DbError } from "@/lib/db/client";
import { supabaseCommunityProvider } from "./supabase-provider";
import { CONTACT_KINDS, DIRECTIONS, type Address, type ContactKind, type Direction, type PointOfContact, type RelationshipStatus } from "./types";

export type ActionResult = { ok: boolean; error?: string };

const SUBJECT_TYPE = "community.contact";

function notResponsible(what: string): ActionResult {
  return { ok: false, error: `${what} isn't your responsibility here.` };
}

/** Addresses and points of contact are the only list-shaped fields on a
 *  Contact — encoded as JSON by the client, parsed and re-validated here
 *  rather than trusted; every other field on this application follows the
 *  same "never trust client input past a basic shape check" discipline
 *  Finance's server-side maths already established. */
function parseAddresses(raw: FormDataEntryValue | null): Omit<Address, "id">[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((a) => ({ label: typeof a?.label === "string" ? a.label.trim() || null : null, line: typeof a?.line === "string" ? a.line.trim() : "" }))
      .filter((a) => a.line.length > 0);
  } catch {
    return [];
  }
}

function parsePointsOfContact(raw: FormDataEntryValue | null): Omit<PointOfContact, "id">[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => ({
        name: typeof p?.name === "string" ? p.name.trim() : "",
        role: typeof p?.role === "string" ? p.role.trim() || null : null,
        email: typeof p?.email === "string" ? p.email.trim() || null : null,
        phone: typeof p?.phone === "string" ? p.phone.trim() || null : null,
      }))
      .filter((p) => p.name.length > 0);
  } catch {
    return [];
  }
}

async function getOwnedContact(id: string, institutionId: string) {
  const contact = await supabaseCommunityProvider.getContact(id);
  if (!contact || contact.institutionId !== institutionId) return null;
  return contact;
}

export async function createContactAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("community.manage")) return notResponsible("Managing community relationships");

  const kind = String(formData.get("kind") ?? "");
  if (!(CONTACT_KINDS as readonly string[]).includes(kind)) return { ok: false, error: "Choose a valid contact kind." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const direction = String(formData.get("direction") ?? "");
  if (!(DIRECTIONS as readonly string[]).includes(direction)) return { ok: false, error: "Choose a valid relationship direction." };
  const type = String(formData.get("type") ?? "").trim();
  if (!type) return { ok: false, error: "Relationship type is required." };

  const description = String(formData.get("description") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const addresses = parseAddresses(formData.get("addresses"));
  const pointsOfContact = parsePointsOfContact(formData.get("pointsOfContact"));
  const projectId = String(formData.get("projectId") ?? "").trim() || null;

  let contact: Awaited<ReturnType<typeof supabaseCommunityProvider.createContact>>;
  try {
    contact = await supabaseCommunityProvider.createContact({
      institutionId: ctx.institution.id,
      kind: kind as ContactKind,
      name,
      description,
      email,
      phone,
      addresses,
      notes,
      pointsOfContact,
      direction: direction as Direction,
      type,
      createdByPersonId: ctx.person.id,
      projectId,
    });
  } catch (err) {
    if (err instanceof DbError) return { ok: false, error: "Couldn't save this contact. Please try again." };
    throw err;
  }

  recordHistory(
    ctx.institution.id,
    `${ctx.person.name} added ${contact.name} as a ${type} relationship.`,
    { subjectType: SUBJECT_TYPE, subjectId: contact.id }
  );
  return { ok: true };
}

export async function updateContactAction(id: string, formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("community.manage")) return notResponsible("Managing community relationships");

  const contact = await getOwnedContact(id, ctx.institution.id);
  if (!contact) return { ok: false, error: "Contact not found." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };

  await supabaseCommunityProvider.updateContact(id, {
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    addresses: parseAddresses(formData.get("addresses")),
    notes: String(formData.get("notes") ?? "").trim() || null,
    pointsOfContact: parsePointsOfContact(formData.get("pointsOfContact")),
  });

  recordHistory(ctx.institution.id, `${ctx.person.name} updated ${contact.name}'s details.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: contact.id,
  });
  return { ok: true };
}

export async function archiveContactAction(id: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("community.manage")) return notResponsible("Managing community relationships");

  const contact = await getOwnedContact(id, ctx.institution.id);
  if (!contact) return { ok: false, error: "Contact not found." };

  await supabaseCommunityProvider.archiveContact(id);
  recordHistory(ctx.institution.id, `${ctx.person.name} archived ${contact.name}.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: contact.id,
  });
  return { ok: true };
}

export async function addRelationshipAction(contactId: string, direction: string, type: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("community.manage")) return notResponsible("Managing community relationships");
  if (!(DIRECTIONS as readonly string[]).includes(direction)) return { ok: false, error: "Choose a valid direction." };
  if (!type.trim()) return { ok: false, error: "Relationship type is required." };

  const contact = await getOwnedContact(contactId, ctx.institution.id);
  if (!contact) return { ok: false, error: "Contact not found." };

  await supabaseCommunityProvider.addRelationship(contactId, direction as Direction, type);
  recordHistory(ctx.institution.id, `${ctx.person.name} added a ${type} relationship for ${contact.name}.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: contact.id,
  });
  return { ok: true };
}

export async function endRelationshipAction(contactId: string, relationshipId: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("community.manage")) return notResponsible("Managing community relationships");

  const contact = await getOwnedContact(contactId, ctx.institution.id);
  if (!contact) return { ok: false, error: "Contact not found." };
  const relationship = contact.relationships.find((r) => r.id === relationshipId);
  if (!relationship) return { ok: false, error: "Relationship not found." };

  await supabaseCommunityProvider.endRelationship(relationshipId);
  recordHistory(ctx.institution.id, `${ctx.person.name} ended the ${relationship.type} relationship with ${contact.name}.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: contact.id,
  });
  return { ok: true };
}

export async function setRelationshipStatusAction(contactId: string, relationshipId: string, status: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("community.manage")) return notResponsible("Managing community relationships");

  const contact = await getOwnedContact(contactId, ctx.institution.id);
  if (!contact) return { ok: false, error: "Contact not found." };
  const relationship = contact.relationships.find((r) => r.id === relationshipId);
  if (!relationship) return { ok: false, error: "Relationship not found." };

  await supabaseCommunityProvider.setRelationshipStatus(relationshipId, status as RelationshipStatus);
  recordHistory(
    ctx.institution.id,
    `${ctx.person.name} marked the ${relationship.type} relationship with ${contact.name} as ${status}.`,
    { subjectType: SUBJECT_TYPE, subjectId: contact.id }
  );
  return { ok: true };
}

/** A Contact's own Timeline — its filtered slice of institutional History,
 *  per the Community Domain Reconsideration's six-month-test answer and
 *  the Universal Record Model's Question 5/9 conclusion: not a separate
 *  store, the same shared History read differently. */
export async function getContactHistoryAction(contactId: string): Promise<HistoryEntry[]> {
  const ctx = await getIdentityContext();
  if (!ctx) return [];
  const contact = await getOwnedContact(contactId, ctx.institution.id);
  if (!contact) return [];
  return listHistoryForSubject(ctx.institution.id, SUBJECT_TYPE, contactId);
}

/** Attaches or detaches a Contact to/from a Project — the thin seam
 *  Community exposes for M9's convergence, never a duplicate of
 *  Community's own relationship-management flow. */
export async function setContactProjectAction(contactId: string, projectId: string | null): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("community.manage")) return notResponsible("Managing community relationships");

  const contact = await getOwnedContact(contactId, ctx.institution.id);
  if (!contact) return { ok: false, error: "Contact not found." };

  await supabaseCommunityProvider.setContactProject(contactId, projectId);
  recordHistory(
    ctx.institution.id,
    projectId ? `${ctx.person.name} linked ${contact.name} to a project.` : `${ctx.person.name} unlinked ${contact.name} from its project.`,
    { subjectType: SUBJECT_TYPE, subjectId: contactId }
  );
  return { ok: true };
}

export async function addDocumentRefAction(contactId: string, label: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!label.trim()) return { ok: false, error: "Enter a document reference." };

  const contact = await getOwnedContact(contactId, ctx.institution.id);
  if (!contact) return { ok: false, error: "Contact not found." };
  if (!ctx.permissions.has("community.manage")) return notResponsible("Attaching documents");

  await supabaseCommunityProvider.addDocumentRef(contactId, label);
  return { ok: true };
}
