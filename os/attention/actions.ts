"use server";

import { getIdentityContext } from "@/os/identity/session";
import { setOrganizationShape } from "./org-shape-store";
import { recordHistory } from "./history-store";

export type ActionResult = { ok: boolean; error?: string };

/** "Shape your organization" — the smallest real decision behind the Act
 *  Now card, per Institution Setup Experience v2. Free text, never a
 *  form-within-a-form; the real Organization Builder (Roadmap M4) replaces
 *  this once People (M3) gives it real Position data to work with. */
export async function shapeOrganizationAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const description = String(formData.get("description") ?? "").trim();
  setOrganizationShape(ctx.institution.id, description || null);
  if (description) {
    recordHistory(ctx.institution.id, `${ctx.person.name} shaped the organization.`);
  }
  return { ok: true };
}

/** Skipping is a real, permanent choice, not a snooze — per the frozen
 *  design's "never forced." It doesn't reappear, and skipping quietly is
 *  not itself an institutional event worth remembering, so nothing is
 *  written to History. */
export async function skipOrganizationShapeAction(): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  setOrganizationShape(ctx.institution.id, null);
  return { ok: true };
}
