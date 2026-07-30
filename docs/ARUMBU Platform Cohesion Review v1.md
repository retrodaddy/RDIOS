Status: 🟡 Review complete — pure observation, no implementation
Method: Live use of ARUMBU as a founder would, across five institution types (Company, Temple, Hospital, NGO, School), plus a full-repository consistency audit
Scope: Identity, Institution Setup, People, Organization, Authority, Work, Finance & Assets — everything built through M7
Rule followed: No code was written or changed to produce this document. Every finding below is either something observed on screen or something read directly in the source, cited by file and line.

---

## How this review was done

I walked through ARUMBU exactly as instructed — not as its builder, as a founder. I created five institutions (a technology company, a temple, a hospital, an NGO, and a school), moved between Home, People, Organization, Work, Money, and Settings for each, invited a second person into one of them and used two real accounts side by side, and read every screen's actual text rather than assuming it from memory. Alongside that, I read the full application-layer source to check for the kinds of drift that don't show up in a single session — duplicated logic, silent gaps in History, and inconsistent authority checks — since those only become visible by comparing every call site against every other one, not by clicking through the product once.

---

## Biggest strengths

**The institution-neutrality discipline actually holds.** This was the single most important thing to verify, and it held up under real use, not just inspection. Across Company, Temple, Hospital, NGO, and School, the same screens rendered with genuinely different, correct language with zero hardcoded assumptions leaking through: the customer-facing nav destination read "Customers" for the company, "Community" for the temple, "Beneficiaries" for the NGO; Position responsibility labels read "Manage roles and people" / "End someone's involvement" for the temple and "Manage positions and people" / "Offboard someone" for the company — the exact same three new Finance/Assets responsibilities (`finance.manage`, `treasury.approve`, `assets.manage`) I added in M7 slotted into this system with zero code changes needed, because `PositionSidePanel.tsx` maps over the responsibility catalog dynamically rather than listing it by hand. This is real architecture paying off, not an accident.

**The approval mechanics are genuinely trustworthy, and I proved it, not just read it.** I invited a second real person into the temple institution, gave her real Treasury authority through the actual Position system (not a shortcut), and confirmed from her own session that she — and only she — saw the pending expense in her Act Now, that the founder could not approve his own expense, and that both of their Home screens updated correctly with the real History narration afterward. Governance's same-actor exclusion rule, first built for Work's Approvals, was correctly re-applied to Finance's expense approvals independently and behaves identically. This is the platform's most important promise, and it's real.

**History's voice is disciplined.** Every one of the ~27 `recordHistory()` call sites across Identity, People, Work, and Finance uses the same simple-past, actor-first sentence shape — "{Person} {verb-ed} {object}." — with no drift into passive voice or a different tense in any single application. A founder reading History top to bottom would never notice which application wrote which line. That's a real, and easy to lose, discipline.

## Biggest weaknesses

**Half the operating system doesn't exist yet, and it shows the moment you leave the four real applications.** Customers, Projects, Documents, and Reports — four of eight primary nav destinations — are still the identical `EmptyApplication` stub, rendering only a calm, institution-aware sentence with no visual distinction from a fully working screen. The Shell presents all eight as equally weighted. This is a legitimate, deliberate consequence of "smallest usable slice" delivery, not a bug — but it is the single most immediate thing a founder would notice moving through the product for the first time, and it is worth naming plainly rather than only implicitly known from the roadmap.

**Finance's own M7 build pass reached a maturity of thinking that older applications never got revisited to match.** Finance's Attention contributions (a decidable pending expense, an asset with nobody accountable for it, a warranty expiring within 30 days) all share one instinct: surface what could silently rot before it becomes a problem. People and Work, built earlier, were never revisited with that same instinct. There is no "this position has been vacant a long time" nudge, even though the exact same computation that produces "asset in use with nobody accountable" (`os/attention/engine.ts:122-133`) could produce it. There is no "N tasks have no assignee" nudge for whoever holds `work.manage`, despite the structurally identical asset-custodian pattern existing one function away. This isn't a Finance problem — it's evidence that Attention coverage grew unevenly as applications were added, and nobody went back to true it up.

