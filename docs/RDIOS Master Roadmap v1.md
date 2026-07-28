Status: 🟡 Living document — updated as the project moves, never frozen. This is the operational source of truth; the philosophy/architecture layer below is what it operates under, not what it contains. Open this before starting work each day.

# RDIOS Master Roadmap v1

## 1. Current Project Status — stated plainly

**Frozen (constitutional — govern every decision below, not reopened without real implementation evidence proving a flaw):**

Product Foundation v1 · Product Philosophy v1 · Experience Principles v1 · Institution Setup Experience v2 (v1 + its Reconsideration superseded/folded in) · Visual Design System v1 · People Domain Review v1 · Audit Engine Design v1 · Architecture Freeze Declaration v1 · Platform Integration Strategy v1 · Institution Intelligence Principles v1.

**Architecture Freeze v2 (declared complete by the founder, this milestone):** the design/architecture phase is closed. Per standing instruction, no further philosophy or architecture documents get written unless implementation itself reveals a genuine contradiction, limitation, or missing domain concept — every session from here defaults to Build → Verify → Refine against this roadmap's next milestone.

**Built and live-verified (real code, running, click-tested this engagement):**

- Project scaffold — Next.js 14 App Router, Tailwind, TypeScript, at `G:\RDIOS`. `typecheck`/`lint`/`build` all clean.
- Identity & Tenant foundation — Person, Institution, Institution Membership types; a swappable `IdentityProvider` interface; today backed by an **in-memory mock provider only**, explicitly not durable, explicitly temporary per standing instruction not to provision Supabase yet.
- Dev-mode auth — institution creation (onboarding), email-based dev-mode login, invite, accept-invite. All four flows live-clicked end to end, including a real bug found and fixed live (Act Now's "only one here" card was checking the wrong membership count).
- Application shell — sidebar with all nine destinations, minimal top bar.
- Home — Act Now / Be Aware / History, live-verified with real narrated History entries across create/invite/accept.
- **M2 — Institution Setup Experience v2, implemented and verified.** Purpose captured as one optional sentence at onboarding, never required, rendered permanently in Be Aware. A second Act Now contributor, "Who reports to whom?", originally a minimal free-text org-shape capture opening inline on Home — **superseded by the coherence pass below** once People (M3) gave it real Position data to point to instead.
- **M3 — People, implemented and verified.** Position/Affiliation/Capability implemented per the frozen People Domain Review, behind a swappable `PeopleProvider` (mirroring `IdentityProvider`'s exact pattern), backed by an in-memory mock. A real roster screen (`/people`) listing every active member with their current position, and every position with its current holder. A real profile screen (`/people/[personId]`) — appoint/end a Position holder (single-parent `reportsToPositionId` only, multi-parent deferred to M4), add/end Affiliations (append-only), grant/revoke Capabilities (not append-only, per the frozen Capability Domain Reconsideration), and Atomic Offboarding (ends every active Position holding and Affiliation for that person in that institution in one action, behind a confirmation dialog since it's the one action on the screen that reads as final). Appointing to an already-filled Position correctly closes the existing holder before inserting the new one — live-verified by re-appointing the same Position and confirming the prior holder shows "Ended," not a silent overwrite. History narrates appointments and offboarding, matching M2's discipline. Live-verified with one real Position, one Affiliation, and one Capability all created, ended/revoked, and (for Position) re-appointed independently, plus a full regression pass across Home/Settings.
- **Coherence pass, implemented and verified (post-M3, pre-M4, no milestone number — a refinement, not new scope).** Triggered by a live first-time-founder review that judged RDIOS purely on whether it felt like one institution rather than several connected applications, and found four real cracks: Home's free-text org-shape card had gone stale the moment People became real, still asking a question People had already answered; invited members were invisible in People even though they were real in Settings; the nav rail and every placeholder defaulted to corporate vocabulary regardless of the institution type the founder had just chosen; and two sentences of internal architecture language ("frozen Institution Configuration Layer," "Dev-mode sign-in ... infrastructure") had leaked into founder-facing copy. Fixed all four: `os/attention/org-shape-store.ts`, its actions, and `ShapeOrganizationCard.tsx` are deleted — Home's Act Now now checks real Positions and links straight to `/people`, and Be Aware's "Organization" line summarizes real position/holder counts instead of a parallel free-text description. People's roster now lists invited memberships alongside active ones with an "Invited" badge. `os/institution/terminology.ts` (new, pure data) resolves nav labels/questions and Position/Affiliation/Capability/institution-name placeholder examples per institution type — a temple sees "Community" in the nav and "Head Priest" as a Position example, a hospital sees "Patients" and "Chief of Surgery", with Company/Other keeping the original neutral defaults. The Shell sidebar now shows the signed-in person's current Position title under their name — a real, honest "role" signal built from existing People data, deliberately stopping short of gating navigation by role since Authority & Permissions (M5) doesn't exist yet and a placeholder permission system would be new architecture the founder explicitly ruled out. History's "appointed someone" / "offboarded someone" bug fixed to use the real person's name (or "themselves" when self-appointed). Live-verified end to end as a second Temple institution (Sri Meenakshi Temple Trust): dynamic onboarding placeholder, "Community" nav label, "Head Priest" position placeholder, invited member visible immediately in People, Home's Act Now/Be Aware tracking real Position data with zero duplication, sidebar role display, and correct History narration — plus a regression pass on Money/Work/Settings/Login.
- **M4 — Organization Builder, implemented and verified.** The flagship visual experience named in the Product Foundation, built for real: a canvas at `/people/organization` (linked from the People roster) rendering every Position as a draggable node, connected by SVG lines to each of its parents. `Position.reportsToPositionId` (single) generalized to `reportsToPositionIds: string[]` (multi-parent) plus `canvasX`/`canvasY` (persisted layout) and `description` — the schema change the M3 single-parent placeholder always anticipated. Drag a node to move it (persisted). Drag from the small handle on top of a node to another node to connect it as a parent — drag the same pair again to disconnect; the release always writes the complete new parent set in one atomic call, never a partial add/remove. Click empty canvas to create a Position exactly where clicked, no form. Click any node for a side panel that slides in with the canvas still visible behind it, per the Product Foundation's own description of this experience — editable name/description, holder appoint/end (reusing M3's `appointHolderAction`/`endHolderAction` unchanged), the full "reports to" list with per-parent removal, and a read-only "direct reports" list computed from the same data in the other direction. Live-verified end to end: three Positions created by clicking the canvas (no form), one connected to two separate parents by dragging its handle twice — genuine multi-parent, the exact completion criteria the roadmap named — confirmed from both directions (the child's side panel lists both parents, each parent's side panel lists the child under "Direct reports"), confirmed to persist across a full page reload, and confirmed to disconnect correctly when the same drag is repeated. Home's Be Aware and the People roster both picked up the multi-parent structure with zero additional wiring, since both already read through the same `PeopleProvider` this milestone extended rather than replaced.
- **Cycle prevention (pre-M5 hardening, no milestone number).** The founder's own instruction before starting M5: the multi-parent graph M4 introduced could be dragged into a cycle one connection at a time, something the old single-parent tree structurally couldn't do. `mockPeopleProvider.updatePositionParents` now walks the proposed parent's existing ancestor chain before committing and rejects (`ok: false`) anything that would make a Position its own ancestor. The canvas reverts the optimistic connection and shows a calm, transient notice — never a raw error, never blocking the rest of the canvas. Live-verified: connected A→B, then attempted B→A — rejected, notice shown, connection count unchanged.
- **M5 — Authority & Permissions, implemented and verified, reframed by the founder as a product milestone, not a security milestone.** The explicit brief: the goal is not to hide pages, it's to make every person feel RDIOS understands their real role — permissions support responsibility, they don't expose access-control mechanics. `engines/authority/` is the first Shared Engine Layer piece (Product Foundation §7's "Authorization's mechanism ... reusable from RDE," now real): a small catalog of three real responsibilities (`members.invite`, `organization.manage`, `people.offboard` — deliberately not abstract "roles"), and a resolver returning the union of whatever responsibilities a person's currently-active Position holdings carry, resolved once per request onto `IdentityContext.permissions` (the "role grants ∪ Position grants, resolved once" pattern named reusable from RDE). Authority lives entirely on the real M4 organization graph — a Position now carries a `responsibilities: PermissionKey[]` field, editable only by the institution's founder (a new `Institution.founderPersonId`, set once at creation, who always holds every responsibility — the bootstrap every real institution needs). Every mutating People/Settings action checks `ctx.permissions` before touching anything, server-side, non-negotiably. The UI half of the brief: no control disappears — every button a person can't currently use stays visible, disabled, with a plain-language reason ("Offboarding isn't your responsibility here," never "permission denied" or "insufficient role"); nav destinations and full pages are never hidden, only the specific actions within them. Live-verified with two real people in one institution: the founder granted a Position ("Operations Lead") both `members.invite` and `organization.manage` but not `people.offboard`, appointed a second person to it, and confirmed — signed in as that second person — the sidebar showed their real title, Settings' Invite worked, creating/connecting Positions and appointing/ending holders worked, and Offboard stayed disabled with the correct explanation, while every page remained fully visible throughout. A third, position-less person was confirmed to see every page with every action disabled and explained, never a missing page.

**Prototype, not production-grade — true today, named honestly:**

Everything above is real and working, and none of it survives a server restart. There is no database. Identity, institutions, memberships, People (Positions/Affiliations/Capabilities), and history all live in process memory. This is by explicit design (the founder's instruction to stay infrastructure-independent until Supabase is provisioned), not an oversight — but it means nothing built so far should be mistaken for durable.

**Design-only — frozen on paper, zero code:**

Work, Money, Customers, Projects, Documents, Reports, the real Audit Engine (today's History is still an explicitly-labeled lightweight preview, not the frozen design), and the deeper Institution Configuration Layer (per-type Organization Templates, full terminology coverage, branding, business rules). Institution Setup v2's "shape your organization" decision is now answered by real Position data instead of the free-text placeholder that used to sit ahead of it — the placeholder mechanism itself has been retired, not merely superseded on paper. The coherence pass's `os/institution/terminology.ts` is a first real slice of the Configuration Layer's terminology concept, covering nav labels and a handful of placeholders; full Organization Templates and the rest of the Configuration Layer's scope remain design-only. Tamizhi's *behavior* is now frozen (Institution Intelligence Principles v1); Tamizhi itself — the product on the other side of RDIOS's two doors — remains entirely unbuilt, per the Platform Integration Strategy's own boundary.

**Not yet scoped anywhere:** Developer Platform, Marketplace, Public APIs. No frozen document names these. They appear in this roadmap because the founder named them; they get their own design pass when their milestone actually approaches, not before.

---

## 2. Product Layers

| Layer | Status | Depends on | Current phase | Next milestone | Build order | Unknowns |
|---|---|---|---|---|---|---|
| Platform Foundation | Prototype | — | Live, mock-backed | Real Supabase provider swap | Done (v1) | When Supabase gets provisioned is the founder's call, not a technical blocker |
| Identity | Prototype | Platform Foundation | Live, mock-backed | Same as above | Done (v1) | Multi-institution-membership UI not yet designed in detail |
| Institutions | Prototype | Identity | Live — name, type, Purpose, minimal org-shape | People (real Positions) | M3 | None |
| People | Prototype | Institutions | Live, mock-backed — Position/Affiliation/Capability, roster + profile screens, multi-parent + responsibilities since M4/M5 | Work Engine | M6 | Membership-to-multiple-Positions question named open in the People Domain Review — still open |
| Organization (Builder) | Prototype | People | Live, mock-backed — canvas at `/people/organization`, drag-to-move, drag-to-connect, multi-parent, cycle-guarded, Responsible-for section | Node deletion/archival | M6 | None known yet |
| Authority & Permissions | Prototype | Organization | Live, mock-backed — `engines/authority/`, 3-key catalog, resolved once onto `IdentityContext.permissions`, real gates on every mutating People/Settings action | Real permission catalog entries for Work/Money as those applications get built | M6 | Whether the 3-key catalog needs to grow per-application or stays this small is a real open question, deliberately not pre-solved |
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
**Status: Done.** Canvas at `/people/organization` — draggable nodes, SVG connector lines, drag-from-handle-to-node to connect/disconnect, click-empty-canvas to create, click-node for a side panel (canvas stays visible behind it). `Position.reportsToPositionId` generalized to `reportsToPositionIds: string[]`; `canvasX`/`canvasY`/`description` added. Live-verified: three Positions created without a form, one connected to two separate parents by dragging twice (genuine multi-parent, confirmed from both directions and across a page reload), disconnect confirmed by repeating the same drag, node position confirmed to persist after reload. Full verification pass (§5) completed — see the Technical Debt Register for the one real gap this milestone surfaced (no cycle guard).

### M5 — Authority & Permissions
**Goal:** a real Authorization resolver — Position-derived permissions actually gating real actions, not just modeled as data.
**Deliverables:** the resolver mechanism named reusable from RDE (role grants ∪ Position grants, resolved once), a real permission catalog for RDIOS's own institution-configurable model.
**Completion criteria:** a Position-granted permission proven live to gate a real action, the same discipline already proven once in RDE.
**Preconditions:** M4 done.
**Status: Done.** Reframed by the founder mid-milestone as a product milestone, not a security one — the brief was to make every person feel RDIOS understands their real role, never to hide pages. `engines/authority/` (catalog + resolver), `Institution.founderPersonId` (bootstrap authority), `Position.responsibilities`, real gates on every mutating People/Settings action, and responsibility-framed UI (every control stays visible, disabled-with-a-plain-language-reason rather than removed) all live and verified. Live-verified with two real people holding genuinely different responsibilities in one institution — see the full account above §1. Pre-milestone hardening also completed at the founder's instruction: the M4 organization graph can no longer be dragged into a reporting cycle.

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
| No shared UI primitives — Button/Field/Card patterns are hand-repeated across Login, Onboarding, Settings, and every People drawer/dialog/side panel | `app/login/LoginForm.tsx`, `app/onboarding/OnboardingForm.tsx`, `app/(workspace)/settings/InviteForm.tsx`, `components/os/AppointHolderCard.tsx`, `components/os/AffiliationsCard.tsx`, `components/os/CapabilitiesCard.tsx`, `components/os/CreatePositionCard.tsx`, `components/os/OffboardButton.tsx`, `components/os/PositionSidePanel.tsx`, `components/os/OrganizationCanvas.tsx` | Named in the Product Readiness Review §7, flagged as a risk before People, still not resolved after M3 *and* M4 both shipped the same hand-repeated pattern. Now the single most overdue item in this register — every milestone since M2 has made the eventual extraction more expensive, not less. |
| People has no Position deletion/archival — a Position created by mistake stays forever | `applications/people/mock-provider.ts`, `applications/people/actions.ts` | `Position.status` still has an unused `"active" \| "archived"` field. M4 gave the Organization Builder a natural home for this (an archive action in the side panel) but it wasn't built — deliberately out of scope to keep M4 to its own completion criteria. Next candidate for "implementation reveals a missing concept," per the founder's Build→Verify→Refine directive, once a real institution actually needs it. |
| Organization canvas has no pan/zoom — large institutions with dozens of Positions will scroll, not zoom out | `components/os/OrganizationCanvas.tsx` | New from M4. Fine at demo scale (a handful of Positions); a real institution's full org chart will need real navigation, not just a bigger scrollbar. |
| Position appointment (profile page) and the canvas's own appoint flow are two separate pickers with the same shape, not one shared component | `components/os/AppointHolderCard.tsx`, `components/os/PositionSidePanel.tsx` | New from M4 — a direct consequence of the shared-UI-primitives gap above, not a new problem, just another instance of it. |
| History is an explicitly-labeled preview, not the frozen Audit Engine | `os/attention/history-store.ts` | Intentional and stated in the file's own header. No Events subscription, no `audit_records` table, no permission layering yet. |
| Current prototype's visual language predates the frozen Visual Design System | `app/globals.css`, `tailwind.config.ts` | The prototype was built before the five-theme system was designed. Needs an alignment pass — at minimum bringing the default in line with the Slate theme's actual specification — before more screens multiply the current ad hoc token set. |
| Nav destinations don't change per person — every member sees the identical sidebar, only the actions inside each page differ | `components/os/Shell.tsx`, `os/navigation/index.ts` | Deliberate, not deferred — the founder's own M5 brief was explicit that the goal is not to hide pages. Real gating now exists (M5) and lives entirely on actions within a page, never on the destination list itself. Revisit only if a real institution's use surfaces a genuine reason a full destination — not an action — should be hidden. |
| Only three responsibilities exist (`members.invite`, `organization.manage`, `people.offboard`), all tied to People/Settings | `engines/authority/types.ts` | New from M5. Deliberately the smallest real catalog, not a speculative one — Work/Money/Customers/etc. will each need their own responsibility keys as they're built (M6+), not pre-invented now. |
| Responsibility-granting is founder-only, no delegation | `applications/people/actions.ts` (`updatePositionResponsibilitiesAction`) | New from M5, deliberate — avoids a self-escalation loophole (someone with `organization.manage` granting themselves more) without designing a full delegation model this early. A real institution beyond a handful of people will eventually want to delegate this without routing everything through one founder; named honestly as a real future limit, not solved here. |
| Institution-type terminology (`os/institution/terminology.ts`) only covers nav labels + a handful of placeholder examples, not full per-type copy across every screen | `os/institution/terminology.ts` | New from the coherence pass. Covers the highest-impact spots (nav, onboarding, Position/Affiliation/Capability placeholders); Affiliation appointment-type labels ("Permanent/Acting/Temporary") and a few other smaller strings are still institution-neutral, not yet type-aware. |

## 7. Backlog

Nothing here disappears. Items move between sections as priority changes; the item itself stays visible in this document's history.

**Critical**
- Provision RDIOS's real Supabase project and swap the Identity provider (blocks all durability; founder's call on timing).

**High**
- Extract shared UI primitives — the single most overdue item in the register; three milestones running have repeated the same hand-built pattern.
- Align the current prototype's visuals with the frozen Visual Design System, starting with Slate.
- Grow the responsibility catalog as Work/Money/etc. get built (M6+) — each application's real gated actions, not invented ahead of schedule.

**Medium**
- Build the real Audit Engine, replacing today's preview.
- Extend `os/institution/terminology.ts` coverage to appointment-type labels and any remaining institution-neutral strings.
- Add Position archival (the `status: "archived"` field already exists on the type, unused) — a natural fit for the Organization Builder's side panel.
- Replace People's single-select Position picker with a searchable one before institution sizes make it unusable.
- Pan/zoom for the Organization canvas once institutions outgrow a scrollable view.
- A real delegation model for responsibility-granting, once a founder-only bottleneck actually shows up in a real institution.

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
███████░░░  People                   Prototype
███████░░░  Organization             Prototype
██████░░░░  Authority & Permissions  Prototype
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

The bars are qualitative, not measured — they exist only to make the labels easier to scan at a glance, per the founder's own instruction not to invent percentages. Philosophy is full because it's frozen, not because a number reached 100. Platform Foundation, Identity, and Institutions are mostly-but-not-fully filled because they're real, working, and verified in their current mock-backed form — genuinely built, genuinely not yet production infrastructure. Institutions now includes Purpose and a minimal org-shape (M2, done) alongside name and type. People moved up slightly past M3 — the coherence pass and M4's multi-parent schema both landed on it — but still missing archival and a scalable Position picker, both named in the Technical Debt Register. Organization is real and verified (M4/M5, done): drag-to-move, drag-to-connect, multi-parent, cycle-guarded, a real side panel with a Responsible-for section — filled a little more than before now that it's cycle-safe, still missing pan/zoom and archival. Authority & Permissions is real and verified (M5, done): a genuine three-key responsibility catalog gating real actions, live-proven with two people experiencing RDIOS differently — filled less than the others because the catalog is deliberately minimal today and will grow as Work/Money/etc. get built. Everything else is empty because nothing has been written yet, honestly.

---

*Update this document every time a milestone status changes, every time technical debt is found or resolved, every time the backlog moves. This is the first thing opened before work begins each day.*
