# ARUMBU Enterprise Infrastructure — Step 1: Persistence

**Category:** Implementation → Enterprise Infrastructure
**Status:** ACCEPTED
**Date:** 2026-08-01

## Summary

Every global in-memory mock store on the platform — all 13 application/engine
domains plus the History store, Preferences store, and Tamizhi recommendation
store — has been replaced with a real PostgreSQL-backed implementation on
Supabase (project `bbjvasiyzlfcyxxylenk`, ARUMBU org, ap-southeast-1). Every
existing `Provider` interface (and the two bare-function modules, History and
Preferences) is preserved byte-for-byte. Only a new `*-supabase-provider.ts`
/ `supabase-*.ts` file was added per domain, and only the import in
consuming files was changed. No application code, no UI component, no
server action signature, and no domain behavior changed.

RDIOS now runs against a real, durable, ACID database instead of a
`globalThis` singleton that resets on every server restart.

## What was migrated (14 stores)

| # | Domain | Real provider file |
|---|---|---|
| 1.3 | Identity & Tenant | `os/identity/supabase-provider.ts` |
| 1.5 | People & Organization | `applications/people/supabase-provider.ts` |
| 1.7 | Work (Task/Approval) | `applications/work/supabase-provider.ts` |
| 1.8 | Finance & Assets | `applications/finance/supabase-provider.ts` |
| 1.9 | Community | `applications/community/supabase-provider.ts` |
| 1.10 | Projects | `applications/projects/supabase-provider.ts` |
| 1.11 | Documents | `applications/documents/supabase-provider.ts` |
| 1.12 | Reports | `applications/reports/supabase-provider.ts` |
| 1.13 | History | `os/attention/supabase-history-store.ts` |
| 1.13 | Preferences | `os/preferences/supabase-provider.ts` |
| 1.14 | Tamizhi Recommendations | `engines/tamizhi/supabase-store.ts` |

(Task 1.6, the Authority resolver, required no new file — it already reads
through the People provider, so it inherited the real backing automatically
once verified.)

## Architecture Impact

**None on the domain model.** No new concepts were introduced anywhere in
this Step. Every table, column, and relationship is a direct, literal
translation of the TypeScript types already frozen by each domain's own
constitution/design docs:

- **Every table is institution-scoped** except `people` (deliberately
  global, per the frozen People Domain Review) and `sessions`
  (person-scoped) — this matches Product Foundation §3 exactly, no
  exceptions added.
- **Nested arrays became JSONB columns**, not normalized child tables:
  `comments`, `chain` (Approval steps), `versions` and `relationships`
  (Documents), `relationships` and `points_of_contact` (Community),
  `members` (Projects), `document_refs`, `addresses`. This is a deliberate,
  pragmatic Step 1 choice — real, durable, ACID Postgres persistence
  without the added complexity of fully normalizing every nested shape.
  Full normalization remains a legitimate future refinement, not required
  now, and nothing about the Provider interfaces would need to change to
  do it later.
- **The Capability/Position append-only asymmetry was preserved exactly**:
  Position and Affiliation always *end* (soft state, `ended_at` set), never
  disappear; Capability is the one deliberate exception and is genuinely
  `DELETE`d on revoke, per the frozen Capability Domain Reconsideration.
- **Same-actor exclusion (Governance §6)** is enforced identically wherever
  it existed before (Work Approvals, Finance Expense approval, Document
  approval) — this logic lives in each domain's `actions.ts`, untouched by
  this migration.
- **The multi-parent reporting-graph cycle check** (`isAncestorOf`) was
  reimplemented identically against a real DB-fetched snapshot of all
  Positions in an institution.

## Constitution Check

No conflict was found or forced during this Step. Every real provider is a
second implementation of an already-frozen interface — Enterprise
Foundation §4.1's own framing ("migrating persistence is writing a second
implementation of the same interface, never a rewrite") held throughout all
11 domains without exception. No Constitutional Amendment was needed.

## RLS / Security Posture (honest state, not overclaimed)

