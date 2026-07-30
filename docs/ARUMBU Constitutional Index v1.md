Status: 🟡 Living index — updated whenever a document is frozen, superseded, or added to `docs/`. Not itself a constitutional document; it governs nothing and decides nothing. Its only job is to make everything else in this folder findable, in the right order, by anyone who has never seen this project before.

# ARUMBU Constitutional Index v1

## Read this first

If you are a human, Claude, Tamizhi, or any future contributor about to touch this codebase for the first time: read this document before opening any code. It tells you what exists, why it exists, what depends on what, and which of the twenty-four documents in `docs/` you actually need for the task in front of you — not all twenty-four, every time.

Two things to know before anything else:

**The product is called ARUMBU.** Every document written before the branding migration was authored under the internal engineering name "RDIOS," and every one of those files carries a preserved note saying so at the top, unmodified. "RDIOS" remains correct as the internal/engineering term for the underlying platform; "ARUMBU" is what it's called everywhere a person actually sees it. Don't rename the old files, and don't be confused when their filenames and their prose don't match this sentence — that's intentional, explained fully in the Branding Migration Report below.

**The Constitution is closed. Implementation extends it; implementation does not reopen it.** Per the Architecture Freeze Declaration and confirmed again by the Master Roadmap: "a Frozen Architecture is presumed correct until a genuinely new domain requirement proves otherwise." If something you're building seems to conflict with a frozen document, the fix is almost always in your implementation, not in the document — and if it genuinely isn't, that gets named specifically and resolved the way every reversal in this project's own history was handled: honestly, in a new reconsideration document, never by quietly ignoring the old one.

---

## Section 1 — The Constitution (frozen, governs everything downstream)

This is the exact list the Master Roadmap itself names as constitutional. Read top to bottom the first time; after that, only the row relevant to what you're building.

| Document | Purpose | Depends on | Governs |
|---|---|---|---|
| **RDIOS Product Philosophy v1** | The *why*. What an institution is, why it outlives every person in it, why software should serve institutional memory and attention rather than replace either. Wins over every other document, including software convenience, if a real conflict ever appears. | Nothing — the root. | Everything. Every other document was checked against this one before being written. |
| **RDIOS Product Foundation v1** | The *what*. The five-layer architecture (Data, Shared Engine, Application, Operating System, Institution Configuration), the Attention Contract, which applications exist and what each answers. | Product Philosophy v1. | Every milestone's placement — which layer a new piece of work belongs in. |
| **RDIOS Experience Principles v1** *(see note below)* | Act Now / Be Aware / History tiering, the Interruption Rule, the Assistant Voice. | Product Philosophy v1. | Home, the Attention Engine, every user-facing sentence in the product. |
| **RDIOS People Domain Review v1** | Person / Institution Membership / Position / Affiliation / Capability — the internal-relationship domain model, and the rule that employment is emergent, never a field. | Product Foundation §3–§4, Experience Principles. | M3 (People), M4 (Organization/Position), and the access-boundary rule every later domain (Community) reuses. |
| **RDIOS Audit Engine Design v1** | The real audit trail underneath History — Events-fed, append-only, `subject_type`/`subject_id`, tenant-scoped, two-layer read permission. | Product Foundation §7 (names the gap this resolves). | History, everywhere it appears; every `recordHistory()` call site in the codebase. |
| **RDIOS Architecture Freeze Declaration v1** | The formal act of closing the design phase. Not new content — names what's frozen and states the rule that implementation extends, never reopens, the Constitution. | Freezes Product Foundation, People Domain Review, Audit Engine Design, Experience Principles, Institution Setup Experience v2, and every RDE-precedent engine named reusable in the Foundation. | The transition from design to Build → Test → Verify → Polish → Ship, starting at M1. |
| **RDIOS Institution Setup Experience v2** | Purpose as the true beginning of an institution — prior to Invite and Organization-shape — and Progress answered by Purpose + History, never a percentage. Supersedes v1 in full. | Product Foundation, People Domain Review, Experience Principles; folds in the v1 Reconsideration. | M2 (Institution Purpose, onboarding). |
| **RDIOS Visual Design System v1** | The visual constitution — design tokens, five themes, typography, motion, shared components, accessibility. A third constitution alongside the Engineering Constitution and Experience Principles: this one governs how it looks. | Product Philosophy v1, Experience Principles. | Every screen. Directly implemented across Implementation Sprint 2 and 2.5. |
| **RDIOS Platform Integration Strategy v1** | Where ARUMBU sits at ecosystem scale — its relationship to RDE, to sibling products, and to Tamizhi as a shared intelligence layer, never owned by any one product. | Product Foundation's layering, extended to platform scale. | Any future API, portal, mobile client, or the boundary of what Tamizhi is allowed to be inside ARUMBU. |
| **RDIOS Institution Intelligence Principles v1** | The complete behavioral contract for Tamizhi inside ARUMBU — when it speaks, stays silent, recommends, asks, creates work, refuses. Governs behavior, not placement (Platform Integration Strategy already settled placement). | Product Philosophy, Product Foundation, Experience Principles, Platform Integration Strategy, Visual Design System, live M5 Authority implementation. | Every application, forever — no future application designs its own answer to "how should Tamizhi behave here." Directly consulted by the M7 Finance & Assets Report and both Community Domain documents. |
| **RDIOS Governance & Responsibility Model v1** | Who decides, and how authority moves. Areas of Responsibility (not actions) held by Positions; Delegation/Temporary Authority/Escalation/Emergency Governance as one time-boxed-widening primitive; Approval Chains named by Area, never by person. | Reads against every document above; extends the live M5 Authority Engine rather than replacing it. | M5 (Authority), M6 (Work/Approvals), M7 (Finance/Treasury approval same-actor exclusion) — every future application's approval logic. |
| **RDIOS Institutional Policy Model v1** | What a correct decision looks like, once someone has standing to make it. Policy as an institution-owned, versioned, hierarchical statement; Business Rules as its compiled numeric residue, never a replacement for it. | Governance & Responsibility Model v1 (who decides) — Policy answers what "correct" means for that same decision. | No milestone yet built consumes this directly; it is the frozen answer waiting for the first application (Work's purchase flow, Finance's expense thresholds) that needs real policy content instead of a hardcoded number. |

