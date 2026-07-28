Status: 🟡 Living document — updated as the project moves, never frozen. This is the operational source of truth; the philosophy/architecture layer below is what it operates under, not what it contains. Open this before starting work each day.

# RDIOS Master Roadmap v1

## 1. Current Project Status — stated plainly

**Frozen (constitutional — govern every decision below, not reopened without real implementation evidence proving a flaw):**

Product Foundation v1 · Product Philosophy v1 · Experience Principles v1 · Institution Setup Experience v2 (v1 + its Reconsideration superseded/folded in) · Visual Design System v1 · People Domain Review v1 · Audit Engine Design v1 · Architecture Freeze Declaration v1.

**Built and live-verified (real code, running, click-tested this engagement):**

- Project scaffold — Next.js 14 App Router, Tailwind, TypeScript, at `G:\RDIOS`. `typecheck`/`lint`/`build` all clean.
- Identity & Tenant foundation — Person, Institution, Institution Membership types; a swappable `IdentityProvider` interface; today backed by an **in-memory mock provider only**, explicitly not durable, explicitly temporary per standing instruction not to provision Supabase yet.
- Dev-mode auth — institution creation (onboarding), email-based dev-mode login, invite, accept-invite. All four flows live-clicked end to end, including a real bug found and fixed live (Act Now's "only one here" card was checking the wrong membership count).
- Application shell — sidebar with all nine destinations, minimal top bar.
- Home — Act Now / Be Aware / History, live-verified with real narrated History entries across create/invite/accept.
- **M2 — Institution Setup Experience v2, implemented and verified.** Purpose captured as one optional sentence at onboarding, never required, rendered permanently in Be Aware. A second Act Now contributor, "Who reports to whom?" — a minimal free-text org-shape capture (deliberately not the full Position schema, which is M3/M4's job), opening inline on Home via a drawer per the Visual Design System, never a new page. Save and Skip both live-tested; Skip is permanent and writes nothing to History, matching the frozen design's "quiet unless said" rule. Verified across two institution types (a School with Purpose stated, a Company with Purpose and the org-shape card both skipped) with genuinely different Act Now/Be Aware content and zero hardcoded branching.
- **M3 — People, implemented and verified.** Position/Affiliation/Capability implemented per the frozen People Domain Review, behind a swappable `PeopleProvider` (mirroring `IdentityProvider`'s exact pattern), backed by an in-memory mock. A real roster screen (`/people`) listing every active member with their current position, and every position with its current holder. A real profile screen (`/people/[personId]`) — appoint/end a Position holder (single-parent `reportsToPositionId` only, multi-parent deferred to M4), add/end Affiliations (append-only), grant/revoke Capabilities (not append-only, per the frozen Capability Domain Reconsideration), and Atomic Offboarding (ends every active Position holding and Affiliation for that person in that institution in one action, behind a confirmation dialog since it's the one action on the screen that reads as final). Appointing to an already-filled Position correctly closes the existing holder before inserting the new one — live-verified by re-appointing the same Position and confirming the prior holder shows "Ended," not a silent overwrite. History narrates appointments and offboarding, matching M2's discipline. Live-verified with one real Position, one Affiliation, and one Capability all created, ended/revoked, and (for Position) re-appointed independently, plus a full regression pass across Home/Settings.

**Prototype, not production-grade — true today, named honestly:**

Everything above is real and working, and none of it survives a server restart. There is no database. Identity, institutions, memberships, People (Positions/Affiliations/Capabilities), and history all live in process memory. This is by explicit design (the founder's instruction to stay infrastructure-independent until Supabase is provisioned), not an oversight — but it means nothing built so far should be mistaken for durable.

**Design-only — frozen on paper, zero code:**

The Organizational Builder (multi-parent visual editor), Authority & Permissions (a real Authorization resolver), Work, Money, Customers, Projects, Documents, Reports, Tamizhi, the real Audit Engine (today's History is still an explicitly-labeled lightweight preview, not the frozen design), and the Institution Configuration Layer (terminology, Organization Templates, branding). Institution Setup v2 is now implemented for its two universal decisions (Purpose, org-shape); the Configuration Layer's per-type Organization Templates it references are still design-only — today's org-shape card is still free text, now sitting alongside real Position data it should eventually be superseded by (M4's job, not done here).

**Not yet scoped anywhere:** Developer Platform, Marketplace, Public APIs. No frozen document names these. They appear in this roadmap because the founder named them; they get their own design pass when their milestone actually approaches, not before.

---

## 2. Product Layers

| Layer | Status | Depends on | Current phase | Next milestone | Build order | Unknowns |
|---|---|---|---|---|---|---|
| Platform Foundation | Prototype | — | Live, mock-backed | Real Supabase provider swap | Done (v1) | When Supabase gets provisioned is the founder's call, not a technical blocker |
| Identity | Prototype | Platform Foundation | Live, mock-backed | Same as above | Done (v1) | Multi-institution-membership UI not yet designed in detail |
| Institutions | Prototype | Identity | Live — name, type, Purpose, minimal org-shape | People (real Positions) | M3 | None |
| People | Prototype | Institutions | Live, mock-backed — Position/Affiliation/Capability, roster + profile screens | Organization Builder | M4 | Membership-to-multiple-Positions question named open in the People Domain Review; single-parent-only today |
| Organization (Builder) | Not Started | People | Interaction model designed (Product Foundation) | Minimal Position CRUD before the visual builder | M4 | Multi-parent reporting graph is a real, different data shape than today's single-parent design references |
| Authority & Permissions | Not Started | Organization | Not designed beyond the Authorization mechanism named reusable in Product Foundation §7 | A real Authorization resolver | M5 | None known yet — genuinely first real look once People/Organization exist |
| Work | Not Started | Authority & Permissions | Not designed | — | M6 | None yet |
| Money | Not Started | Work | Not designed | — | M7 | Stakeholder-Ledger generalization named in Product Foundation, not designed in detail |
| Customers | Not Started | Work | Not designed | — | M8 | None yet |
| Projects | Not Started | Work | Not designed | — | M9 | None yet |
| Documents | Not Started | Work | Not designed | — | M10 | None yet |
| Reports | Not Started | Money, Work | Not designed | — | M11 | None yet |
| Tamizhi | Not Started | Search, Attention Contract (both exist as concepts, not yet built as reusable surfaces) | Room reserved in Visual Design System only | — | M12 | Entirely unscoped beyond "don't need to redesign anything when it arrives" |
| Developer Platform | Not Started | Stable Attention Contract + Application Layer | Not named in any frozen document | — | Unscoped | Whether this becomes public-facing or internal-only is undecided |
| Marketplace | Not Started | Developer Platform | Not named in any frozen document | — | Unscoped | Same |
| Public APIs | Not Started | Authority & Permissions | Not named in any frozen document | — | Unscoped | Same |

---

## 3. Milestones

**One deliberate deviation from a strictly module-by-module order, named explicitly:** Institution Setup's implementation (M2) comes before People (M3), even though People is the larger, more foundational application. This isn't a reordering of the frozen layer list — it's honoring the founder's own explicit instruction from the session that produced Institution Setup Experience v2: *"it becomes the next thing we build before People."* Recorded here so the sequencing reads as intentional, not inconsistent.

### M1 — Platform Foundation
**Goal:** a clickable, verified skeleton — identity, tenant resolution, shell, Home — with zero real infrastructure required.
**Deliverables:** project scaffold, mock Identity provider, dev-mode auth, application shell, Home (Act Now/Be Aware/History).
**Completion criteria:** `typecheck`/`lint`/`build` clean; full flow live-clicked (onboard → invite → accept → sign out → sign back in).
**Preconditions:** none.
**Status: Done.**

### M2 — Institution Setup Experience
**Goal:** implement the frozen Setup v2 design exactly — Purpose captured as one optional sentence at institution creation, a "shape your organization" Act Now card offering a minimal starter structure.
**Deliverables:** Purpose field on Institution (mock provider first, real schema later); Purpose rendered permanently in Be Aware; a second Act Now contributor beyond Invite, offering the simplest possible Position-shaped suggestion (does not require the full Organizational Builder to exist).
**Completion criteria:** live-tested across at least two institution types (a company and a non-company, per the independence discipline already proven this engagement) showing genuinely different Act Now content without any hardcoded branching.
**Preconditions:** M1 done.
**Status: Done.** Purpose (`os/identity/types.ts`, captured in `OnboardingForm.tsx`) and org-shape (`os/attention/org-shape-store.ts`, `ShapeOrganizationCard.tsx`) both live, both wired into the Attention Engine, both verified across a School (Purpose stated, org shaped) and a Company (both skipped). Full verification pass (§5) completed — see the Technical Debt Register for the one real gap this milestone surfaced.

### M3 — People
**Goal:** the first complete application, the one that sets the quality bar for every application after it, per the founder's own standing instruction.
**Deliverables:** Person/Membership/Position/Affiliation/Capability implemented per the frozen People Domain Review; a real roster screen; a real profile screen; Offboarding implemented per the atomic-per-concept discipline named reusable from RDE.
**Completion criteria:** full verification pass (§5) plus a live walkthrough proving at least one Position, one Affiliation, and one Capability all working correctly and independently.
**Preconditions:** M2 done — People's roster meaningfully depends on institutions already having Purpose and at least a starter organizational shape to display.
**Status: Done.** `applications/people/` — types, a swappable `PeopleProvider` interface, an in-memory mock provider (`appointHolder` closes any existing active holder before appointing, `offboardPerson` atomically ends every active Position/Affiliation for that person in that institution). Server actions for appoint/end-position, add/end-affiliation, grant/revoke-capability, and offboard, each resolving identity first and recording History for the meaningful events. Roster screen (`/people`) and profile screen (`/people/[personId]`), both server components reading through the provider. Full verification pass (§5) completed — see the Technical Debt Register for the gaps this milestone surfaced.

### M4 — Organization Builder
**Goal:** the flagship visual experience named in the Product Foundation — canvas-based, drag-to-connect, multi-parent-capable from the schema up.
**Deliverables:** the interaction model already researched in the Product Foundation, built for real.
**Completion criteria:** a founder can visually lay out a real reporting structure, including at least one Position with multiple parents, without touching a form.
**Preconditions:** M3 done — Positions need to exist as real data before a builder can visualize them.

### M5 — Authority & Permissions
**Goal:** a real Authorization resolver — Position-derived permissions actually gating real actions, not just modeled as data.
**Deliverables:** the resolver mechanism named reusable from RDE (role grants ∪ Position grants, resolved once), a real permission catalog for RDIOS's own institution-configurable model.
**Completion criteria:** a Position-granted permission proven live to gate a real action, the same discipline already proven once in RDE.
**Preconditions:** M4 done.

### M6 — Work Engine
**Goal:** port the Work Item Engine's design — Task/Approval, template-driven workflow, Assignment — generalized for multi-tenancy.
**Preconditions:** M5 done — Work's Act Now items need real Authorization to gate who can approve what.

### M7 — Money
**Goal:** the Stakeholder-Ledger generalization of RDE's Finance/Founder-Ledger pattern.
**Preconditions:** M6 done.

### M8 — Customers · M9 — Projects · M10 — Documents · M11 — Reports
**Goal, each:** the generalized version of the corresponding RDE application.
**Preconditions:** M6 done (all depend on Work existing as the shared decision substrate).

### M12 — Tamizhi
**Goal:** the assistant, entering exactly through the two homes already reserved for it — Search and the Attention Contract — per the Visual Design System's explicit test that nothing should need to change shape when it arrives.
**Preconditions:** a stable Application Layer (at minimum M6–M9) — an assistant recommending decisions needs real decisions to recommend.

### Unscoped — Developer Platform, Marketplace, Public APIs
No milestone number assigned. Each gets its own design pass, following the same discipline as everything else — Product Foundation-level thinking first, architecture second, implementation last — when the project is actually close enough for the question to be real rather than speculative.

---

## 4. Engineering Workflow

One lifecycle, every feature, no exceptions:

1. **Design** — what is this, in plain product terms, before any technical shape is proposed.
2. **Architecture Approval** — does it fit inside the frozen layers, or does it require reopening something? If the latter, it needs real implementation evidence of a flaw, not preference, per the Architecture Freeze Declaration.
3. **Implementation** — built, following Build Principles (§8).
4. **Testing** — typecheck, lint, build, at minimum.
5. **Verification** — live walkthrough, the discipline proven repeatedly this engagement to catch what static checks cannot (the Act Now membership-count bug, found only by clicking through as two real people).
6. **UX Review** — checked against the Experience Principles (tiering, calm, no forced interruption) and Institution Setup v2 where relevant.
7. **Performance Review** — does it stay fast under real institution-sized data, not just the two-person demo shape.
8. **Documentation** — this roadmap updated; any new technical debt named, not hidden.
9. **Freeze** — for architecture-level decisions only, not every feature; most features simply reach Done.
10. **Done** — meets the Definition of Done (§9) in full.

---

## 5. Verification Policy

No implementation is complete until all of the following pass, every time, no exceptions:

- **Type Check** — `tsc --noEmit`, clean.
- **Lint** — clean, zero suppressed warnings.
- **Production Build** — `next build` exits 0. This step alone has already caught a real deployment-breaking bug this engagement (an unescaped entity that passed typecheck and lint but failed the actual build) — it is not redundant with the first two.
- **Live Walkthrough** — clicked through as a real user would, in the actual running app, not inferred from reading the code. This is the step that found the Act Now membership-count bug; static checks alone would never have caught it.
- **Edge Case Testing** — the empty state, the single-member institution, the second institution type, the person with no Position yet — not just the happy path.
- **Regression Check** — does anything previously verified still work after this change.

Only after all six pass is work considered complete.

---

## 6. Technical Debt Register

Named honestly, never hidden, never silently resolved without a note here:

| Item | Where | Status |
|---|---|---|
| Identity is entirely in-memory — no persistence, resets on server restart | `os/identity/mock-provider.ts` | Intentional, per explicit instruction not to provision Supabase yet. Resolved when the real provider swap happens. |
| No real authentication — dev-mode email sign-in only | `os/identity/actions.ts`, `app/login` | Intentional, same reason. Clearly labeled in the UI as dev-mode. |
| Invite has no permission gate — any signed-in member can invite anyone | `app/(workspace)/settings` | Named in the Product Readiness Review, not yet fixed. Real gap, low current risk (no Authorization layer exists yet to gate it against). |
| No shared UI primitives — Button/Field/Card patterns are hand-repeated across Login, Onboarding, Settings, and now every People drawer/dialog | `app/login/LoginForm.tsx`, `app/onboarding/OnboardingForm.tsx`, `app/(workspace)/settings/InviteForm.tsx`, `components/os/AppointHolderCard.tsx`, `components/os/AffiliationsCard.tsx`, `components/os/CapabilitiesCard.tsx`, `components/os/CreatePositionCard.tsx`, `components/os/OffboardButton.tsx` | Named in the Product Readiness Review §7, flagged as a risk before People. Not resolved — People (M3) shipped with the same hand-repeated pattern, now five more times over. This is the clearest signal yet that it should be extracted before M4 adds another application's worth of forms. |
| People has no Position deletion/archival — a Position created by mistake stays forever, only ever "Unfilled," never removed | `applications/people/mock-provider.ts`, `applications/people/actions.ts` | New from M3. `Position.status` already has an `"active" \| "archived"` field in the type, but nothing sets it yet — named honestly as unused. Deliberately out of scope for M3 per "smallest implementation that satisfies the frozen concept"; likely lands naturally with M4's Organization Builder, which needs archival for its own editing flows anyway. |
| Position appointment is single-position-select only — no search, no filtering, would not scale past a handful of positions | `components/os/AppointHolderCard.tsx` | New from M3. Fine for a two-person demo institution; a real institution with dozens of Positions needs a searchable picker before this is usable, not just polished. |
| Empty application shells show generic "hasn't been built yet" instead of the per-module copy already designed | `components/os/EmptyApplication.tsx` | Named in Product Readiness Review §3. Copy already written, not yet implemented. |
| Three sentences of user-facing copy leak implementation language ("Dev-mode sign-in," "Institution Configuration Layer") | `app/login/LoginForm.tsx:46`, `app/(workspace)/settings/page.tsx:13` | Named in Product Readiness Review §2. One-line fixes, not yet made. |
| History is an explicitly-labeled preview, not the frozen Audit Engine | `os/attention/history-store.ts` | Intentional and stated in the file's own header. No Events subscription, no `audit_records` table, no permission layering yet. |
| Current prototype's visual language predates the frozen Visual Design System | `app/globals.css`, `tailwind.config.ts` | The prototype was built before the five-theme system was designed. Needs an alignment pass — at minimum bringing the default in line with the Slate theme's actual specification — before more screens multiply the current ad hoc token set. |
| Organization shape is free text, not real Position data | `os/attention/org-shape-store.ts` | **New, from M2.** Deliberately the smallest implementation that satisfies Setup v2 without inventing a parallel org-chart engine ahead of People (M3). Needs to be superseded — not merely read from — once real Positions exist; the free-text store should be retired, not kept running alongside the real schema. |
| Organization Templates (per-institution-type starter suggestions) are not implemented | `os/attention/org-shape-store.ts`, `os/identity/types.ts` | Named in Institution Setup v2 and the Institution Configuration Layer, not built. Today's "shape your organization" card is a blank textarea for every institution type — a Temple and a Hospital see the identical empty prompt, not a type-appropriate starting suggestion. |

## 7. Backlog

Nothing here disappears. Items move between sections as priority changes; the item itself stays visible in this document's history.

**Critical**
- Provision RDIOS's real Supabase project and swap the Identity provider (blocks all durability; founder's call on timing).
- Gate the Invite action behind a real permission once Authorization (M5) exists.

**High**
- Fix the three language leaks named in the Technical Debt Register.
- Extract shared UI primitives before People (M3) triples the current copy-paste pattern.
- Implement the per-module empty-state copy already designed.
- Align the current prototype's visuals with the frozen Visual Design System, starting with Slate.

**Medium**
- Build the real Audit Engine, replacing today's preview.
- Build the Organizational Builder (M4) and retire the M2 free-text org-shape placeholder in favor of real Position data.
- Implement Organization Templates (per-institution-type starter suggestions) in the Institution Configuration Layer.
- Add Position archival (the `status: "archived"` field already exists on the type, unused).
- Replace People's single-select Position picker with a searchable one before institution sizes make it unusable.

**Low**
- Implement the remaining four themes (Light, Dark, Forest, Midnight Executive) once Slate is correctly implemented.
- Full accessibility pass — reduced-motion support, touch-target audit.

**Future Vision**
- Tamizhi.
- Developer Platform, Marketplace, Public APIs.
- An "Institution Health" view — named as a natural throughline in Institution Setup v2, never committed to as a build.
- Cross-tenant credential verification — named as a future extension in the People Domain Review.

**Ideas**
- Hash-chained, tamper-evident audit trail for compliance-heavy institutions — named in the Audit Engine Design as a real future need, explicitly not designed yet.
- A UI for a person holding memberships in more than one institution simultaneously.

---

## 8. Build Principles

- **Build one slice completely.** One finished application beats five half-built ones — the founder's own standing rule, restated here as policy.
- **Prefer composition over invention.** If an existing engine or pattern can be generalized, generalize it before writing something new.
- **Reuse frozen engines.** RDE's Work Item Engine, Authorization mechanism, Notifications mechanism, Documents pattern, and Workforce schema are proven — port and generalize, don't redesign from scratch.
- **Never rebuild solved problems.** If RDE already proved a pattern works, that question is closed; implementation time goes to genuinely new problems, not re-litigating settled ones.
- **Never reopen frozen architecture without real implementation evidence.** Preference, elegance, or a better idea in the abstract is not sufficient — only a concrete flaw discovered by building against the frozen document reopens it, per the Architecture Freeze Declaration.
- **Always verify before declaring complete.** All six steps in §5, every time, no exceptions for small changes.
- **RDE is never modified, imported, or depended on at runtime.** Reference only, forever.

---

## 9. Definition of Done

A feature is Done only when all of the following are true simultaneously:

- **It works** — the real functionality, not a stub.
- **It is verified** — all six steps in §5 passed.
- **It is documented** — this roadmap reflects it; any new technical debt is named in §6, not hidden.
- **It follows the Product Philosophy** — it serves either institutional memory or institutional attention; if it serves neither, it doesn't belong, regardless of how easy it was to build.
- **It follows the Experience Principles** — correctly tiered (Act Now / Be Aware / History), calm, never a forced interruption.
- **It follows the Visual Design System** — the shared card, type, and spacing language; no invented one-off style.
- **It introduces no architectural regression** — nothing frozen is quietly reopened or contradicted.

Anything short of all seven is not Done — it's still in progress, however close it looks.

---

## 10. Project Dashboard

```
██████████  Philosophy               Frozen
████████░░  Platform Foundation      Prototype
████████░░  Identity                 Prototype
████████░░  Institutions             Prototype
██████░░░░  People                   Prototype
░░░░░░░░░░  Organization             Not Started
░░░░░░░░░░  Authority & Permissions  Not Started
░░░░░░░░░░  Work                     Not Started
░░░░░░░░░░  Money                    Not Started
░░░░░░░░░░  Customers                Not Started
░░░░░░░░░░  Projects                 Not Started
░░░░░░░░░░  Documents                Not Started
░░░░░░░░░░  Reports                  Not Started
░░░░░░░░░░  Tamizhi                  Not Started
░░░░░░░░░░  Developer Platform       Not Started
░░░░░░░░░░  Marketplace              Not Started
░░░░░░░░░░  Public APIs              Not Started
```

The bars are qualitative, not measured — they exist only to make the labels easier to scan at a glance, per the founder's own instruction not to invent percentages. Philosophy is full because it's frozen, not because a number reached 100. Platform Foundation, Identity, and Institutions are mostly-but-not-fully filled because they're real, working, and verified in their current mock-backed form — genuinely built, genuinely not yet production infrastructure. Institutions now includes Purpose and a minimal org-shape (M2, done) alongside name and type. People is filled less than the layers above it — real and verified (M3, done), but younger, and still missing archival and a scalable Position picker, both named in the Technical Debt Register. Everything else is empty because nothing has been written yet, honestly.

---

*Update this document every time a milestone status changes, every time technical debt is found or resolved, every time the backlog moves. This is the first thing opened before work begins each day.*