**There is no shared form-input primitive**, and the absence is now expensive. `components/ui/` has a proper `Button`, `Badge`, `Card`, `DataTable`, and `EmptyState` — every one of them a real shared component with variant props. There is no `Input`/`Select`/`Textarea` equivalent. The result: the same ~89-character Tailwind class string is hand-typed 28 times across `MoneyBoard.tsx`, `WorkBoard.tsx`, `CreatePositionCard.tsx`, and `AppointHolderCard.tsx`, with a second near-identical "compact" variant repeated 7 more times, and further one-off forks wherever a `disabled:` state needed adding. This is exactly the kind of debt that was cheap to create once and will get expensive to fix later — every future visual tweak to how a form field looks means finding and editing the same string in six-plus files by hand.

---

## 1. Cross-application memory

Mostly real, with one clear gap. Home's Be Aware genuinely reads live from every application — I watched it update correctly for Money and Assets the moment real data existed, exactly the way it already did for People and Work. The one place memory visibly does *not* connect: Finance's document references (`DocumentRef`, a person typing "Receipt #4521" against an expense or asset) live entirely inside Finance's own store and are invisible everywhere else — including the Documents destination itself, whose entire stated purpose ("the paper trail an institution accumulates and needs to be able to find again") is precisely what those references are for. Right now, a reference typed on an expense cannot be found from Documents, because Documents doesn't exist yet. This isn't a bug so much as a preview of the seam Documents will need to close.

## 2. Attention — is Home still the real operating system?

Yes, for what's been built, and this is worth stating plainly: I never once had to go looking for a decision. Every real thing I needed to act on — an unseated founder, an unfilled position, a task assigned to me, an approval waiting on my authority, an expense waiting on Treasury, an asset with no custodian — appeared on Home without my visiting the owning application first. That is the single clearest sign the Attention Contract is working as designed, not just as documented.

The gap is coverage, not mechanism, and it's specific: escalated Work approvals that reach a dead end (`findEscalationTarget` can return `null` when there's no position above the stuck step — `engines/authority/resolver.ts:77-81`) surface nowhere; a founder would have to already know to go looking in Work to discover a permanently stuck approval. Vacant positions and unassigned tasks have the same blind spot, described above. None of these are hard to add later — the pattern to copy already exists in Finance's own contribution — but today, Home would let a genuinely stuck institutional decision sit invisible.

## 3. History

Strong where it's been built, genuinely uneven in coverage. The clearest pattern: across People, Work, and Finance, every action that *creates or grants* something is far more likely to be recorded than the corresponding action that *ends or revokes* it. Appointing someone to a position is recorded; ending that appointment is not (`applications/people/actions.ts:177` vs. its `endHolderAction` at `:181-190`). The same asymmetry repeats for affiliations and capabilities — granting and ending/revoking are both silent for affiliations, and both silent for capabilities, meaning an entire category of real institutional change (someone's standing being reduced or removed, one item at a time rather than through a full offboarding) currently leaves no trace at all. A founder scrolling History today would see who joined and who was appointed, but not know that a capability was quietly revoked last week.

Smaller gaps in the same vein: reopening a completed task is silent (only completion is recorded, `applications/work/actions.ts:102-104`); attaching a document reference to an expense or asset is silent; editing an asset's service notes is silent even though changing its status one field over is recorded; and a founder changing their own default landing page or theme leaves no trace, which is arguably correct (a personal preference isn't institutional history) but was never explicitly decided one way or the other. Nothing observed creates noise — I found no case of a trivial action cluttering History. The problem throughout is omission, not overproduction.

## 4. Language

Consistent in the register that matters most — no application sounds corporate where another sounds plain, and nothing in Finance reads like it wandered in from spreadsheet software. The `notResponsible()` "isn't your responsibility here" phrasing is byte-identical across Work, People, and Finance's action files, and Finance's own field labels ("Vendor / payee," "Recorded by") sit in exactly the same plain register as Work's "Awaiting {label}" and People's "Reports to."

Two small, real drifts worth naming precisely because they're the kind that are invisible until pointed out: `components/os/PositionsTable.tsx`'s empty-state says "start appointing people to **roles**" — the one place in the entire People/Organization surface that says "roles" instead of "positions," even though the Authority catalog itself is explicit that "Position," never "role," is the correct word (`engines/authority/types.ts:6-11`). And Work says "Awaiting {responsibility}" while Finance says "Awaiting {responsibility} **approval**" for what is conceptually the identical fact — a small phrasing fork between the two applications that most naturally handle approval-like decisions.

Separately, and not specific to any one application: institution names ending in "s" produce an awkward possessive wherever the pattern `{name}'s` is used — Settings currently reads "Aurora Technologies's settings," which is technically defensible English but doesn't read like a sentence a person would actually write.

## 5. Navigation