Every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` with **zero
permissive policies** — this denies all direct anon/authenticated access at
the database level. Every server action reads/writes through the Supabase
**service role** key, which structurally bypasses RLS.

**What this means honestly:** institution-scoping today is enforced by
convention in application code — the exact same discipline the mock
providers already used (`.filter(x => x.institutionId === ctx.institution.id)`
everywhere), just now against Postgres instead of a Map. It is not yet a
structural, database-level guarantee. Real `auth.uid()`-based RLS policies
that make institution isolation impossible to bypass even from a
compromised server action are explicitly Step 2 (Authentication) follow-on
work — named here, not silently claimed as already delivered.

Session mechanism is unchanged: still a custom `sessions` table
(token UUID → person_id), not yet Supabase Auth, per "Do not alter Identity
Resolution."

## Performance Impact

Not measured under load — this is a small-institution dev/test dataset, not
a benchmark. Directionally: every list/read now costs one network round-trip
to Supabase per call where it was previously an in-process Map lookup; this
is the expected, correct tradeoff for real persistence and is the same cost
every other production Postgres-backed app pays. Two Supabase migrations
were applied (`0001_rdios_core_schema`, `0002_covering_indexes_and_security_fix`)
— the second added FK covering indexes on every foreign key column
identified by the Performance Advisor, so joins and filtered lists have
index support from day one. No N+1 patterns were introduced beyond what
the mock providers already had (e.g. `Promise.all` fan-out for
per-position holder lists), which stayed structurally identical.

## Migration Notes

- **Sed-based mechanical import swaps** were used for the repetitive part
  of every migration (`mockXProvider` → `supabaseXProvider`, import path
  swap), always followed by `npx tsc --noEmit` to catch anything missed.
  Two classes of sed-collision bugs were caught and fixed this way: (1) a
  blanket `"./mock-provider"` → `"./supabase-provider"` replacement
  accidentally clobbering an unrelated relative import in a different
  domain's file (`applications/reports/analytics.ts` importing Reports'
  *own*, not-yet-swapped, mock provider) — caught by `tsc`, fixed by
  scoping later sed commands to only the files that actually needed that
  specific import changed.
- **`recordHistory` and Tamizhi's provider functions kept their original
  synchronous/async signatures unchanged.** `recordHistory` in particular
  is called fire-and-forget (no `await`) from roughly 20 call sites across
  every domain's `actions.ts`; rather than touching every call site, the
  real implementation dispatches the Postgres insert without awaiting it
  internally and logs (never throws) on failure — a history-write failure
  must never fail the action that triggered it. This was a deliberate,
  flagged pragmatic choice, not an oversight.
- **Webpack dev-cache corruption** was hit repeatedly when swapping a
  provider file while the dev server was running with stale compiled
  chunks referencing the old import; the fix each time was a full
  `preview_stop` → `rm -rf .next` → `preview_start` cycle, confirmed clean
  via `preview_logs`. This is tooling noise, not an application bug — the
  final `npx next build` (production build, no dev server, no stale
  cache) compiled all 17 routes cleanly on the first attempt.
- **Table name mismatches** were checked against the live schema before
  writing every provider, not assumed from the domain type names — this
  caught that Tamizhi's table is named `tamizhi_recommendations` (not
  `recommendations`) and that `position_holders` uses `started_at` (not
  `created_at`).

## Known Risks

1. **Institution isolation is application-enforced, not RLS-enforced**
   (see RLS section above) — a bug in any server action's `.eq("institution_id", ...)`
   filter would leak cross-institution data. Real RLS policies close this
   gap and are explicitly named as Step 2 follow-on work.
2. **JSONB nested arrays have no referential integrity** — e.g. a
   `relatedId` inside a Document's `relationships` array pointing at a
   deleted Person is not caught by a foreign key, the same soft-reference
   tradeoff the mock providers already had (never enforced there either).
3. **`recordHistory`'s fire-and-forget writes can silently fail** under
   sustained Postgres unavailability — errors are logged server-side but
   never surfaced to the person who triggered the action, since History is
   a secondary narration, not the primary effect of any action.
4. **No connection pooling tuning has been done** — `lib/db/client.ts`
   creates one Supabase client per server process via a `globalThis` guard;
   this is correct for Next.js dev/single-instance production but has not
   been load-tested against Supabase's connection limits under concurrent
   traffic.

## Verification Results

Every one of the 14 migrated stores was verified with the same rigor:
`npx tsc --noEmit` clean, `npx eslint` clean, then a live create/read/
decide walkthrough against the **actual Supabase Postgres database**
(never against the dev server's response alone) — every write was
independently confirmed with a direct `execute_sql` query against the live
table, and every UI read was confirmed to match that query's result
exactly. Multi-role flows (same-actor exclusion, cross-role approval
decisions, permission gating) were tested by switching between the real
founder account (Tanvir Ahmed, full authority) and a real non-founder
account (Farah Rahman, Position-scoped authority) signed in through the
actual login flow — not simulated.

Specific things confirmed working end-to-end against real Postgres:

- Institution creation, session persistence across page refresh, invitation
  send/accept/cancel (Task 1.4).
- Position creation, `updatePositionResponsibilities`, `appointHolder`,
  multi-parent reporting graph (Task 1.5).
- `resolvePermissions`: founder gets full authority regardless of Position;
  non-founder gets exactly their Position's `responsibilities` array — no
  more, no less (Task 1.6).
- Task creation/assignment/status transitions; Approval creation, chain
  steps, same-actor exclusion, cross-role decision (Task 1.7).
- Expense creation, same-actor-excluded approval decision, Asset
  registration (Task 1.8).
- Contact creation with bundled first Relationship (including the
  contact-id-backfill two-step insert), `addRelationship`,
  `endRelationship` (Task 1.9).
- Project creation with correct defaults, cross-verified against the
  Attention Engine's own "no owner named yet" Act Now nudge (Task 1.10).
- Document creation with first Version, `submitForApproval`,
  same-actor-excluded `decideApproval` with correct auto-transition to
  `active` status (Task 1.11).
- Report generation with a snapshot whose metrics matched every other
  domain's already-verified live data exactly; `deleteReport` (a genuine
  hard delete, per the frozen design) (Task 1.12).
- `recordHistory` fire-and-forget write + `listHistory` read-back;
  `updatePreferences` upsert (Task 1.13).
- Tamizhi `listRecommendations` (status-filtered) and `decideRecommendation`
  (Task 1.14).
- **Full regression sweep**: `npx tsc --noEmit`, `npx eslint . --ext .ts,.tsx`,
  and `npx next build` all clean across the entire project; every one of
  the 9 primary navigation destinations (`/home`, `/people`,
  `/people/organization`, `/work`, `/money`, `/customers`, `/projects`,
  `/documents`, `/reports`, `/settings`) loaded without error against a
  freshly-restarted, cache-cleared dev server; Universal Search returned
  correct, real results spanning Documents, Projects, Finance, Work, and
  History in one query — confirming every domain's real provider is
  correctly wired end-to-end, not just individually.

## What Step 1 does NOT include (explicitly out of scope, per the brief)

- Real Authentication (Google/Email/Password/Session Management) — Step 2.
- Real attachment Storage (Supabase Storage buckets) — Step 3.
- Notifications Infrastructure — Step 4.
- Background Jobs (scheduled, retries, queue) — Step 5.
- Incremental Search indexing (still a runtime scan) — Step 6.
- Observability (logging, metrics, tracing, health checks, backups) — Step 7.
- Real `auth.uid()`-based RLS policies (see Known Risks §1).

## Recommendation

Step 1 (Persistence) is complete, fully verified, and ready for founder
acceptance. Per the founder's own instruction, Step 2 (Authentication) does
not begin until Step 1 is explicitly accepted.

## Acceptance Record

**Formally accepted by the founder: 2026-08-01.**

The path to acceptance was adversarial by design, not a single sign-off:

1. **Initial implementation** — the 14-store migration described above,
   verified store-by-store as documented in "Verification Results."
2. **Independent Enterprise Verification (first pass)** — the founder
   commissioned a review explicitly instructed to argue *against*
   acceptance, from the position of an architect with no attachment to the
   implementation. It found concrete, accepted implementation bugs, not
   design objections: multi-user race conditions in every decide-style
   operation (approvals, holder appointments, recommendation decisions),
   non-atomic multi-statement writes that could partially fail, no
   automatic rollback on partial failure, and inconsistent provider-level
   error handling. **Step 1 was rejected on this basis.**
3. **Enterprise Infrastructure hardening pass** — scoped explicitly as
   hardening, not redesign: no Provider interface, domain model, schema
   design, or constitutional behavior was touched. Sixteen atomic Postgres
   RPC functions were added (migration `0003_atomic_rpc_functions`, plus a
   correctness fix in `0004_fix_add_version_server_side_number` for a
   version-number race self-caught before external review), guarded
   `UPDATE ... WHERE <precondition>` clauses were added to every
   decide-style operation to close lost-update races via row-level
   locking, a client-generated UUID closed the `createContact` two-step
   insert window, and a root `app/error.tsx` plus targeted
   provider/action-level `try/catch` around `DbError` were added for
   consistent, graceful error propagation.
4. **Independent adversarial re-review (second pass)** — instructed to
   specifically attempt to break concurrency, transaction safety, and
   rollback behavior using genuine simultaneous execution against the live
   database, not sequential calls dressed up as concurrent. It found one
   additional real race condition the hardening pass had missed: two
   concurrent *first* appointments to a vacant Position could both
   succeed, because the "close existing holder" `UPDATE` has nothing to
   lock when no prior holder row exists — reproduced empirically in 3 of
   25 concurrent trials.
5. **Fix and re-verification** — `appoint_holder` was corrected (migration
   `0005_fix_appoint_holder_vacant_position_race`) to lock the parent
   `positions` row itself before the close-and-insert, serializing every
   appointment attempt for a position regardless of whether a prior holder
   exists. Re-tested 40 consecutive rounds of concurrent first-appointment
   with zero races. Partial-failure rollback was independently verified by
   forcing a foreign-key violation mid-function and confirming the
   preceding `UPDATE` rolled back with it. Final verdict: **"I recommend
   accepting Step 1."**

**Standing status:** the Persistence layer is now a stable, accepted
foundation. Per the founder's direction, it is not to be redesigned or
revisited except for: a production bug, a constitutional conflict, a
future feature that genuinely requires it, or an Enterprise Hardening
issue demonstrated with evidence — not because a cleaner abstraction or
different implementation becomes apparent later.
