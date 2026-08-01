"use server";

import { getIdentityContext } from "@/os/identity/session";
import { supabaseIdentityProvider } from "@/os/identity/supabase-provider";
import { recordHistory, listHistoryForSubject } from "@/os/attention/supabase-history-store";
import type { HistoryEntry } from "@/os/attention/types";
import { PERMISSIONS, type PermissionKey } from "@/engines/authority/types";
import { DbError } from "@/lib/db/client";
import { supabasePeopleProvider } from "./supabase-provider";
import type { AppointmentType, Position } from "./types";

export type ActionResult = { ok: boolean; error?: string };
type PositionResult = { ok: true; position: Position } | { ok: false; error: string };

const SUBJECT_TYPE = "people.position";

/** The shared shape every responsibility check fails with — plain
 *  institutional language, never "permission denied" or "insufficient
 *  role." Per the founder's own framing: permissions exist to support
 *  responsibility, not to expose access-control mechanics. */
function notResponsible(what: string): ActionResult {
  return { ok: false, error: `${what} isn't your responsibility here.` };
}

/** A safe default so a Position created off-canvas (the roster page's
 *  simple form) still lands somewhere sane when its founder later opens
 *  the Organization Builder — staggered so it doesn't stack exactly on
 *  top of the last one created the same way. */
function defaultCanvasSpot(existingCount: number): { canvasX: number; canvasY: number } {
  const col = existingCount % 4;
  const row = Math.floor(existingCount / 4);
  return { canvasX: 80 + col * 220, canvasY: 80 + row * 160 };
}

/** Every People mutation resolves identity first and fails closed — these
 *  are called from forms, not page loads, so `getIdentityContext()` (not
 *  `requireIdentity()`) is correct here. Every mutation that changes the
 *  organization now also checks the signed-in person's real
 *  responsibility (M5) before touching anything — resolved once, on
 *  `ctx.permissions`, never re-derived per action. */
export async function createPositionAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing positions");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Position name is required." };
  const reportsTo = String(formData.get("reportsToPositionId") ?? "").trim();
  const existing = await supabasePeopleProvider.listPositions(ctx.institution.id);

  const position = await supabasePeopleProvider.createPosition({
    institutionId: ctx.institution.id,
    name,
    reportsToPositionIds: reportsTo ? [reportsTo] : [],
    createdByPersonId: ctx.person.id,
    ...defaultCanvasSpot(existing.length),
  });
  recordHistory(ctx.institution.id, `${ctx.person.name} created the position "${position.name}".`, {
    subjectType: SUBJECT_TYPE,
    subjectId: position.id,
  });
  return { ok: true };
}

/** The Organization Builder's "click empty canvas" creation path — the
 *  founder already chose where the node goes by clicking there, so the
 *  canvas coordinates come from the click, not a staggered default. */
export async function createPositionOnCanvasAction(input: {
  name: string;
  canvasX: number;
  canvasY: number;
}): Promise<PositionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return { ok: false, error: "Managing positions isn't your responsibility here." };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Position name is required." };

  const position = await supabasePeopleProvider.createPosition({
    institutionId: ctx.institution.id,
    name,
    reportsToPositionIds: [],
    canvasX: input.canvasX,
    canvasY: input.canvasY,
    createdByPersonId: ctx.person.id,
  });
  recordHistory(ctx.institution.id, `${ctx.person.name} created the position "${position.name}".`, {
    subjectType: SUBJECT_TYPE,
    subjectId: position.id,
  });
  return { ok: true, position };
}

/** Drag-to-connect always resolves to the complete new parent set —
 *  released here as one atomic write, never a single add/remove, so a
 *  drag that both adds and removes in one motion can't leave an
 *  inconsistent intermediate state. */
