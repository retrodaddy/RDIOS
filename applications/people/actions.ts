"use server";

import { getIdentityContext } from "@/os/identity/session";
import { recordHistory } from "@/os/attention/history-store";
import { mockPeopleProvider } from "./mock-provider";
import type { AppointmentType } from "./types";

export type ActionResult = { ok: boolean; error?: string };

/** Every People mutation resolves identity first and fails closed — these
 *  are called from forms, not page loads, so `getIdentityContext()` (not
 *  `requireIdentity()`) is correct here, same discipline as
 *  `os/attention/actions.ts`. */
export async function createPositionAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Position name is required." };
  const reportsToPositionId = String(formData.get("reportsToPositionId") ?? "").trim() || null;

  await mockPeopleProvider.createPosition({ institutionId: ctx.institution.id, name, reportsToPositionId });
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
  recordHistory(ctx.institution.id, `${ctx.person.name} appointed someone to ${position.name}.`);
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
  recordHistory(
    ctx.institution.id,
    `${ctx.person.name} offboarded someone (${result.closedPositions} position(s), ${result.closedAffiliations} affiliation(s) closed).`
  );
  return { ok: true };
}