**Note on Experience Principles v1:** referenced as frozen by name in the Architecture Freeze Declaration, the Master Roadmap, and nearly every document above — but no standalone `RDIOS Experience Principles v1.md` exists in this repository. Its content (Act Now / Be Aware / History tiering, the Interruption Rule, the Assistant Voice) is inherited RDE precedent, restated directly inside Product Foundation §5 (Operating System Layer) and treated as frozen without ever being reproduced as its own file here. This is not a gap this index invented — it is an honest observation worth knowing before you go looking for a file that isn't there.

**Constitutional Phase: Complete**, per the Master Roadmap's own declaration, closed by Governance & Responsibility Model v1 and Institutional Policy Model v1. No further foundational document gets written unless implementation itself discovers a genuine flaw.

---

## Section 2 — Superseded (preserved as history, not current)

| Document | Status | Why it's kept |
|---|---|---|
| **RDIOS Institution Setup Experience v1** | ⚪ Superseded by v2. | The reasoning trail — v2 restates its conclusions inside a deeper argument rather than deleting the shallower one. |
| **RDIOS Institution Setup Experience Reconsideration v1** | ⚪ Folded into v2 in full. | Shows the actual self-challenge that produced v2 — the exact shape of investigation this Constitutional Index asks every future reconsideration to follow. |

Never read these to learn current behavior — read v2 for that. Read these only to understand *why* v2 says what it says.

---

## Section 3 — Post-freeze design reviews (new domains, not yet accepted)

Written after the Constitutional Phase closed, for domains the Constitution didn't yet need to cover. These extend the Constitution; none of them have reopened it.