export async function updatePositionParentsAction(
  positionId: string,
  reportsToPositionIds: string[]
): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing positions");

  const position = await supabasePeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  const result = await supabasePeopleProvider.updatePositionParents(positionId, reportsToPositionIds);
  if (!result.ok) return { ok: false, error: result.error };

  recordHistory(ctx.institution.id, `${ctx.person.name} changed ${position.name}'s reporting line.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: positionId,
  });
  return { ok: true };
}

/** Cosmetic layout only — never written to History, never gated. Dragging
 *  a node to a tidier spot on the canvas isn't an institutional decision;
 *  anyone looking at the chart should be able to tidy it. */
export async function movePositionAction(positionId: string, canvasX: number, canvasY: number): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const position = await supabasePeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  await supabasePeopleProvider.movePosition(positionId, canvasX, canvasY);
  return { ok: true };
}

export async function updatePositionDetailsAction(
  positionId: string,
  input: { name?: string; description?: string | null }
): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing positions");

  const position = await supabasePeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  const renamed = input.name !== undefined && input.name.trim() !== position.name;
  const redescribed = input.description !== undefined && (input.description?.trim() || null) !== position.description;
  await supabasePeopleProvider.updatePositionDetails(positionId, input);
  const subject = { subjectType: SUBJECT_TYPE, subjectId: positionId };
  if (renamed) {
    recordHistory(ctx.institution.id, `${ctx.person.name} renamed ${position.name} to ${input.name!.trim()}.`, subject);
  } else if (redescribed) {
    recordHistory(ctx.institution.id, `${ctx.person.name} updated ${position.name}'s description.`, subject);
  }
  return { ok: true };
}

/** Sets what a Position is responsible for — the one action reserved for
 *  the founder alone, per the Authority Engine's bootstrap rule. Anyone
 *  who could grant themselves more responsibility through the normal
 *  "manage positions" responsibility would make responsibility itself
 *  meaningless, so this deliberately doesn't follow the same gate as
 *  every other organization edit. */
export async function updatePositionResponsibilitiesAction(
  positionId: string,
  responsibilities: PermissionKey[]
): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (ctx.institution.founderPersonId !== ctx.person.id) {
    return { ok: false, error: "Only the institution's founder can set what a position is responsible for." };
  }

  const position = await supabasePeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  const valid = responsibilities.filter((r) => (PERMISSIONS as readonly string[]).includes(r));
  await supabasePeopleProvider.updatePositionResponsibilities(positionId, valid);
  recordHistory(ctx.institution.id, `${ctx.person.name} set what ${position.name} is responsible for.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: positionId,
  });
  return { ok: true };
}

export async function appointHolderAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Appointing people");

  const positionId = String(formData.get("positionId") ?? "").trim();
  const personId = String(formData.get("personId") ?? "").trim();
  const appointmentType = String(formData.get("appointmentType") ?? "").trim() as AppointmentType;
  if (!positionId || !personId || !appointmentType) return { ok: false, error: "Missing required fields." };

  const position = await supabasePeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  try {
    await supabasePeopleProvider.appointHolder({ positionId, personId, appointmentType });
  } catch (err) {
    if (err instanceof DbError) return { ok: false, error: "Couldn't save this appointment. Please try again." };
    throw err;
  }
  const appointedName =
    personId === ctx.person.id ? "themselves" : (await supabaseIdentityProvider.getPerson(personId))?.name ?? "someone";
  recordHistory(ctx.institution.id, `${ctx.person.name} appointed ${appointedName} to ${position.name}.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: positionId,
  });
  return { ok: true };
}

/** Ending an appointment is exactly as institutionally meaningful as
 *  making one — the same discipline the Platform Integration Sprint
 *  applied everywhere: no silent state transitions. Appointing someone
 *  was always recorded; ending their holding wasn't, until now. */
