"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mockIdentityProvider } from "./mock-provider";
import { getIdentityContext, institutionCookieName, sessionCookieName } from "./session";
import { INSTITUTION_TYPES, type InstitutionType } from "./types";
import { recordHistory } from "@/os/attention/history-store";

export type ActionResult = { ok: boolean; error?: string };

function setSessionCookies(token: string, institutionId: string) {
  const jar = cookies();
  jar.set(sessionCookieName(), token, { httpOnly: true, sameSite: "lax", path: "/" });
  jar.set(institutionCookieName(), institutionId, { httpOnly: true, sameSite: "lax", path: "/" });
}

/** Institution Lifecycle, Day 0. Dev-mode — a real provider replaces the
 *  session mechanics; the institution/person/membership creation shape
 *  underneath stays identical. */
export async function createInstitutionAction(formData: FormData): Promise<ActionResult> {
  const institutionName = String(formData.get("institutionName") ?? "").trim();
  const institutionType = String(formData.get("institutionType") ?? "other") as InstitutionType;
  const purpose = String(formData.get("purpose") ?? "").trim();
  const founderName = String(formData.get("founderName") ?? "").trim();
  const founderEmail = String(formData.get("founderEmail") ?? "").trim();

  if (institutionName.length < 2) return { ok: false, error: "Enter your institution's name." };
  if (!INSTITUTION_TYPES.includes(institutionType)) return { ok: false, error: "Choose an institution type." };
  if (founderName.length < 2) return { ok: false, error: "Enter your name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(founderEmail)) return { ok: false, error: "Enter a valid email." };

  const { institution, token } = await mockIdentityProvider.createInstitution({
    institutionName,
    institutionType,
    purpose: purpose || undefined,
    founderName,
    founderEmail,
  });
  recordHistory(institution.id, `${founderName} created ${institution.name}.`);
  setSessionCookies(token, institution.id);
  redirect("/home");
}

/** Dev-mode login only — "continue as" an existing Person by email. Not
 *  real authentication; replaced entirely when RDIOS's own Supabase
 *  project and real Auth arrive. */
export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Enter your email." };

  const result = await mockIdentityProvider.createSessionForEmail(email);
  if ("error" in result) return { ok: false, error: result.error };

  const person = await mockIdentityProvider.getPersonBySessionToken(result.token);
  if (!person) return { ok: false, error: "Could not resolve your account." };
  const memberships = await mockIdentityProvider.listMembershipsForPerson(person.id);
  const active = memberships.find((m) => m.status === "active");
  if (!active) return { ok: false, error: "No active institution for this account yet." };

  setSessionCookies(result.token, active.institutionId);
  redirect("/home");
}

export async function signOutAction() {
  const jar = cookies();
  jar.delete(sessionCookieName());
  jar.delete(institutionCookieName());
  redirect("/login");
}

export type InviteResult = { ok: boolean; error?: string; membershipId?: string };

/** Invite a teammate — requires an active session, scoped to the current
 *  institution. The one real "invitation flow" test surface until the
 *  People application exists. */
export async function inviteAction(formData: FormData): Promise<InviteResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email." };

  const membership = await mockIdentityProvider.inviteMembership(ctx.institution.id, email, name || email);
  recordHistory(ctx.institution.id, `${ctx.person.name} invited ${name || email}.`);
  return { ok: true, membershipId: membership.id };
}

export async function acceptInvitationAction(membershipId: string): Promise<ActionResult> {
  const result = await mockIdentityProvider.acceptInvitation(membershipId);
  if ("error" in result) return { ok: false, error: result.error };
  recordHistory(result.membership.institutionId, `${result.person.name} joined.`);
  setSessionCookies(result.token, result.membership.institutionId);
  redirect("/home");
}
