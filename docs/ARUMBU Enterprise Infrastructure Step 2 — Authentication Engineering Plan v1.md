# ARUMBU Enterprise Infrastructure — Step 2: Authentication (Engineering Plan)

**Category:** Planning → Enterprise Infrastructure
**Status:** Plan only — not yet implemented, not yet accepted
**Date:** 2026-08-01

This is a planning and architectural review document only. No code was
written, no database or schema was touched, and the Master Roadmap was not
updated. Its purpose is to prove Step 2 fits inside the frozen Constitution
before any implementation begins, and to give the founder a concrete basis
to accept or redirect the approach.

---

## 0. Constitution Check (summary — full version given separately in chat)

No conflict found. Enterprise Foundation v1 §2.1 already specifies Step 2's
exact shape: *"Authentication is a pluggable credential-verification layer
sitting in front of the existing, correct Identity resolution chain
(`person → active memberships → institution → permissions`)... Nothing
about that chain changes."* The Authority Engine's independence from
session/auth mechanics is structurally proven, not just claimed —
`resolvePermissions(institution, person)` takes no auth-specific input, only
an already-resolved `Institution` and `Person`. Step 1's own report names
Step 2's scope explicitly (real auth, real `auth.uid()`-based RLS). The one
open architectural question — whether server actions keep using the
service-role client or move to a user-scoped client for RLS to bind against
— is not a constitutional conflict; it is this plan's own §7/§8 to resolve.

---

## 1. Objective

Replace the current dev-mode placeholder authentication (`createSessionForEmail`
— a session created by email lookup alone, no credential of any kind) with
real, verified authentication, per Enterprise Foundation §2:

- Email + Password (hashed, never stored plain).
- Google / Microsoft federated login (never creates a `people` row directly
  — matches or provisions one by verified email only).
- OTP as both a login method and a 2FA delivery mechanism.
- TOTP as a higher-assurance, offline-capable 2FA method.
- 2FA as a per-institution policy, not a per-person toggle.
- Real session lifecycle: created, refreshed, invalidated (sign-out, admin
  revocation, password change, permission-relevant membership change),
  never silently extended past an absolute maximum.
- Real `auth.uid()`-based Row Level Security, closing Step 1's explicitly
  named "institution isolation is application-enforced, not RLS-enforced"
  risk.

The `person → active memberships → institution → permissions` resolution
chain, and everything downstream of it (Authority, Governance, Attention,
Search, History, Tamizhi), does not change.

## 2. Constitutional Dependencies

- **Product Foundation §3** — Identity is not tenant membership. Preserved:
  `Person` stays global; `InstitutionMembership` stays the thin per-tenant
  anchor. Authentication proves *who*; membership still governs *where*.
- **Product Foundation §5** — Identity as the OS Layer precondition every
  other piece depends on. Preserved: nothing downstream of
  `getIdentityContext()` is touched.
- **Platform Integration Strategy §3** — "RDIOS's own sovereign Identity;
  SSO as portable identity, never shared backend." Google/Microsoft login
  authenticates the person; ARUMBU's own Identity layer stays sovereign
  over institution membership, permissions, and session state. No core data
  lives with the external IdP.
- **Enterprise Foundation §2 (Authentication) and §3 (Authorization)** —
  the direct design source for this plan; both sections are followed
  literally rather than reinterpreted.
- **Governance & Responsibility Model v1 §6 (Same-actor exclusion)** and
  **§7 (Escalation)** — unaffected; these depend on `ctx.person.id` and
  Position holdings, both already resolved before this layer runs.
- **Constitutional Clarifications v1** — "Identity Provider" is used only
  in its ratified sense (an external authentication source: Google,
  Microsoft), never conflated with a domain's `provider.ts` interface.

## 3. Existing Architecture That Will Be Reused

- **`os/identity/session.ts`'s `getIdentityContext()` chain**, unchanged in
  structure: cookie → person → active memberships → institution →
  permissions. Only step 1 (cookie → person) changes internally.
- **`os/identity/provider.ts`'s `IdentityProvider` interface** — every
  method except the login/session-creation ones is reused as-is:
  `getPerson`, `getInstitution`, `listMembershipsForPerson`,
  `inviteMembership`, `acceptInvitation`, `cancelInvitation`,
  `endMembership`. The interface itself already documents
  `createSessionForEmail` as the one seam meant to be replaced.