| Document | Purpose | Depends on | Governs |
|---|---|---|---|
| **ARUMBU Community Domain Review v1** | The external-relationship domain model — Contact, Relationship, the three universal Directions (Receiving/Supporting/Supplying), Type as institution configuration. The external counterpart to People. | Product Foundation §4, People Domain Review v1 (the access-boundary rule this document restates and confirms), Institution Intelligence Principles v1. | The not-yet-built Community application (a future milestone). |
| **ARUMBU Community Domain Reconsideration v1** | Self-challenge of the Review above, in the same shape as the Institution Setup Reconsideration. Confirms the three Directions, adds Organization as a first-class Contact kind, sharpens the People/Community boundary description, answers the six-month test with a History-filtered Timeline. | Community Domain Review v1 (what it reconsiders), Institution Setup Experience Reconsideration v1 (the template it follows), ARUMBU Platform Cohesion Review v1 (the History-gap finding it explicitly closes). | The same future Community milestone — its conclusions are meant to be folded into a Community Domain Review v2 before that milestone's design freezes. |
| **ARUMBU Universal Record Model v1** | Constitutional-altitude investigation: is there one underlying "Record" concept beneath Person, Contact, Task, Asset, Policy, and most of what every application creates? Concludes yes, as a discipline and checklist — never a literal shared table or engine. | Explicitly instructed not to reopen, and checked against, every document in Section 1 plus both Community Domain documents. | No single milestone — a cross-cutting checklist every future domain (Community, and whatever comes after it) should be checked against during its own design phase, the same way Governance's Areas of Responsibility is already a checklist every application inherits. |

None of these three are frozen. They are accepted design reasoning, awaiting the founder's decision to fold them into a frozen v2 (Community) or into the Constitution's applied discipline (Universal Records) the same way the Setup Reconsideration was folded into Institution Setup Experience v2.

---

## Section 4 — Operational

| Document | Purpose | Depends on | Governs |
|---|---|---|---|
| **RDIOS Master Roadmap v1** | 🟡 Living, never frozen. The operational source of truth — current milestone, what's built, what's next, the six-step Verification Policy every milestone follows. Open this before starting work each day. | The entire Section 1 Constitution, which it operates under rather than contains. | Which milestone is active right now, and what "done" means for it. |

---

## Section 5 — Evaluative reviews and audits

Pure observation documents. None of them propose architecture; all of them check the built product against Sections 1–4 and report honestly on what they find.

| Document | Purpose | Checks against | Preceded / informed |
|---|---|---|---|
| **RDIOS Product Validation Sprint v1** | One week of using the built product as a founder would — signing up, inviting people, building an organization, assigning responsibility, doing and approving work — cold, without reading the code. | The live product as it stood after early milestones. | Implementation Sprint 1 (its top finding — offboarded users retaining access — directly triggered that sprint). |
| **RDIOS Product Readiness Review v1** | 🟡 Living baseline. A cited, file-and-line audit of exactly what surface existed at the time (Identity, Auth, Shell, Home — five real screens, seven empty shells). Explicitly scoped to what's real, not a hypothetical finished product. | The live product as it stood at the time. | Implementation Sprint 1 and 2. |
| **ARUMBU Platform Cohesion Review v1** | Live use of ARUMBU across five institution types after M7, checking whether seven real applications feel like one operating system — cross-application memory, Attention coverage, History consistency, language, navigation, visual consistency, Tamizhi seams, technical debt. | Experience Principles, Visual Design System, Institution Intelligence Principles, and the actual M1–M7 implementation. | The decision to run an integration sprint, or proceed to M8 — and directly fed one specific finding (the History creation/ending asymmetry) into the Community Domain Reconsideration. |

---

## Section 6 — Implementation reports (what was actually built)

Historical record, not governing documents. Each one implements or stabilizes something Sections 1–5 already specified; none of them make new design decisions.

