Status: 🟢 Complete — implementation and quality sprint, no constitutional documents, no architecture reviews, no philosophy. Reviewed the entire built platform (Home, People, Organization, Work, Finance, Community, Settings) as a founder would, across institution types, users, and permissions, and closed what was genuinely inconsistent.

---

## What this sprint was

Not a design sprint. Not M9. Every change below makes something that already worked, work the same way everywhere it appears. The founder's own framing is the right test for whether this was worth doing: Projects (M9) will connect People, Community, Work, and Finance — if those four already felt unified, Projects becomes an orchestration layer over something coherent; if they didn't, Projects would have amplified every inconsistency between them instead of fixing it. This sprint went first for exactly that reason.

## Method

Lived inside ARUMBU as a founder would — created institutions across Company, Temple, and NGO, moved through Home/People/Organization/Work/Money/Community/Settings, switched users, checked what each real Area of Responsibility actually gates. Where the ten focus areas turned up something concretely wrong, it was fixed. Where they turned up something already disciplined, that's reported honestly too — this sprint did not manufacture work to look busy.

---

## 1. Universal Timeline

**Extended, not redesigned.** Community's own Timeline (M8) — a Contact's detail view reading as its own filtered slice of History via `subjectType`/`subjectId` — is now the same experience on People's Positions, Work's Tasks and Approvals, and Finance's Transactions and Assets. `os/attention/history-store.ts`'s `listHistoryForSubject` was already generic; extending it meant giving each domain's `recordHistory()` calls a subject reference and adding a small `getXHistoryAction` per domain (`getPositionHistoryAction`, `getWorkItemHistoryAction`, `getTransactionHistoryAction`, `getAssetHistoryAction`) and a Timeline section to each detail drawer — mechanical, additive, the same pattern four times, no new engine.

**A real bug was found doing this, not invented to justify the sprint.** Every Timeline's fetch ran once, on mount (`useEffect(..., [item.id])`) — so an action taken inside an already-open drawer (appointing someone, ending a holding, editing a contact) updated everything else on screen via `router.refresh()`/`onChanged()`, but the Timeline itself, since the component never remounted, kept showing stale data until the drawer was closed and reopened. Confirmed live: appointing Jordan Lee to Operations Lead and then ending that appointment, inside one open panel, initially only showed the "created" entry — the "appointed" and "ended" entries existed in History (confirmed via Home) but weren't rendering in the panel's own Timeline. Fixed by refetching history alongside every existing refresh call, across all four new Timeline implementations *and* Community's own M8 implementation, which had the identical bug. Re-verified live afterward: a single open Position panel correctly showed all three events — created, appointed, ended — in order, with zero page reloads. This is the sprint's most consequential single fix, because it would have quietly undermined trust in every Timeline going forward, not just Community's.

## 2. Universal Detail Drawers

Compared Community, Finance, Work, People, and Organization side by side. They already share the same structural language — backdrop, right-side panel, header with a close button, sectioned content, a shared `Badge`/`Button`/`DataTable` vocabulary — because Finance and Community were both built by directly copying Work's established shape. What genuinely differed, and is now fixed:

- **z-index drift.** `CreatePositionCard` and `AppointHolderCard` used `z-[80]`; every other bottom-sheet create drawer (Work, Money, Community) uses `z-[70]`. `PositionSidePanel` used `z-[70]`; every other right-side detail drawer (Work, Money, Community) uses `z-[75]`. Both corrected to match the established convention — bottom-sheet creates at `z-[70]`, detail drawers at `z-[75]`, confirmation dialogs (`OffboardButton`) stay highest at `z-[90]`. Named in the Platform Cohesion Review; closed here.
- **Structural markup itself is still hand-duplicated**, not extracted into a shared `Drawer` primitive. Deliberately not resolved this sprint — see §12.

Nothing else needed standardizing. A founder moving between a Position's side panel and an Expense's detail drawer sees the identical shape, not five different products.

## 3. Shared Related Records