A founder can move between the four real applications without ever feeling like they've changed products — the sidebar, the page header pattern ("eyebrow label" + question-framed `<h1>` + one sentence of context), and the destination-to-destination transitions are all identical in shape. Where the illusion is honestly incomplete is the four stub destinations sitting at equal visual weight beside the real ones — nothing in the Shell distinguishes "this is a working application" from "this is calm placeholder copy" until you click in. That's a defensible product choice (never say "unfinished"), but it does mean navigation currently promises slightly more than exists.

## 6. Visual consistency

Cards, badges, buttons, tables, toasts, skeletons, and motion are genuinely one system — `Button`, `Badge`, `DataTable`, `EmptyState`, and `Toast` are real shared primitives, and Finance's UI was built entirely on top of them rather than inventing new visual language, which is exactly what "feel like ARUMBU, not accounting software" required. Where this breaks down is forms: with no shared `Input`/`Select`/`Textarea`, every drawer hand-rolls its own field styling, and — worth being honest about since I wrote it — Money's own three tabs aren't even internally consistent with each other: Transactions and Assets render through the shared `DataTable` primitive (sortable columns, empty states, the works), while Accounts renders a hand-written `<ul>` list, the same older pattern People's roster still uses. That's not a cross-application inconsistency so much as evidence that `DataTable` arrived mid-way through the platform's life and was applied where it was convenient rather than uniformly.

## 7. Institution neutrality

Repeated in full for Company, Temple, Hospital, NGO, and School. Every screen held up. Nav labels, Position responsibility language, onboarding placeholder examples, and Finance's own copy all read naturally for each — I specifically checked whether "Treasurer," "Approve spending," and "Manage assets" felt out of place for a temple or an NGO, and they didn't; nothing about Finance's vocabulary assumes a company. The one moment institution-type language visibly *didn't* need to differ and correctly didn't: Finance has zero institution-type-specific copy anywhere, which is the correct choice, not a gap — money and property mean the same thing everywhere, and the review found no place where that neutrality should have bent and didn't.

## 8. Tamizhi readiness — seams only, nothing built

No AI was added or designed. These are the places a future intelligence layer would naturally attach to what already exists, based on what the current architecture already does:

- **The Attention Engine is the obvious seam.** `composeActNow`/`composeBeAware` (`os/attention/engine.ts`) already do the conceptual job of "read everything, decide what crosses the threshold" — today with fixed, hand-written rules. This is the natural home for ranking, prioritizing, or explaining *why* something needs attention, without changing what the function returns to the rest of the product.
- **History is already a plain-English institutional narrative**, written in a single consistent voice — the natural feed for a future "what happened, and why does it matter" summarization capability. But its current gaps (§3 above) are exactly the gaps a future summarizer would inherit silently; closing them is a precondition for trusting any future intelligence built on top of History, not an unrelated task.
- **`applications/finance/policy.ts` literally names itself as a seam already** — `resolveExpenseApprovalArea` and `accountCreationRequiresApproval` are single-caller functions that currently return constants specifically so a real Policy Engine (rule-based or intelligent) can replace the body without touching any call site.
- **Reports (`/reports`) is already described, in its own frozen nav copy, as the destination for exactly what an intelligence layer would produce** — "the handful of numbers and trends worth a founder's attention without having to go looking for them — a summary, not a spreadsheet." It is currently an empty stub with no data source wired to it at all; when it's built, it's worth noticing that its own product description already reads like a mission statement for Tamizhi rather than a manually maintained dashboard.
- **Escalation (`findEscalationTarget`, `engines/authority/resolver.ts:77-81`) is a fixed, one-hop, rule-based function today** — a natural seam for smarter "who should actually decide this" suggestions later, without changing Governance's core rule that escalation only ever widens a pool, never reassigns a decision.

## 9. Trust

Asked continuously, as instructed: would I trust ARUMBU with tomorrow's work if I were actually running an institution on it? For the parts that are built, mostly yes — the approval mechanics, the same-actor exclusion, and the Attention Contract's coverage of what has been built are all real and were proven live, not assumed. Where the honest answer drops toward "not yet": the History gaps in §3 mean I could not yet trust ARUMBU to be a complete record of what happened to my institution — a founder auditing six months from now would see appointments but not removals, grants but not revocations, and that's a real trust gap for something explicitly pitched as "institutional memory." And with four of eight applications still unbuilt, I would not yet trust ARUMBU to be where I look *first* for everything — only for the four things it currently knows about. Neither of these is a surprise given the roadmap, but naming the gap honestly is the point of this exercise.