- **`engines/authority/resolver.ts`'s `resolvePermissions`** — reused
  verbatim, zero changes. It already takes only `(institution, person)`.
- **The `sessions` table shape as a concept** (a Record naming person +
  expiry) — extended, not replaced, per Enterprise Foundation §2.2's
  Universal Record Model framing of a session.
- **`institution_memberships`, invitation flow (invite → pending → accept
  → active)** — unchanged, per Enterprise Foundation §2.6, which states
  this shape explicitly stays as-is.
- **`lib/db/client.ts`'s `DbError` class and error-propagation discipline**
  — reused for every new auth-related provider method, consistent with the
  hardening pass just completed in Step 1.
- **`lib/events.ts` / History recording pattern** — reused for auth events
  (sign-in, sign-out, lockout, password reset, session revocation) the same
  way every other domain already narrates its own actions.
- **Institutional Policy Model** (existing frozen doc) — reused as the
  mechanism for per-institution 2FA policy and password policy, rather than
  inventing a new configuration surface.

## 4. Infrastructure Changes Required

- **A password-hashing library** (e.g. Argon2id or bcrypt via a
  well-maintained Node binding) — new dependency, server-only.
- **A real Supabase Auth integration, OR a self-built credential layer** —
  this is the single largest open decision (see §7). If Supabase Auth is
  used: Supabase project configuration for email/password, Google OAuth,
  Microsoft OAuth providers, and OTP delivery (email/SMS provider hookup).
  If self-built: a TOTP library (e.g. `otplib`) and an OTP delivery
  integration (email at minimum; SMS is a real cost/vendor decision, not
  assumed available).
- **Rate limiting for login/OTP endpoints** — new infrastructure; Enterprise
  Foundation §2.4 requires lockout to be rate-limited, never indefinite,
  and itself written to History.
- **Environment/secrets** for whichever OAuth client IDs/secrets, OTP
  provider credentials, and (if self-built) TOTP secret encryption key are
  needed — additive to `.env.local`, no existing secret changes.
- **Session cookie mechanics stay the same shape** (httpOnly, sameSite lax,
  same two-cookie pattern for session token + preferred institution) —
  no new infrastructure needed here, just a change in what populates the
  session token.

## 5. Database Changes Required (proposed — not applied by this plan)

All additive; no existing table is altered in a way that changes its
current columns' meaning, per the "no schema redesign" constraint.

- **`sessions` table** gains: `expires_at`, `refreshed_at`,
  `device_fingerprint` (nullable), `permission_version` (see §9), and a
  distinction between a full session and a "remember device" credential
  (Enterprise Foundation §2.3) — likely a `kind` column or a separate
  `remembered_devices` table (design decision for implementation phase, not
  this plan).
- **A credential store**: either delegated entirely to Supabase Auth's own
  `auth.users` table (if that path is chosen — see §7), or a new
  `credentials` table (`person_id`, `credential_type` [password/totp],
  hashed secret, never plaintext) if self-built.
- **A `login_attempts` or `lockout_state` table** for rate-limited lockout
  tracking, per §2.4.
