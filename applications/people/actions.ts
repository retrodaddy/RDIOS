"use server";

import { getIdentityContext } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { recordHistory } from "@/os/attention/history-store";
import { mockPeopleProvider } from "./mock-provider";
import type { AppointmentType, Position } from "./types";

export type ActionResult = { ok: boolean; error?: string };
type PositionResult = { ok: true; position: Position } | { ok: false; error: string };

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
 *  `requireIdentity()`) is correct here. */
export async function createPositionAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

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

  const position = await mockPeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  await mockPeopleProvider.updatePositionParents(positionId, reportsToPositionIds);
  recordHistory(ctx.institution.id, `${ctx.person.name} changed ${position.name}'s reporting line.`);
  return { ok: true };
}

/** Cosmetic layout only — never written to History. Dragging a node to a
 *  tidier spot on the canvas isn't an institutional event. */
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

  const position = await mockPeopleProvider.getPosition(positionId);
  if (!position || position.institutionId !== ctx.institution.id) return { ok: false, error: "Position not found." };

  const renamed = input.name !== undefined && input.name.trim() !== position.name;
  await mockPeopleProvider.updatePositionDetails(positionId, input);
  if (renamed) {
    recordHistory(ctx.institution.id, `${ctx.person.name} renamed ${position.name} to ${input.name!.trim()}.`);
  }
  return { ok: true };
}

export async function appointHolderAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

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

  const holderId = String(formData.get("holderId") ?? "").trim();
  if (!holderId) return { ok: false, error: "Missing holder id." };

  return mockPeopleProvider.endHolder(holderId);
}

export async function addAffiliationAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const personId = String(formData.get("personId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!personId || !label) return { ok: false, error: "Missing required fields." };

  await mockPeopleProvider.addAffiliation({ institutionId: ctx.institution.id, personId, label });
  return { ok: true };
}

export async function endAffiliationAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const affiliationId = String(formData.get("affiliationId") ?? "").trim();
  if (!affiliationId) return { ok: false, error: "Missing affiliation id." };

  return mockPeopleProvider.endAffiliation(affiliationId);
}

export async function grantCapabilityAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const personId = String(formData.get("personId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!personId || !label) return { ok: false, error: "Missing required fields." };

  await mockPeopleProvider.grantCapability({ institutionId: ctx.institution.id, personId, label });
  return { ok: true };
}

export async function revokeCapabilityAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const capabilityId = String(formData.get("capabilityId") ?? "").trim();
  if (!capabilityId) return { ok: false, error: "Missing capability id." };

  return mockPeopleProvider.revokeCapability(capabilityId);
}

/** Atomic Offboarding — ends every active Position holding and Affiliation
 *  this person has in this institution, per the frozen People Domain
 *  Review. Always recorded to History; this is exactly the kind of
 *  institutional event the Audit Engine design named as non-optional. */
export async function offboardPersonAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const personId = String(formData.get("personId") ?? "").trim();
  if (!personId) return { ok: false, error: "Missing person id." };

  const result = await mockPeopleProvider.offboardPerson(ctx.institution.id, personId);
  const offboardedName =
    personId === ctx.person.id ? "themselves" : (await mockIdentityProvider.getPerson(personId))?.name ?? "someone";
  recordHistory(
    ctx.institution.id,
    `${ctx.person.name} offboarded ${offboardedName} (${result.closedPositions} position(s), ${result.closedAffiliations} affiliation(s) closed).`
  );
  return { ok: true };
}
