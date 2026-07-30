import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mockIdentityProvider } from "./mock-provider";
import { resolvePermissions } from "@/engines/authority/resolver";
import type { IdentityContext } from "./types";

/**
 * Tenant resolution — the one thing that has to work correctly before
 * anything else in RDIOS can, per the frozen Tenant Architecture. Resolves
 * Person, then Institution, then this Person's Membership in that specific
 * Institution, in that order, every time. Nothing downstream is ever
 * allowed to skip straight to "what can this person do" without first
 * establishing "which institution, as whom."
 */
const SESSION_COOKIE = "rdios_session";
const INSTITUTION_COOKIE = "rdios_institution";

export function sessionCookieName() {
  return SESSION_COOKIE;
}
export function institutionCookieName() {
  return INSTITUTION_COOKIE;
}

/** Resolve the current identity context, or null — never redirects. Use
 *  this on pages (like login) that must render regardless of session
 *  state.
 *
 *  Wrapped in React's `cache()` — Implementation Sprint 2.5 §8. Before
 *  this, a single request re-ran the full person → memberships →
 *  institution → permissions chain up to three times: once in the root
 *  layout (for theme/preferences), once in the workspace layout (for the
 *  Shell), and again in whichever page called `requireIdentity` itself.
 *  `cache()` memoizes this specific function for the lifetime of one
 *  request/render pass, so every one of those call sites gets the same
 *  resolved result instead of hitting the mock provider three separate
 *  times. This is exactly what `cache()` exists for — no new caching
 *  infrastructure invented, no architecture change. */
export const getIdentityContext = cache(async (): Promise<IdentityContext | null> => {
  const jar = cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const person = await mockIdentityProvider.getPersonBySessionToken(token);
  if (!person) return null;

  const memberships = await mockIdentityProvider.listMembershipsForPerson(person.id);
  const active = memberships.filter((m) => m.status === "active");
  if (active.length === 0) return null;

  const preferredInstitutionId = jar.get(INSTITUTION_COOKIE)?.value;
  const membership = active.find((m) => m.institutionId === preferredInstitutionId) ?? active[0];
  const institution = await mockIdentityProvider.getInstitution(membership.institutionId);
  if (!institution) return null;

  const permissions = await resolvePermissions(institution, person);

  return { person, institution, membership, permissions };
});

/** Gate a real RDIOS page — resolves identity or sends them to /login,
 *  exactly the shape RDE's own requirePortalUser() has already proven,
 *  now with tenant resolution as an explicit precondition rather than an
 *  implicit single-tenant assumption. */
export async function requireIdentity(next = "/home"): Promise<IdentityContext> {
  const ctx = await getIdentityContext();
  if (!ctx) redirect(`/login?next=${encodeURIComponent(next)}`);
  return ctx;
}