## 10. Technical debt

Ranked by how expensive it's becoming, not by how easy it would be to fix:

1. **No shared form-input primitive** (§6, "Biggest weaknesses"). The most consequential gap in `components/ui/` — every one of ~10 create/detail drawers hand-rolls the same field styling, in at least four or five slightly different variant strings. This is the one item on this list that gets strictly more expensive with every new drawer built on top of the current pattern rather than a shared component.
2. **The bottom-sheet and right-side detail-drawer markup is copy-pasted, not shared**, across `WorkBoard.tsx`, `MoneyBoard.tsx` (three separate create drawers plus two detail drawers), `PositionSidePanel.tsx`, `AppointHolderCard.tsx`, and `CreatePositionCard.tsx` — down to z-index values that have already drifted (`z-[70]` in most places, `z-[80]` in two others) with no shared constant naming which is correct.
3. **`AffiliationsCard.tsx` and `CapabilitiesCard.tsx` are near line-for-line duplicates** of each other — identical state shape, identical add/end transition-wrapper logic, differing only in which action and label strings they call. A single generic list-card component was never extracted.
4. **`notResponsible()` and the same-actor-exclusion check are each reimplemented independently per application** (Work, People, Finance) rather than shared from `engines/authority`. Nothing has drifted yet, but nothing structural prevents it from drifting the next time one of the three is edited without remembering the other two exist.
5. **Six independent `globalThis.__rdios*Store` singletons**, each guarded by an identical five-line "survive dev-mode reload" idiom that was copy-pasted rather than factored into one helper. No actual data overlap was found between them — this is boilerplate duplication, not a data-integrity risk.

None of this is urgent in the sense of being broken today — everything reviewed here works correctly in live use. It is debt in the precise sense the founder asked about: cheap to have created once, and it will cost more the longer another application gets built on the current pattern instead of on a shared one.

---

## What must be fixed before M8

- **Nothing is broken enough to block M8 on correctness grounds.** Every mechanism tested live — Authority, approvals, same-actor exclusion, cross-application Attention, institution neutrality — held up under real, adversarial-ish use (two real accounts, five institution types, a real approval decided by someone other than the founder).
- If M8 is another application built on the current component patterns, the **shared form-input primitive (§10.1)** is the one item worth resolving first — every additional drawer built without it makes the eventual fix larger for no product benefit gained in the meantime.
- The **History gaps around ending/revoking grants (§3)** are worth closing before trust in "institutional memory" is asked of a real institution, though they don't block continued building.

## What can safely wait

- The four stub applications (Customers, Projects, Documents, Reports) — already known, already sequenced by the roadmap, not a surprise finding.
- Attention Engine coverage gaps for People/Work (vacant positions, unassigned tasks, stuck escalations) — real, worth eventually matching to Finance's standard, but nothing currently silently fails; it's an absence, not a wrong answer.
- The small language/terminology drifts (§4) — genuine, but each is a one-line fix whenever that file is next touched for any other reason; none are visible enough to erode trust today.
- The duplicated drawer markup and the `AffiliationsCard`/`CapabilitiesCard` near-duplication (§10.2–10.3) — real debt, but stable and not actively growing worse unless more near-identical components get added without extraction.

## Honest readiness score

**7.5 / 10 for what has been built. Not yet a 10 for "ARUMBU," because ARUMBU is only two-thirds visible today.**

The seven real pieces — Identity, Institution Setup, People, Organization, Authority, Work, and Finance & Assets — genuinely feel like one operating system when used together, not seven products stapled side by side. The architecture decisions that made this possible (institution-type terminology threaded everywhere, the Authority catalog as the single source of responsibility language, Attention reading live across every application, History as one shared narrative voice) are sound and are the reason this review found composition problems rather than foundational ones. Nothing discovered here suggests the platform needs to be rebuilt, or even substantially redesigned — every finding in this document is a gap to close or a pattern to extract, not a flaw to reverse.

The honest ceiling on the score, and the reason it isn't higher, is that a founder using ARUMBU today would correctly perceive it as "four real rooms and four empty ones in the same house" — and inside the four real rooms, would find a genuinely trustworthy set of mechanics sitting on top of a memory that has more gaps in it than its own billing (History) admits to. Both of those are fixable without touching architecture. Whether to spend a sprint doing that now, or carry it forward into M8 and true it up later, is exactly the decision this document exists to inform — not to make.