| Document | What it covers | Implements |
|---|---|---|
| **RDIOS Implementation Sprint 1 Report** — *Trust & Product Cohesion* | Identity & Access, Session Management, Notifications, Empty States, Accessibility, Product Consistency, Founder Experience, User Preferences. | The Product Validation Sprint's findings — no new module, no architecture change. |
| **RDIOS Implementation Sprint 2 Report** — *Visual Design System* | Design tokens, five themes, typography, shared UI primitives, empty/loading states, motion. | Visual Design System v1, exactly, naming every value it had to author that the frozen document left conceptual. |
| **RDIOS Implementation Sprint 2.5 Report** — *Platform Polish* | Second typeface, Toast system, real contrast validation, the DataTable primitive, forms, micro-interactions, performance. | Gaps Sprint 2 named honestly and left open. Concludes "Ready for Finance." |
| **ARUMBU Branding Migration Report** | RDIOS → ARUMBU across every customer-facing surface; internal engineering references left untouched; all prior documents preserved unmodified with a note. | The founder's branding directive — pure rename, no architecture, no feature work. |
| **ARUMBU M7 Finance & Assets Report** | Financial Accounts, Expense/Income records (one shared transaction spine), the Asset Registry, three new Areas of Responsibility (Finance/Treasury/Assets), Attention and History contributions, named Policy extension seams. | People Domain Review's application pattern, Governance & Responsibility Model (same-actor exclusion, Areas of Responsibility), Institutional Policy Model (named, not built, extension seams), Institution Intelligence Principles (Tamizhi boundary), Visual Design System (UI reuse). |

---

## Dependency graph

```
Product Philosophy v1
        │
        ▼
Product Foundation v1 ──── Experience Principles v1 (embedded, no standalone file)
        │                           │
        ├─────────────┬─────────────┼─────────────────────┐
        ▼              ▼             ▼                     ▼
People Domain      Audit Engine   Institution Setup    Visual Design
Review v1           Design v1      Experience v2        System v1
        │              │             │                     │
        └──────┬───────┴──────┬──────┘                     │
               ▼               ▼                            │
   Architecture Freeze Declaration v1  ◄──────────────────────┘
               │
               ▼
  Platform Integration Strategy v1
               │
               ▼
  Institution Intelligence Principles v1
               │
               ▼
  Governance & Responsibility Model v1
               │
               ▼
  Institutional Policy Model v1
               │
               ▼
     ── Constitutional Phase: Complete ──
               │
               ├──► M1–M7 implementation, Sprint 1 / 2 / 2.5, Branding Migration
               │            │
               │            ▼
               │    ARUMBU Platform Cohesion Review v1
               │            │
               ▼            ▼
  Community Domain Review v1 ──► Community Domain Reconsideration v1
               │
               ▼
     ARUMBU Universal Record Model v1
     (checked against the entire stack above; contradicts none of it)
```

---

## What to read before touching code — by task

**Touching anything at all, for the first time:** Product Philosophy v1, Product Foundation v1, the Master Roadmap (for what's currently active). That's the floor.

**Building inside an existing application (People, Work, Money, and their real screens):** add People Domain Review v1 (if People-adjacent) or Governance & Responsibility Model v1 (if the work touches who-can-decide-what), plus whichever Implementation Sprint report last touched that surface, so you don't reintroduce something Sprint 2/2.5 already fixed.

**Designing a new application or domain (the next Community, Projects, or Documents build):** Product Foundation §4, People Domain Review v1 (the access-boundary rule), Governance & Responsibility Model v1, Institutional Policy Model v1, Institution Intelligence Principles v1, and — now that it exists — the Universal Record Model v1's ten-question checklist, applied once, early, rather than re-derived under deadline.

**Touching anything Home, Attention, or History-shaped:** Audit Engine Design v1 first, always — it is the one document most likely to already contain the answer before you invent a new mechanism.

**Touching anything Tamizhi-adjacent, in any application:** Institution Intelligence Principles v1, full stop, before writing a single line. Nothing about "how AI should behave here" is ever a new design question — it was answered once, for everyone, already.

**Writing a new design document at all:** read this index first, then the specific document your work extends, then check Section 1's dependency graph to make sure you're not about to quietly contradict something two layers up. If you think you've found a real conflict, name it precisely and write a Reconsideration in the shape of the two that already exist — never edit a frozen document in place.

---

## Keeping this index honest

This document is not self-maintaining. Whenever a new document is written, frozen, superseded, or folded into another, this index needs the same update, the same day — an index that quietly falls out of date is worse than no index, because it would be trusted anyway. There are twenty-six documents in `docs/` as of this writing — eleven constitutional files (a twelfth, Experience Principles v1, is frozen but has no standalone file, per the note in Section 1), two superseded, three post-freeze reviews, one operational, three evaluative, five implementation reports, and this index itself — the exact count is the first thing worth re-checking the next time this index is opened to update it.