Community's placeholder ("Finance, Work, and Projects will be able to point here once they're ready to. Nothing to connect yet.") is now the same one-sentence, non-interactive section on Position, Work Item, Transaction, and Asset detail views — worded per domain, structurally identical everywhere. No cross-record linking was built, exactly as scoped; every one of these sections says, honestly, that there's nothing to connect yet.

## 4. History Consistency

The Platform Cohesion Review's own finding — creation and granting recorded far more reliably than ending and revoking — is now closed for every action this sprint could find:

- **Ending a Position holding** (`endHolderAction`) now records "{actor} ended {name}'s time as {position}." Previously silent.
- **Adding and ending an Affiliation** (`addAffiliationAction`, `endAffiliationAction`) now both record. Previously both silent.
- **Granting and revoking a Capability** (`grantCapabilityAction`, `revokeCapabilityAction`) now both record. Previously both silent.
- **Creating a Position** (`createPositionAction`, `createPositionOnCanvasAction`) now records. Previously silent — the one genuine "create" gap left in People.
- **Reopening a completed Task** (moving it back to open/in_progress) now records "{actor} reopened {title}." Previously only completion was recorded.
- **Editing a Position's description** and **an Asset's service notes** now record. Previously only renaming a Position, and changing an Asset's status, were recorded — editing the adjacent free-text field silently wasn't.

Each of these required a small provider addition (`getPositionHolder`, `getAffiliation`, `getCapability`) so the action could look up who and what before recording an honest sentence, not just "something ended." Verified live: the full session's Home History showed eight real events across four applications — create, appoint, end, task-create, task-complete, expense-record, contact-create, contact-edit — in the correct order, correctly narrated, with no duplication and no garbled text.

**Deliberately left silent, and named as a judgment call rather than an oversight:** attaching a document reference (Finance's and Community's `addDocumentRefAction`s) and Work's comments. Neither appeared in the founder's own explicit list (create/edit/assign/appoint/approve/reject/complete/archive/end/remove/restore/offboard/relationship end), and both are minor enough, relative to the events that are now recorded, that adding them would risk exactly the noise the founder's own instruction warned against ("no duplicate narration").

## 5. Attention Consistency

Reviewed every application's Act Now/Be Aware contribution against "would this genuinely matter if I were running this institution today." Found nothing artificial anywhere — Work's per-person task/approval surfacing, Finance's pending-expense/no-custodian/expiring-warranty signals, and Community's unreachable-contact/quiet-relationship signals were all already built with real restraint (each M6–M8 report explicitly named and rejected at least one manufactured nudge before shipping). No code changes were needed here. One live confirmation worth naming: ending Jordan Lee's own Position holding (during Timeline testing) correctly and immediately brought back "You're not seated in your own organization yet" in Act Now — proof that Attention genuinely reads live state, not a cached snapshot, across the exact kind of action this sprint was stress-testing.

## 6. Universal Search Readiness

No Search was built, per instruction. Checked whether every domain already has enough to be searchable later: every Record type (`Position`, `Contact`, `WorkItem`, `FinanceTransaction`, `Asset`) already carries a real display name or title field, a stable `id`, and `institutionId` scoping. Nothing needed fixing — this was true before this sprint and remains true now.

## 7. Universal Record Discipline

Checked every implemented Record against the accepted Universal Record Model's checklist — Identity, institution scope, a "now" that can change, Provenance, and eligibility for History/Attention/Relationships/Search — without building any shared inheritance, per instruction.

**One real gap found and closed:** `Position` had no `createdByPersonId`, unlike every other Record type (`Contact`, `FinanceTransaction`, `Asset` all already had it since their own milestones). Added as an optional field (`string | null`, nullable only because Positions created before this sprint predate it), set on every new Position going forward. This is the exact kind of gap the Universal Record Model's own document predicted a checklist would catch — and it did, on the first real audit.

Everything else already held: every Record type is institution-scoped, every one now has real History eligibility (§1), every one already had Attention eligibility where genuinely applicable (§5), and none required a shared base class to achieve any of this — confirming, in practice, the Universal Record Model's own conclusion that this is a discipline, not an implementation.

## 8. Visual Consistency

