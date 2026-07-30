"use server";

import { getIdentityContext } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { recordHistory } from "@/os/attention/history-store";
import { PERMISSIONS, type PermissionKey } from "@/engines/authority/types";
import { mockPeopleProvider } from "./mock-provider";
import type { AppointmentType, Position } from "./types";

export type ActionResult = { ok: boolean; error?: string };
type PositionResult = { ok: true; position: Position } | { ok: false; error: string };

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
  const existing = await mockPeopleProvider.listPositions(ctx.institution.id);

  await mockPeopleProvider.createPosition({
    institutionId: ctx.institution.id,
    name,
    reportsToPositionIds: reportsTo ? [reportsTo] : [],
    ...defaultCanvasSpot(existing.length),
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

  const position = await mockPeopleProvider.createPosition({
    institutionId: ctx.institution.id,
    name,
    reportsToPositionIds: [],
    canvasX: input.canvasX,
    canvasY: input.canvasY,
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

  const position = await mockPeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  const result = await mockPeopleProvider.updatePositionParents(positionId, reportsToPositionIds);
  if (!result.ok) return { ok: false, error: result.error };

  recordHistory(ctx.institution.id, `${ctx.person.name} changed ${position.name}'s reporting line.`);
  return { ok: true };
}

/** Cosmetic layout only — never written to History, never gated. Dragging
 *  a node to a tidier spot on the canvas isn't an institutional decision;
 *  anyone looking at the chart should be able to tidy it. */
export async function movePositionAction(positionId: string, canvasX: number, canvasY: number): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const position = await mockPeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  await mockPeopleProvider.movePosition(positionId, canvasX, canvasY);
  return { ok: true };
}

export async function updatePositionDetailsAction(
  positionId: string,
  input: { name?: string; description?: string | null }
): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing positions");

  const position = await mockPeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  const renamed = input.name !== undefined && input.name.trim() !== position.name;
  await mockPeopleProvider.updatePositionDetails(positionId, input);
  if (renamed) {
    recordHistory(ctx.institution.id, `${ctx.person.name} renamed ${position.name} to ${input.name!.trim()}.`);
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

  const position = await mockPeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  const valid = responsibilities.filter((r) => (PERMISSIONS as readonly string[]).includes(r));
  await mockPeopleProvider.updatePositionResponsibilities(positionId, valid);
  recordHistory(ctx.institution.id, `${ctx.person.name} set what ${position.name} is responsible for.`);
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

  const position = await mockPeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  await mockPeopleProvider.appointHolder({ positionId, personId, appointmentType });
  const appointedName =
    personId === ctx.person.id ? "themselves" : (await mockIdentityProvider.getPerson(personId))?.name ?? "someone";
  recordHistory(ctx.institution.id, `${ctx.person.name} appointed ${appointedName} to ${position.name}.`);
  return { ok: true };
}

export async function endHolderAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Ending an appointment");

  const holderId = String(formData.get("holderId") ?? "").trim();
  if (!holderId) return { ok: false, error: "Missing holder id." };

  return mockPeopleProvider.endHolder(holderId);
}

export async function addAffiliationAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing affiliations");

  const personId = String(formData.get("personId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!personId || !label) return { ok: false, error: "Missing required fields." };

  await mockPeopleProvider.addAffiliation({ institutionId: ctx.institution.id, personId, label });
  return { ok: true };
}

export async function endAffiliationAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing affiliations");

  const affiliationId = String(formData.get("affiliationId") ?? "").trim();
  if (!affiliationId) return { ok: false, error: "Missing affiliation id." };

  return mockPeopleProvider.endAffiliation(affiliationId);
}

export async function grantCapabilityAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing capabilities");

  const personId = String(formData.get("personId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!personId || !label) return { ok: false, error: "Missing required fields." };

  await mockPeopleProvider.grantCapability({ institutionId: ctx.institution.id, personId, label });
  return { ok: true };
}

export async function revokeCapabilityAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("organization.manage")) return notResponsible("Managing capabilities");

  const capabilityId = String(formData.get("capabilityId") ?? "").trim();
  if (!capabilityId) return { ok: false, error: "Missing capability id." };

  return mockPeopleProvider.revokeCapability(capabilityId);
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

  const result = await mockPeopleProvider.offboardPerson(ctx.institution.id, personId);
  // Offboarding must mean the relationship is over, not just that the
  // Positions and Affiliations sitting on top of it are — closing this gap
  // was the single most important finding of the Product Validation Sprint:
  // an offboarded person could still sign in and read the institution.
  // Ending the Membership itself is what actually revokes access, since
  // every request re-resolves identity from a fresh, active-only lookup
  // (os/identity/session.ts) rather than trusting anything cached.
  await mockIdentityProvider.endMembership(ctx.institution.id, personId);
  const offboardedName =
    personId === ctx.person.id ? "themselves" : (await mockIdentityProvider.getPerson(personId))?.name ?? "someone";
  recordHistory(
    ctx.institution.id,
    `${ctx.person.name} offboarded ${offboardedName} (${result.closedPositions} position(s), ${result.closedAffiliations} affiliation(s) closed) — their access to ${ctx.institution.name} has ended.`
  );
  return { ok: true };
}