- **`auth.uid()`-based RLS policies** on every existing table — this is the
  larger structural change: replacing today's "RLS enabled, zero
  permissive policies" posture with real policies scoped to
  `institution_memberships` (a person may read/write a row only if they
  hold an active membership in that row's `institution_id`, with
  `people` and `sessions` scoped to the row's own person). This requires
  every real Postgres row to be reachable via a `person_id`/`institution_id`
  path RLS can evaluate — already true today, since every table already
  carries `institution_id`.
- All changes are proposed as new migrations at implementation time, applied
  the same way Step 1's migrations were: reviewed, applied via
  `apply_migration`, verified via `get_advisors`.

## 6. Provider Changes Required

- **`os/identity/provider.ts`** — the `IdentityProvider` interface gains
  new methods (exact signatures are implementation-phase work, not decided
  here): a real `signInWithPassword`, `signInWithOTP`, `verifyOTP`,
  `signInWithFederatedProvider` (Google/Microsoft), `enrollTOTP`/
  `verifyTOTP`, `refreshSession`, `revokeSession`, `revokeAllSessions`,
  `changePassword` (invalidating other sessions per §2.2), and
  `requestPasswordReset`/`resetPassword`. `createSessionForEmail` is
  retired, not kept alongside the real methods — Step 1's own precedent
  ("a second implementation of the same interface, never leaving the
  placeholder alongside it") applies here too.
- **Every other existing method on `IdentityProvider` stays untouched.**
- **`engines/authority/resolver.ts`** — zero changes. This is the whole
  point of the interface boundary proven in §3.
- **A new `os/identity/supabase-auth-provider.ts` (or equivalent)** replaces
  `supabase-provider.ts`'s login-related methods, following the exact
  pattern Step 1 established: same interface, new implementation file,
  only the import at the consuming call sites changes.

## 7. Security Model

**The one real open decision, named explicitly rather than assumed:**

Every existing real provider (`applications/*/supabase-provider.ts`,
`os/identity/supabase-provider.ts`) calls the single service-role `db()`
client from `lib/db/client.ts`, which structurally bypasses RLS by design.
Adding `auth.uid()`-based RLS policies only closes the isolation gap
described in Step 1's Known Risks §1 if requests actually flow through a
client where `auth.uid()` resolves to something — which the service-role
client never provides.

Two candidate shapes, to be decided before implementation (not decided by
this plan):

- **(A) RLS as defense-in-depth only.** Server actions keep using the
  service-role client for all reads/writes, exactly as today. New RLS
  policies exist and are correct, but the app's actual isolation guarantee
  still comes from `.eq("institution_id", ...)` application discipline —
  RLS only protects against a hypothetical future direct-client-access
  path, not against a bug in today's server-action code. Lower
  implementation cost; does not fully discharge Step 1's Known Risk §1.
- **(B) A second, user-scoped Supabase client**, constructed per-request
  using the authenticated person's real Supabase session/JWT, used for
  reads/writes that should be RLS-enforced; the service-role client is
  kept only for operations that must legitimately act across institutions
  (e.g. platform-level admin tooling, if any exists). This is what actually
  makes cross-institution leakage structurally impossible even from a
  compromised server action, closing Known Risk §1 for real. Materially
  higher implementation cost — every real provider's `db()` call sites need
  to decide which client to use, and this decision touches all 14 already-
  migrated stores from Step 1, even though their Provider interfaces don't
  change.

This plan recommends **(B)**, since (A) would let this Step claim to close
a named risk it does not actually close — but flags it explicitly as a
founder decision point, not a foregone conclusion, given its cost.

**Other security model elements:**
- Passwords: hashed at rest (Argon2id/bcrypt or delegated to Supabase Auth),
  never logged, never returned in any response.
- OAuth: standard authorization-code flow; no client secret ever reaches
  the browser.
- OTP/TOTP secrets: encrypted at rest if self-built; delegated to Supabase
  Auth's own storage if that path is chosen.
- Session tokens: unguessable (UUID or cryptographically random), same
  httpOnly/sameSite cookie discipline already in place.
- Rate limiting on login, OTP request, and password reset endpoints.

## 8. Authentication Flow

1. **Email + Password:** person submits email/password → provider verifies
   hash → on success, session created (§2.2 lifecycle) → cookies set →
   existing `getIdentityContext()` chain resolves institution/permissions
   exactly as today, unchanged.
2. **Google/Microsoft:** person completes OAuth with the external IdP →
   ARUMBU receives a verified email → matches an existing `Person` by email
   or provisions one (never conflating this with institution membership,
   per §2.1/Platform Integration Strategy §3) → session created identically
   to the password path from that point on.
3. **OTP as login:** person requests a one-time code by email/phone →
   verifies it → session created identically from that point on.
4. **2FA (OTP or TOTP), when the institution's policy requires it:**
   inserted as a second step after primary credential verification,
   before session creation — same session-creation tail either way.
5. **Session refresh:** on activity, sliding refresh up to an absolute max
   lifetime (§2.2) — never silently extended past it.
6. **Sign-out / revocation:** deletes the session (self) or marks it
   revoked (admin-initiated, per §3.7) — cookies cleared, same as today's
   `signOutAction` pattern.
7. **Password change:** invalidates every *other* session for that person
   (§2.2) — the current session survives, all others don't.
8. **Lockout:** rate-limited failed attempts → temporary lockout, written
   to History, never indefinite (§2.4). Full-lockout recovery routes
   through Governance's Escalation mechanism, not a new bespoke path.

In every case, once a session exists, `getIdentityContext()`'s downstream
chain (membership → institution → permissions) is byte-for-byte what runs
today.

## 9. Authorization Interaction With the Existing Authority Engine

**No change to `resolvePermissions()` or its call site.** The single
required addition is session invalidation on permission-relevant change,
per Enterprise Foundation §3.7: when a person's Position, Area, or
membership changes in a way that alters their authority, their active
sessions must re-resolve permissions on their next request rather than
continue on a stale cached set. Proposed mechanism: a
`permission_version` marker (per-person or per-membership) bumped whenever
a Position/Affiliation/Capability change affects that person, checked
cheaply against the session's own recorded version on each request — a
version-compare, not a full permission recomputation, avoiding a
performance regression on every request while still making the guarantee
real.

This is new infrastructure Step 2 builds, but it governs *when*
`resolvePermissions()` re-runs, never *what it computes*. The "exactly one
function, called from exactly one place" guarantee the Constitution
Ratification Review specifically proved is preserved unconditionally.

Same-actor exclusion, escalation, and every other Governance mechanism
depend only on `ctx.person.id` and Position holdings — Step 2 changes
neither.

## 10. Interaction With Search, History, Attention, Tamizhi, Governance

- **Search:** unaffected. Universal Search already runs downstream of
  `getIdentityContext()`; nothing about how it queries or ranks changes.
- **History:** gains new event types (sign-in, sign-out, lockout, password
  reset, session revocation), narrated the same way every other domain
  narrates its own actions — reusing the existing `recordHistory`
  fire-and-forget pattern, not a new mechanism.
- **Attention:** unaffected structurally. A possible net-new Act
  Now/Be Aware surface ("your session requires 2FA setup" or "an admin
  revoked one of your sessions") is a plausible future addition but not
  required for Step 2's core scope — noted as optional, not planned here.
- **Tamizhi:** unaffected. No recommendation logic depends on session
  mechanics.
- **Governance:** Escalation (§7) is reused verbatim for full-lockout
  recovery (§2.4), rather than inventing a parallel recovery mechanism.
  Same-actor exclusion (§6) is untouched, as established in §9 above.

## 11. Migration Strategy

Following the exact discipline Step 1 used — no big-bang cutover:

1. Build the new provider methods alongside the existing
   `createSessionForEmail` path, unexposed to any UI route yet.
2. Verify each new method individually against the real (non-mock)
   Supabase project, the same store-by-store rigor Step 1's Verification
   Results section documents.
3. Add RLS policies as their own migration, verified via
   `get_advisors(security)` before and after, exactly as Step 1's
   migrations were checked.
4. Swap the login/onboarding/invitation-accept UI routes to the real
   methods one at a time (password first, then OAuth, then OTP/TOTP),
   each individually verified live before moving to the next — mirroring
   Step 1's "verify at each step individually before proceeding" pattern.
5. Retire `createSessionForEmail` only after every UI entry point has been
   moved off it and verified — never delete the old path while anything
   still depends on it.
6. No mock-provider equivalent work is required here beyond what already
   exists — `mock-provider.ts` can keep its own dev-mode login unchanged,
   since it's a separate, already-accepted seam for local development
   without a live Supabase project.

## 12. Verification Strategy

Matching Step 1's now-established bar, not a lighter one:

- `npx tsc --noEmit` and `npx eslint` clean after every change.
- Live walkthrough of every new auth method against the real Supabase
  project (not just the dev server's response) — password sign-up/sign-in,
  Google OAuth round-trip, OTP request/verify, TOTP enrollment/verify,
  session refresh, sign-out, admin session revocation, password-change
  session invalidation, lockout after N failed attempts, and full-lockout
  recovery via Escalation.
- **RLS-specific verification** (new to this Step): a negative test
  confirming a person authenticated into Institution A genuinely cannot
  read or write Institution B's rows even if a server action's own
  `institution_id` filter were hypothetically removed — this is the actual
  proof RLS is structurally enforcing isolation, not just declared.
- **Concurrency verification**, per the standard Step 1's hardening pass
  established: genuine `Promise.all`-based concurrent session
  creation/revocation to confirm no race leaves two valid sessions where
  a password-change should have invalidated all-but-one, mirroring exactly
  the methodology used to catch and fix the `appoint_holder` race.
- `resolvePermissions()` regression check: confirm founder and non-founder
  permission resolution is byte-for-byte identical before and after this
  Step, proving the Authority Engine truly wasn't touched.
- Full regression sweep across every existing domain's live walkthrough,
  the same "does everything still work" pass Step 1's Task 1.15 performed.

## 13. Enterprise Risks

1. **The RLS client-shape decision (§7) is the single highest-leverage
   risk.** Choosing (A) ships Step 2 without actually closing Step 1's
   Known Risk §1, even though it would look closed on paper (policies
   exist). This must be an explicit founder decision, not a default.
2. **OAuth/OTP/SMS vendor dependency** — Google/Microsoft OAuth and OTP
   delivery (especially SMS) introduce real external dependencies and
   potential cost that didn't exist before. SMS delivery in particular is
   not assumed free or already available — needs an explicit vendor
   decision before implementation, not assumed as a detail.
3. **Session invalidation on permission change (§9) is new, previously
   untested infrastructure** — if the `permission_version` check is
   missed on any request path, a person could retain stale elevated
   permissions after being offboarded or losing a Position. This needs
   the same adversarial verification rigor as Step 1's concurrency work,
   not a single happy-path test.
4. **Migration window risk:** every existing signed-in dev-mode session
   becomes invalid once `createSessionForEmail` is retired — this is a
   one-time, coordinated cutover affecting every active user, not silent
   or gradual, and needs to be planned as a deliberate event (see §14).
5. **TOTP/offline-2FA requirement** (institutions with unreliable
   connectivity, per §2.9) adds real implementation complexity beyond a
   typical SaaS auth build — cannot be treated as a checkbox feature.
6. **Rate-limiting infrastructure is genuinely new** — no existing
   precedent in the codebase to reuse; needs its own correctness
   verification (does it actually block the Nth attempt, does it actually
   expire).

## 14. Rollback Strategy

- Every new provider method ships alongside, not instead of, the existing
  path until individually verified (§11) — at any point before the final
  cutover, reverting is simply "don't route the UI to the new method yet."
- RLS policies are additive and independently revocable: if a policy is
  found to incorrectly block legitimate access, it can be dropped or
  corrected via a follow-up migration without touching application code,
  the same way Step 1's migrations were each independently reversible.
- The final cutover step (retiring `createSessionForEmail`) is the one
  point of no easy return — planned as its own explicit, announced step
  after every other piece is independently verified, not bundled into a
  larger change. If a critical issue is found immediately after cutover,
  rollback means re-enabling the old method's route, not reverting a
  database migration — session data is additive (new columns), so no
  destructive schema change needs undoing.
- No destructive migration is proposed anywhere in §5 — every change is an
  additive column/table, consistent with never designing a Step that can't
  be safely rolled back at the database layer.

## 15. Acceptance Criteria

Step 2 is ready for the same two-pass acceptance discipline Step 1 used
(implementation → independent adversarial review → fix if needed →
re-review → accept), and should not be considered complete until:

1. Every new authentication method (password, Google, Microsoft, OTP,
   TOTP) is live-verified against the real Supabase project, not just
   type-checked.
2. `resolvePermissions()` and the full `getIdentityContext()` chain are
   confirmed byte-for-byte unchanged in behavior for every existing role
   (founder, non-founder with Positions).
3. The RLS client-shape decision (§7) has been made explicitly by the
   founder, implemented accordingly, and independently verified with a
   real cross-institution negative test — not merely "policies exist."
4. Session invalidation on permission-relevant change (§9) is proven under
   genuine concurrent access, not a single manual test.
5. Rate-limited lockout is proven to actually lock out and actually expire,
   with the attempt itself written to History.
6. `npx tsc --noEmit`, `npx eslint`, and a full live regression walkthrough
   of every existing domain are clean.
7. An independent adversarial review — instructed, as Step 1's was, to
   argue against acceptance — has run against the finished implementation
   and found no blocking Bug-classified finding.
8. The Master Roadmap is updated only after acceptance, not before, per
   the founder's own standing instruction from Step 1.

---

*This document is a plan only. No implementation, database change, schema
change, or roadmap update has occurred as part of producing it.*
