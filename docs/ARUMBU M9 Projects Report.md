Status: 🟢 Complete — implementation only, no constitutional documents, no architecture review, no philosophy. Built exactly within the frozen architecture, following the identical discipline every prior application (People, Work, Finance, Community) already established.

---

## What this milestone was

The founder's own framing: Projects is the container an institution already understands as "how we accomplish something meaningful" — never a task list, never a board, never project-management software. Its job is to coordinate People, Work, Finance, Community, and Documents without duplicating any of them. Every design decision below was tested against the founder's own question — would a temple, a hospital, a company, a school, and an NGO all naturally understand this? — and simplified until the answer was yes.

## Core Model, as built

`applications/projects/types.ts` — a `Project` carries exactly the fields the brief named and nothing more: Name, Description, Purpose, Status (active/archived — its existence, separate from progress), Priority, Owner, Members (role-tagged Member/Observer, Owner kept as its own dedicated field rather than a role in the list — the same "one dedicated field for the one person a record is answerable to" shape Work's `createdByPersonId` and Finance's `custodianPersonId` already use), Stage, Health, Start/Target/Completed dates, Document references, and History/Attention/Relationships eligibility through the same mechanisms every other Record already uses.

Two deliberate choices worth naming:

- **Stage is free text with a suggested default sequence** (Planning → Approved → In Progress → Blocked → Completed → Archived), not a hardcoded enum. This is the same reasoning Expense's `category` and Relationship's `type` already established — no institution's real stage vocabulary fits one fixed list, and the brief's own "keep this configurable" instruction ruled out both a rigid enum and building a Policy Engine to make it configurable properly. A datalist offers the suggestions; typing anything else is a real, valid Stage.
- **Health is manually set** (on_track / at_risk / off_track), never computed. This mirrors the exact reasoning the Community Domain Reconsideration used to reject an automatic relationship "health score" — a founder's own honest read of a project is worth more than an invented formula pretending to know one.

One new Area of Responsibility, `projects.manage`, gates Create/Archive/Change-stage/Manage-members/Close — the fifth independent confirmation that Governance & Responsibility Model v1's growth model (§11) needs zero new mechanism per application, only a new catalog entry. Authority is entirely inherited from the existing Authority Engine; Projects creates no new authority concept.

## Real convergence — not placeholders

The brief was explicit that Work, Finance, and Community integration should be real, while Related Records elsewhere should stay a placeholder. Both were honored precisely:

- **Work**: `Task`/`Approval` (`applications/work/types.ts`) gained an optional `projectId`. A new thin action, `setWorkItemProjectAction`, attaches or detaches an existing Work Item — no changes to Work's own create/assign/complete/approve flow.
- **Finance**: `Expense`/`Income`/`Asset` (`applications/finance/types.ts`) gained the same optional `projectId`, with `setTransactionProjectAction` and `setAssetProjectAction` as the equivalent thin seams.
- **Community**: `Contact` (`applications/community/types.ts`) gained `projectId`, with `setContactProjectAction`.

None of these applications' own UI was touched — no "Project" field was added to WorkBoard's create-Task drawer, MoneyBoard's create-Expense drawer, or CommunityBoard's create-Contact drawer. Instead, the Project's own detail drawer exposes a "What's happening" section with one `LinkedGroup` per domain (Work, Money, Assets, Community): what's already linked, and a dropdown of everything in the institution not yet linked to any project, with a one-click "Link"/"Unlink." This is genuinely functional — attaching a real Task and watching it appear in the Project's drawer was live-verified — while leaving every existing application's own screens completely unmodified, honoring "Do not revisit previous milestones" to the letter, not just the spirit.