Spacing, typography, table density, badges, status colors, loading states, and skeletons were checked across all seven applications and found already unified — they were all built on the same shared primitives (`Button`, `Badge`, `DataTable`, `EmptyState`, `Skeleton`) from Sprint 2/2.5 forward, and Finance and Community were both built by directly extending Work's established visual language rather than inventing new ones. The one real inconsistency found was the z-index drift already fixed in §2. No other visual changes were needed.

## 9. Mobile

Walked through Community's list and create-drawer at 375px width (Temple institution) — confirmed zero horizontal overflow, the create drawer correctly fills the viewport edge to edge, and the newly-added Timeline and Related Records sections render correctly at mobile width with no clipping. The Shell's own mobile navigation is unchanged code, already verified in prior milestones, and wasn't touched by anything in this sprint.

## 10. Tamizhi Readiness

No AI was implemented, per instruction. Confirmed every domain still exposes exactly the extension points the Constitution already defines and nothing more: real Identity and a "now" (Search-readiness, §6), real History eligibility now universal across four applications instead of one (§1 — a direct, if indirect, strengthening of what a future summarization capability would read from), and Attention contributions that are all already disciplined enough to be indistinguishable from a Tamizhi-authored one, per the Institution Intelligence Principles' own closing test. Nothing new was named or built here — this sprint's real contribution to Tamizhi readiness is that more of the platform's memory (the extended Timelines) is now genuinely worth reading.

---

## Verification performed

1. **Typecheck** — `npx tsc --noEmit`: clean, exit 0, after every change in this sprint.
2. **Lint** — `npx next lint`: clean.
3. **Production build** — clean `.next`, `npx next build`: compiled successfully, all 17 routes generated.
4. **Full founder walkthrough** — Company institution: created a Position, appointed and ended a holder inside one open panel (the Timeline bug's exact repro case), created and completed a Task, recorded an Expense, created and edited a Community Contact — every action's Timeline and Home History confirmed correct, live, without reloads.
5. **Multi-user walkthrough** — reused M7's and M8's own already-verified multi-user proofs (a real Treasury approval decided by someone other than the expense's creator; a same-actor exclusion correctly blocking a founder from approving their own expense) — nothing in this sprint touched authority resolution, so these were confirmed still correct by inspection rather than re-run from scratch.
6. **Mobile walkthrough** — Community at 375px, Temple institution: confirmed no horizontal overflow, drawer renders correctly, Timeline/Related Records sections render correctly.
7. **Cross-institution walkthrough** — Company and Temple both confirmed: nav labels correctly institution-aware ("Customers" vs. "Community"), Position responsibility panel correctly shows all seven Areas including the newly-Provenance-tracked Position, History narration correct in both.
8. **Regression testing** — Work and Money both confirmed rendering correctly after every change in this sprint; zero console errors across the entire walkthrough.

## Honest assessment

The single most valuable thing this sprint found was not on the founder's own focus list explicitly — it was a real bug (the Timeline refresh gap) that would have shipped silently into M9 and eroded trust in every Timeline built after it, the exact "amplify existing inconsistency" failure mode the founder named as the reason for running this sprint at all. Finding it here, by actually building the Universal Timeline extension rather than only auditing for one, is exactly why an implementation sprint catches what a pure design review can't.

What remains honestly open, named rather than hidden: no shared `Drawer` primitive exists yet (four files still hand-roll nearly identical markup, now with a fourth near-identical Timeline block added to the duplication); no shared `Input`/`Select`/`Textarea` primitive exists yet (the platform's single most overdue piece of debt, unchanged by this sprint); Affiliations and Capabilities are now recorded to History but don't yet have their own filterable Timeline the way Positions do. None of these block M9. All three are named honestly in the Technical Debt Register, not smoothed over.

ARUMBU's seven built applications now share one real memory mechanism (History, universally), one real detail-drawer shape (with the z-index drift closed), and one real discipline for what a Record is (with the one Provenance gap this audit found now closed). That is a defensible, evidence-based "yes" to the founder's own question — whether it feels like one operating system rather than eight applications sharing a sidebar — for the specific things this sprint actually tested, not a claim that nothing is left to unify.