export async function endHolderAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Ending an appointment");

  const holderId = String(formData.get("holderId") ?? "").trim();
  if (!holderId) return { ok: false, error: "Missing holder id." };

  const holder = await supabasePeopleProvider.getPositionHolder(holderId);
  if (!holder) return { ok: false, error: "Not found." };
  const position = await supabasePeopleProvider.getPosition(holder.positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Not found." };

  const result = await supabasePeopleProvider.endHolder(holderId);
  if (!result.ok) return result;

  const holderName =
    holder.personId === ctx.person.id
      ? "their own"
      : `${(await supabaseIdentityProvider.getPerson(holder.personId))?.name ?? "someone"}'s`;
  recordHistory(ctx.institution.id, `${ctx.person.name} ended ${holderName} time as ${position.name}.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: position.id,
  });
  return { ok: true };
}

export async function addAffiliationAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing affiliations");

  const personId = String(formData.get("personId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!personId || !label) return { ok: false, error: "Missing required fields." };

  const affiliation = await supabasePeopleProvider.addAffiliation({ institutionId: ctx.institution.id, personId, label });
  const personName = personId === ctx.person.id ? "themselves" : (await supabaseIdentityProvider.getPerson(personId))?.name ?? "someone";
  recordHistory(ctx.institution.id, `${ctx.person.name} added ${personName} as a "${affiliation.label}" affiliation.`);
  return { ok: true };
}

export async function endAffiliationAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing affiliations");

  const affiliationId = String(formData.get("affiliationId") ?? "").trim();
  if (!affiliationId) return { ok: false, error: "Missing affiliation id." };

  const affiliation = await supabasePeopleProvider.getAffiliation(affiliationId);
  if (!affiliation || affiliation.institutionId !== ctx.institution.id) return { ok: false, error: "Not found." };

  const result = await supabasePeopleProvider.endAffiliation(affiliationId);
  if (!result.ok) return result;

  const personName =
    affiliation.personId === ctx.person.id ? "their own" : `${(await supabaseIdentityProvider.getPerson(affiliation.personId))?.name ?? "someone"}'s`;
  recordHistory(ctx.institution.id, `${ctx.person.name} ended ${personName} "${affiliation.label}" affiliation.`);
  return { ok: true };
}

export async function grantCapabilityAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing capabilities");

  const personId = String(formData.get("personId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!personId || !label) return { ok: false, error: "Missing required fields." };

  const capability = await supabasePeopleProvider.grantCapability({ institutionId: ctx.institution.id, personId, label });
  const personName = personId === ctx.person.id ? "themselves" : (await supabaseIdentityProvider.getPerson(personId))?.name ?? "someone";
  recordHistory(ctx.institution.id, `${ctx.person.name} granted ${personName} the "${capability.label}" capability.`);
  return { ok: true };
}

export async function revokeCapabilityAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing capabilities");

  const capabilityId = String(formData.get("capabilityId") ?? "").trim();
  if (!capabilityId) return { ok: false, error: "Missing capability id." };

  const capability = await supabasePeopleProvider.getCapability(capabilityId);
  if (!capability || capability.institutionId !== ctx.institution.id) return { ok: false, error: "Not found." };

  const result = await supabasePeopleProvider.revokeCapability(capabilityId);
  if (!result.ok) return result;

  const personName =
    capability.personId === ctx.person.id ? "their own" : `${(await supabaseIdentityProvider.getPerson(capability.personId))?.name ?? "someone"}'s`;
  recordHistory(ctx.institution.id, `${ctx.person.name} revoked ${personName} "${capability.label}" capability.`);
  return { ok: true };
}

/** A Position's own Timeline — its filtered slice of institutional
 *  History, the same read pattern Community's Contact detail view and
 *  Work's own Timeline already use. */
export async function getPositionHistoryAction(positionId: string): Promise<HistoryEntry[]> {
  const ctx = await getIdentityContext();
  if (!ctx) return [];
  const position = await supabasePeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return [];
  return listHistoryForSubject(ctx.institution.id, SUBJECT_TYPE, positionId);
}

/** Atomic Offboarding — ends every active Position holding and Affiliation
 *  this person has in this institution, per the frozen People Domain
 *  Review. Always recorded to History; this is exactly the kind of
 *  institutional event the Audit Engine design named as non-optional.
 *  Gated by its own responsibility (M5), separate from ordinary
 *  organization editing — ending someone's standing is heavier than
 *  everyday position/holder edits. */
export async function offboardPersonAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("people.offboard")) return notResponsible("Offboarding people");

  const personId = String(formData.get("personId") ?? "").trim();
  if (!personId) return { ok: false, error: "Missing person id." };

  let result: Awaited<ReturnType<typeof supabasePeopleProvider.offboardPerson>>;
  try {
    result = await supabasePeopleProvider.offboardPerson(ctx.institution.id, personId);
  } catch (err) {
    if (err instanceof DbError) return { ok: false, error: "Couldn't complete offboarding. Please try again." };
    throw err;
  }
  // Offboarding must mean the relationship is over, not just that the
  // Positions and Affiliations sitting on top of it are — closing this gap
  // was the single most important finding of the Product Validation Sprint:
  // an offboarded person could still sign in and read the institution.
  // Ending the Membership itself is what actually revokes access, since
  // every request re-resolves identity from a fresh, active-only lookup
  // (os/identity/session.ts) rather than trusting anything cached.
  await supabaseIdentityProvider.endMembership(ctx.institution.id, personId);
  const offboardedName =
    personId === ctx.person.id ? "themselves" : (await supabaseIdentityProvider.getPerson(personId))?.name ?? "someone";
  recordHistory(
    ctx.institution.id,
    `${ctx.person.name} offboarded ${offboardedName} (${result.closedPositions} position(s), ${result.closedAffiliations} affiliation(s) closed) — their access to ${ctx.institution.name} has ended.`
  );
  return { ok: true };
}