Every attach/detach records History on both sides implicitly (through the domain's own `recordHistory` subject) — "linked to a project" / "unlinked from its project" — so a Task's own Timeline shows when it entered and left a Project's coordination, not just the Project's Timeline showing what it's holding.

**Related Records**, for everything not in that list (Documents beyond a reference, Governance beyond membership), stays the exact one-sentence, non-interactive placeholder Community's M8 pattern already established — reused verbatim in spirit, not reinvented.

## History, Attention, Timeline — the same mechanisms, extended

Every meaningful Project transition is narrated: created (naming the owner if one was set at creation), stage changed (correctly naming both the old and new stage — see the bug below), health changed, owner changed, member added/removed, completed, archived. No silent transitions — the same discipline Platform Integration Sprint 3 closed for every other domain, applied to Projects from day one instead of retrofitted.

Projects reuses `listHistoryForSubject` (the Universal Timeline mechanism, unchanged since Sprint 3) with its own subject type, `projects.project` — no new engine, exactly the brief's "do not redesign History, simply extend the same pattern."

Attention gained three real Act Now contributions, tested against "would this genuinely matter if I were running this institution today," surfaced only to whoever can act (holders of `projects.manage`, the Project's owner, or one of its members — never everyone):

- A Project stuck on Stage "Blocked."
- A Project past its own target date and not yet completed or archived.
- A Project with no owner named.

"Project over budget" was explicitly named in the brief as future and deliberately not built — Finance integration exists (Transactions can be linked to a Project), but no budget concept exists anywhere in Finance yet to compare against, and inventing one here would be exactly the kind of new architecture this milestone was told not to introduce. Be Aware gained one summary line (`N active`, `N blocked`), the same shape every other domain's Be Aware contribution already uses.

## A real bug found and fixed

Live-testing the stage-change narration surfaced a genuine defect: changing a Project's stage from Blocked to In Progress recorded "moved 'Product Launch' from Blocked to Blocked" — the old and new stage names were identical in the sentence, even though the actual stage changed correctly everywhere else (the badge, the list, Be Aware).

The cause: `mockProjectsProvider` (like every mock provider in this codebase) mutates the stored object in place and returns that same reference. The action code fetched the Project, then called the mutating provider function, then read `project.stage` to build the "from X" half of the sentence — but by that point `project.stage` was no longer the old value, since the provider had already mutated the very same object the action was holding a reference to.

Fixed by capturing the old stage into a local constant (`previousStage`) *before* calling the provider. Live-verified afterward: a stage change from Blocked to In Progress correctly narrated "moved 'Product Launch' from Blocked to In Progress," and the Home Act Now "Blocked" nudge correctly disappeared the instant the change was made.

**This same root cause was traced back to an existing bug in Work**, present since M6: `setTaskStatusAction`'s "reopened" narration checks `else if (item.status === "complete")` *after* calling `mockWorkProvider.setTaskStatus(...)` — meaning that check was always reading the already-updated status, never the pre-mutation one, silently guaranteeing the "reopened" branch could never fire. This was never caught in M6's own verification, or in Platform Integration Sprint 3's History-consistency pass, because nobody happened to test reopening a task while watching its Timeline closely enough to notice the missing entry rather than just its absence. Fixed the same way — capturing `wasComplete` before the mutating call. This is a real, if narrow, revisit of Work's own code: not a redesign, not new scope, a one-line correctness fix to a narration path that was claimed working and wasn't. Named honestly here rather than left for a future milestone to rediscover.

The general pattern — any future action that needs an old field value after calling a mutating mock-provider function is at risk of the identical silent failure — is named in the Technical Debt Register as a pattern risk, not just two isolated fixes, since it will recur wherever the next similar narration is written until the mock providers are eventually replaced by a real database (where a fresh read after a write is genuinely a different value, not the same object).

## Visual and structural consistency

`components/os/ProjectBoard.tsx` follows `CommunityBoard.tsx`'s exact shape: one list (via the shared `DataTable`), one bottom-sheet create drawer (`z-[70]`), one right-side detail drawer (`z-[75]`), the same `Badge`/`Button`/`EmptyState`/`useToast` primitives, the same "run() + refetch history" pattern Sprint 3 proved necessary for a live-updating Timeline. No new visual language was introduced. The one genuinely new UI shape is `LinkedGroup` — the attach/detach widget shared identically across all four "What's happening" sections, so Work/Money/Assets/Community read as one consistent pattern rather than four bespoke widgets.

No shared `Drawer`/`Input` primitive was extracted this milestone, consistent with the same judgment call Sprint 3 made — real, still named as the most overdue debt in the register, not resolved here either.

## Verification performed

1. **Typecheck** — `npx tsc --noEmit`: clean, exit 0, both before and after the stage-narration bugfix.
2. **Lint** — `npx next lint`: clean, no warnings.
3. **Production build** — clean `.next`, `npx next build`: compiled successfully, all 17 routes generated, `/projects` at 6.65 kB.
4. **Founder walkthrough** — Company institution (Aurora Technologies): created a Project with a real owner, created a Task on Work and attached it to the Project via the "What's happening" picker (confirmed it appears immediately, confirmed "Unlink" works), changed Stage to Blocked and confirmed the Act Now "Blocked" nudge appeared on Home with the correct project name, changed Stage again to In Progress and confirmed the nudge cleared and the narration read correctly, confirmed Be Aware's Projects line tracked both changes.
5. **Mobile walkthrough** — confirmed no horizontal overflow on `/projects` at 375px width (`document.documentElement.scrollWidth === clientWidth`), and confirmed the detail drawer's full content (Identity, Stage, Health, Members, What's happening, Related records, Timeline) renders without errors at that width.
6. **Regression** — Home, Work, and Money all confirmed rendering correctly with the new `projectId` fields present; zero console errors across the walkthrough.

## Honest assessment — where this fell short of the full ask

- **Multi-user walkthrough was not performed this milestone.** Only one real person (the founder) was available in the test institution; `projects.manage`'s gating logic was verified by code review and by the same pattern every prior Area already proved live in M6/M7/M8, but a second person correctly seeing a disabled Projects action was not re-confirmed live here.
- **Cross-institution walkthrough was not repeated for Projects specifically.** Only a Company institution was walked through this milestone. Projects introduces no institution-type-specific copy (the nav destination "Projects" was already defined generically in `os/navigation/index.ts` before this milestone, with no per-type override the way "Customers"/"Community" has), so there is no code path that would behave differently per institution type — but this is inference from reading the code, not a live-verified fact the way M7 and M8's cross-institution passes were.
- **The Work "reopened" narration bug predates this milestone** (M6) and was only found because an unrelated Project bug shared its exact root cause. It is fixed now, but it is evidence that Platform Integration Sprint 3's own History-consistency verification pass was not as thorough as its report claimed — worth remembering the next time a Sprint report says a narration path was "live-verified."
- Assignment of a Project's Priority/Health/Stage still requires the acting person to hold `projects.manage` outright — there is no "the assignee can act on their own item" carve-out the way Work's Task-completion has for its assignee. This was a deliberate reading of the brief's own "Only people with the appropriate Areas of Responsibility may [manage]" line, not an oversight, but it means a Project Member (not Owner, not `projects.manage`) can be added to a Project and then do nothing but observe it, which may not match every founder's intuition once real institutions use this.

None of the above blocks anything. ARUMBU now has one real coordination layer sitting correctly beneath People, Work, Finance, and Community — the founder's own test for whether the second half of ARUMBU should begin.
