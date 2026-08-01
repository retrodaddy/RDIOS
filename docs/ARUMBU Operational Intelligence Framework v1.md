Status: 🔵 Architectural discovery — design only, no code, no schema, no roadmap change. The ARUMBU Constitution v1 is treated as permanently frozen and immutable throughout. Extends Reports/Analytics (M11), the Audit Engine's polymorphic pattern, the Attention Contract, and the Institutional Policy Model's Business Rule mechanism; does not touch Tamizhi's behavioral philosophy, Governance, Authority's resolution logic, or Attention's tiering rules. Where this document proposes a new engine, it proposes it exactly the way ARUMBU Constitutional Clarifications v1's own engine roster names itself — a living, non-frozen table — never as an edit to that or any other frozen document.

# ARUMBU Operational Intelligence Framework v1

## The guiding question, answered before anything else

*"What institutional problems can ARUMBU detect before humans notice them?"*

Every one that can be stated as a number, a ratio, a trend, or a threshold — computed the same way every time, from data the institution already has, with no model, no inference, and no judgment call involved in producing it. This is the deliberate, load-bearing boundary this entire document sits inside: **this is not artificial intelligence. This is operational mathematics** — arithmetic anyone could re-derive by hand given the same numbers, which is precisely what makes it trustworthy enough to run silently, continuously, and unsupervised in a way nothing model-based should ever be trusted to run.

## Why this is not Tamizhi, stated once, precisely

Institution Intelligence Principles already drew the line this document stands on: intelligence is a contributor, never a voice of its own, and every recommendation Tamizhi makes is provider-dependent, non-deterministic-capable, and requires a human Accept before anything happens. **A Signal requires none of that**, because it makes no claim beyond the arithmetic itself. "Cash runway is 3.2 months" is not an opinion Tamizhi formed — it is `balance ÷ burn rate`, true the moment it's computed, reproducible by anyone with the same two numbers and a calculator. This document's entire architecture exists to keep that distinction real in code, not just in prose — see §4.

---

## 1. The Operational Intelligence Engine — what it is, and what it isn't

**Not a new idea — the promotion of one that already exists and already works.** M11's own Analytics sub-capability (`applications/reports/analytics.ts`'s `computeObservations`) is already, today, exactly this kind of deterministic, threshold-and-trend-based computation — "Projects increasing in delays," "Expenses rising," "Approvals waiting too long" are Operational Signals in every sense this document defines, built correctly, months before this document exists to name the pattern. What Analytics has never been is **reusable beyond Reports**, or **a formal, first-class input Tamizhi can cite as Evidence** rather than reach informally.

This document proposes generalizing that existing, already-correct math into a fourth Shared Engine Layer citizen — the **Operational Intelligence Engine (OIE)** — sitting beside Authority, Search, and Tamizhi in the living, non-frozen roster ARUMBU Constitutional Clarifications v1 Part 3 already established for exactly this purpose ("updated the same day an engine's status changes"). Nothing about Reports' own Analytics computation is discarded — it becomes the OIE's first, and still primary, consumer, exactly the way Search's own adapters became reusable by both Search's UI and Tamizhi's rule engine without either one needing to change.

**Architecture, at the same level of restraint every prior engine in this corpus was designed with:**

- One **Signal Provider** per domain (`computePeopleSignals`, `computeWorkSignals`, `computeFinanceSignals`, and so on) — the identical per-domain-adapter shape Search's `indexPeople`/`indexWork`/etc. already proved, reading only each domain's existing provider, never a new data source.
- One shared `OperationalSignal` shape every adapter produces, carrying: identity, institution scope, which domain it came from, which of the ten measurement categories it belongs to (§2), the computation method used (ratio / trend / threshold / concentration / projection — a controlled, small vocabulary, never free text), the computed value and its unit, what it was compared against (a prior period, an institutional median, a configured threshold), when it was computed, and — reusing the Audit Engine's own polymorphic pattern directly — the `subjectType`/`subjectId` of the real Record(s) the signal is actually about.
- **No confidence field, ever.** This is the single sharpest, most consequential design choice in this document, and it is deliberate: confidence is Tamizhi's vocabulary (High/Medium/Low, per its own Recommendation Model), because Tamizhi's claims are inferential. A Signal's claim is never inferential — it either correctly computed the arithmetic or it has a bug, and "confidence" would quietly smuggle Tamizhi's epistemic uncertainty into a place that should never need it.

---

## 2. The ten measurement categories — what they mean, precisely

Applied consistently across every domain below, not redefined per application:

- **Resource** — how much of something exists right now (total balance, total headcount, total open Positions).
- **Consumption** — the rate something is being used or spent (burn rate, task-completion throughput, engagement frequency).
- **Wastage** — consumption without a traceable institutional reason (spend growing with no linked Project; a certified skill never assigned any matching Work; a Relationship going quiet).
- **Delay** — real elapsed time exceeding an expected or historical norm (Approval cycle time, Position vacancy duration, Document review time).
- **Imbalance** — an uneven distribution that should, by the institution's own historical pattern, be roughly even (task load skew across approvers, span-of-control skew across managers).
- **Risk** — a structural exposure, not yet a crisis, but one bad event away from becoming one (a single point of failure, a funding-source concentration, a reporting chain broken by a vacancy).
- **Projection** — a forward extrapolation of an existing trend, always labeled as a projection, never presented with a snapshot's implied permanence (runway, backlog-growth forecast, expiry clustering).
- **Shortage** — a real, current, or imminent gap between what's needed and what exists (an Area of Responsibility with pending decisions and zero holders; a known payment obligation exceeding current balance).
- **Overload** — a resource, almost always a person or a Position, carrying more than the institution's own historical median without a stated reason.
- **Opportunity** — an underused asset, relationship, or capability that already exists and could be put to real institutional use without acquiring anything new.

Not every category applies meaningfully to every domain, and §3's catalog says so plainly rather than forcing a weak fit to look complete.

---

## 3. Per-application signal catalog

### People

- **Wastage** — a Capability held by a Membership with zero Work items referencing it in the institution's own typical activity window. *An NGO's volunteer with a medical Capability, never once assigned anything health-related.*
- **Delay** — average time-to-fill a vacant Position, by Position type.
- **Imbalance** — Areas of Responsibility per Membership, compared against the institution's own median — the concrete, computable form of the same skew a founder might sense but never see stated as a number.
- **Risk** — a Position whose holder is the sole current holder of a given Area, with zero Delegation ever recorded for it. *A temple with a single trustee who has ever held the Finance Area — a real, present exposure to that person's absence, computable directly from Governance's own already-live holding and Delegation history.*
- **Projection** — at the institution's own current offboarding rate, the share of Positions likely vacant within a stated future window.
- **Shortage** — an Area of Responsibility with zero current holder anywhere in the institution — not a vacant seat, a genuinely unheld authority (a hospital with no one currently holding "Patient Safety," even if every clinical Position is filled).
- **Overload** — a Membership holding more concurrent Positions and Areas than the institution's own historical median.
- **Opportunity** — an Affiliation (a volunteer, a donor, a board member) whose recorded Capabilities match a currently-unmet institutional need.

### Organization

- **Imbalance** — span of control (direct reports per Position) compared against the institution's own median. *A garment factory floor supervisor with 40 direct reports against a plant-wide median of 8.*
- **Risk** — a Position that reports to a currently-vacant Position — a broken chain, computable directly from the live reporting graph, before it ever produces a visible symptom.
- **Overload** — the same span-of-control signal as Imbalance, expressed as a per-Position fact rather than an institution-wide distribution.
- **Opportunity** — two adjacent Positions with near-identical Areas of Responsibility, a structural consolidation candidate — named here strictly as an observation, never a recommendation to act, which stays Tamizhi's territory if it ever wants to surface it as one.

### Work

- **Consumption** — Task-completion throughput versus Task-intake rate, over the same window (the classic backlog-growing-or-shrinking signal). *A garment manufacturer's order-fulfillment Tasks: intake outpacing completion three weeks before a shipment deadline, visible in the math well before it's visible on the floor.*
- **Wastage** — Tasks reopened more than once, a direct, honest rework-rate signal, computable from the same reopening-narration mechanism M6/M9 already built and fixed.
- **Delay** — average Approval cycle time, per Area of Responsibility — the exact deterministic input M13's own Tamizhi Rule A already, informally, computes; this document's contribution is naming that Rule A has been consuming an Operational Signal all along without either document ever saying so plainly.
- **Imbalance** — pending-Task or pending-Approval count skew across Positions holding the identical Area.
- **Risk** — a live Approval Chain step whose only eligible current holder is a single person — the Work-domain expression of the same structural exposure People's own signal names from the org-chart side.
- **Projection** — at the current completion rate, the date the open-Task backlog is projected to cross a stated size.
- **Shortage** — an Area of Responsibility with real, currently-pending Approvals and zero active holders — the live, blocking instance of the same gap People's Shortage signal names in the abstract.
- **Overload** — a Position's concurrent open-Task count against the institution's own historical median. *A hospital's single on-call physician carrying a caseload the institution's own history shows is double the typical.*
- **Opportunity** — Tasks whose institutional history shows they were never delayed by their current Approval step — a low-risk simplification candidate, named as an observation only.

### Finance

- **Resource** — total available balance, by account.
- **Consumption** — burn rate (expense run-rate per period).
- **Projection** — **runway**: available balance divided by burn rate, expressed in months — arguably the single highest-value signal in this entire catalog for the smaller, resource-constrained end of the founder's institution list. *An NGO watching restricted-grant runway against known upcoming program commitments; a temple watching general-fund runway against an approaching festival's known cost.*
- **Wastage** — a recurring Expense category growing faster than any linked Project or Work activity — spend increasing with no traceable institutional reason, framed strictly as "growth without a linked cause," never as an accusation.
- **Delay** — average days from Expense submission through Approval to Payment, as a three-stage cycle-time signal.
- **Risk** — funding-source concentration — a single inflow source representing more than a configured share of total inflow. *A church whose operating budget depends on a handful of donor families; the same concentration-risk math a for-profit board would want for a single dominant customer.*
- **Shortage** — a known, Approval-gated upcoming payment obligation exceeding the currently-projected available balance within the runway window — a real, provable, Attention-worthy fact, not a guess.
- **Overload** — a single Area of Responsibility approving a transaction volume far exceeding the institution's own median — simultaneously a same-actor/Governance-adjacent risk signal and an overload signal.
- **Opportunity** — an Asset acquired and never linked to any Project or Work activity since — idle capital, computable directly from Finance & Assets' own already-real cross-references.

### Community

- **Wastage** — a Relationship with no recorded activity in the institution's own typical engagement window — the exact deterministic basis M13's own Tamizhi Rule C already, informally, leans on.
- **Imbalance** — skew across the three universal Directions (Receiving/Supporting/Supplying). *An NGO whose Community data is almost entirely Receiving-direction (donors) with almost no recorded Supporting-direction (beneficiary) engagement — a real, honest gap in what the institution is actually tracking about itself, not just a donor-relations fact.*
- **Risk** — donor or funding-relationship concentration, the Community-domain mirror of Finance's own concentration-risk signal, computed from Relationship value rather than transaction value.
- **Projection** — active-Contact attrition trend over time.
- **Shortage** — an institution-type-relevant Relationship type (per the Institution Configuration Layer's own terminology) with zero currently-active instances — *a school with zero active "Parent" relationships recorded* is a data-completeness gap worth surfacing honestly, not silently.
- **Opportunity** — a Contact with a historically high engagement level that has since gone quiet — a genuine, specific re-engagement candidate, computed the identical way Finance's idle-Asset opportunity signal is.

### Projects

- **Consumption** — linked-Expense burn versus stage-progress pace, a spend-pace-against-schedule-pace ratio. *A logistics company's route-rollout Project spending ahead of its own stage schedule, flagged before the overrun is visible in a monthly close.*
- **Delay** — time spent in the Project's current stage versus the institution's own historical median duration for that stage — the deterministic generalization of M11's own already-frozen "Projects increasing in delays" observation.
- **Imbalance** — a Project with substantial linked Finance activity and zero linked Work items — spend with no visible corresponding activity, a coordination-oversight gap.
- **Risk** — a Project with exactly one named responsible Position and no other linked Area holder — the Project-domain instance of the same single-point-of-failure pattern found in People and Work.
- **Projection** — estimated completion date, extrapolated from the current stage-transition rate, compared against any stated target date.
- **Overload** — a single coordinating Position linked to more concurrent Projects than the institution's own historical median.
- **Opportunity** — multiple Projects independently stalled on the same blocking Area of Responsibility — a genuinely cross-Project, math-only pattern no single Project's own view could ever surface, and a direct demonstration of why this belongs in a cross-cutting engine rather than duplicated per-application logic. *A manufacturer with three separate product-launch Projects all stalled waiting on the same vacant Quality Sign-off seat.*

### Documents

- **Delay** — average review/approval cycle time for Document types that require one.
- **Risk** — the rate of Document expiry, as a trend, not only an individual-item flag — clustering, not just counting.
- **Projection** — expiry clustering: a forward look at how many Documents of a given type expire within the same future window. *A hospital seeing that a disproportionate share of clinical staff licenses cluster for renewal in the same quarter next year — a genuine staffing-crisis-avoidance signal, months of lead time earned purely from arithmetic.*
- **Shortage** — a Document type the institution's own configuration expects but currently has zero live instances of — a compliance-shaped coverage gap, computable the moment Institution Configuration names an expected type.

### Reports

Reports is where Signals are *consumed and composed*, not primarily where they originate — its own signals are meta-signals, about the institution's attention to its own reporting, not about the institution's operations directly:

- **Consumption** — how often each Report category is actually generated, per institution — a real signal of whether a category anyone bothered to build is anyone bothered to use.
- **Risk** — a Report category available but never once generated — a blind spot in the institution's own self-awareness.
- **Opportunity** — a Report generated once, long ago, whose underlying Signals have since moved materially — a staleness signal, distinct from and complementary to the Institutional Policy Model's own Business-Rule-staleness concept (Constitutional Clarifications Part 2), applied here to a Report's own snapshot rather than a compiled Business Rule.

### Search

Also meta-signals — about where institutional attention naturally flows, and where it's blocked:

- **Consumption** — query volume by application area, a real, honest signal of where people actually go looking, independent of where the institution's leadership assumes they go looking.
- **Risk / Opportunity** — recurring zero-result search patterns. *A software company's staff repeatedly searching for "incident" or "deployment" with no results — not a bug, a genuine signal that a real institutional need (matching the Architecture Phase 2 document's own Compliance/Risk cluster proposal) already exists at this specific institution, discoverable from search behavior alone, before anyone files a feature request.*

---

## 4. The four-way distinction, made structural, not just definitional

| | **Operational Signal** | **Analytics (Reports)** | **Recommendation (Tamizhi)** | **AI Observation** *(future, unbuilt)* |
|---|---|---|---|---|
| Produced by | The OIE, deterministically | Reports, curated from Signals | A `TamizhiProvider`, interpreting Signals + other Evidence | A `TamizhiProvider`, in a future output kind |
| Method | Ratio / trend / threshold / concentration / projection — a fixed, small vocabulary | Selection and plain-language narration of one or more Signals | Interpretation, reasoning, or model inference across Signals and other permitted inputs | Model inference specifically, over Signals as raw material |
| Reproducible? | Always — same inputs, same output, every time | Always, for a given frozen snapshot | No — provider-dependent, may vary between providers or model versions | No — the same reason as Recommendation |
| Carries a confidence level? | **Never** — the number is simply true or it isn't | Never — Analytics states facts, per M11's own frozen "observations, never opinions" | Always — High/Medium/Low, per the Recommendation Model | Whatever the eventual output-kind design specifies |
| Carries a verb of its own? | Never | Never — Reports answers "what happened," not "what to do" | Implicitly, via Accept/Dismiss/Defer | Depends on the specific kind (a Question, a Summary carry none; a future action-adjacent kind might) |
| Requires human acceptance to exist? | No — it simply is | No — it's generated, saved, and read like any Record | Yes — remains `created` until a person decides | Yes, by the same Institution Intelligence Principles rule |
| Owned by | The OIE | Reports | Tamizhi's own store | Tamizhi's own store |

**The sharpest line, stated once for emphasis:** a Signal is a fact about arithmetic. A Recommendation is a claim about what that arithmetic might mean, made by something that could be wrong. Confusing the two — presenting a Signal with a Recommendation's rhetorical weight, or presenting a Recommendation with a Signal's implied certainty — is the single most important failure mode this entire framework exists to prevent, and it is prevented structurally (no `confidence` field on a Signal; a Signal can never itself carry an Accept/Dismiss/Defer lifecycle) rather than left to a UI convention someone could quietly drift away from.

---

## 5. Every Signal's required contract

Restated as a checklist, satisfied by construction for every entry in §3's catalog, not re-derived per signal:

- **Mathematically explainable** — every Signal names its own method (ratio/trend/threshold/concentration/projection) and its comparison basis; nothing is ever "the system thinks."
- **Institution-neutral** — the *formula* never varies by institution type; only the comparison basis does, and only through the institution's own historical data or a Policy-configured threshold (§6) — never a hardcoded number, per Platform Integration Strategy §7's own reusable-vs-configuration test.
- **Actionable** — every Signal carries `subjectType`/`subjectId` pointing at a real Record a person could actually do something about; a Signal about nothing referenceable is not a Signal, it's noise.
- **Non-alarming** — a Signal's mere existence is never itself a tier promotion (§7); computing "runway is 3.2 months" continuously and quietly is exactly the calm, always-on posture Product Philosophy's "attention should be earned, not assumed" requires.
- **Contributes to Attention** — through the unmodified Attention Contract, subject to the identical real-decision-and-verb test every other contributor already passes (§7).
- **Contributes to Reports** — every Signal is available to Analytics as raw material for a snapshot's own narration, exactly the relationship Analytics and this document's own §1 already describe.
- **Optionally consumable by Tamizhi** — as one more permitted input, extending Enterprise Foundation §9.2's existing list (Search, History, Attention, Authority, Reports) to formally include Operational Signals directly, rather than the informal, Reports-mediated path M13's rules already, quietly, depend on.

---

## 6. Thresholds stay institution-owned, never hardcoded

Every Signal that compares a value against a threshold (Shortage, Overload, Risk) reuses the Institutional Policy Model's own Business Rule mechanism, unmodified: a default threshold ships as a sensible starting point (mirroring M11's own "pending more than 7 days" default already live in Analytics), and any institution that wants a different one expresses that want as an ordinary Policy, compiled to a Business Rule the OIE reads — never a platform-wide constant, and never institution-specific code. A hospital's tolerance for Approval delay and a temple's are legitimately different, and the mechanism that already lets an institution say so (Constitutional Clarifications Part 2's own Policy → Business Rule lifecycle) is reused exactly as designed, not reinvented for Signals specifically.

---

## 7. How a Signal reaches Attention, Reports, and Tamizhi — without duplicating logic

The identical "compose once, consume many times" discipline the Integration & Automation Framework already established for Notification Intents, applied here to Signals:

1. The OIE computes a Signal, continuously and quietly, per domain.
2. **Attention** never sees a raw Signal directly — it sees whatever an application's own Attention Contract implementation chooses to compose from one, exactly as Analytics-derived items already reach Home today. A Signal crossing a threshold is not automatically Act Now or even automatically Be Aware; the receiving application still applies the identical "real, present, true, tied to an actual decision" test every other Attention contributor already must (Experience Principles §1), and only the application — never the OIE itself — ever attaches a verb.
3. **Reports/Analytics** reads Signals as its own raw material, selecting and narrating them into a snapshot's own "observations, never opinions" language, exactly as it already does today — this document changes only where the underlying math lives, generalizing it, never changing what Reports does with it.
4. **Tamizhi**, where a provider chooses to, cites specific Signals as Evidence inside a Recommendation's own Evidence list — the same `subjectType`/`subjectId`/`href` shape every other piece of Evidence already uses, with the Signal's own deterministic value quoted plainly ("Approvals for the Finance Area have averaged 9.2 days over the last quarter, exceeding the 7-day Policy threshold"). Tamizhi never recomputes a Signal itself, and never claims a Signal as its own insight — the Signal's provenance (the OIE, not the provider) stays visible in the Recommendation's own Evidence, honoring exactly the same "does this behave like any other contributor" discipline Institution Intelligence Principles already requires of everything Tamizhi touches.

---

## 8. Constitutional conflict check

None found. Tested directly against the boundaries this document was explicitly told not to cross:

- **Governance** — untouched; no Signal grants, withholds, or reinterprets any Area of Responsibility.
- **Attention's tiering rules** — untouched; §7 confirms every Signal still passes through the unmodified Attention Contract and its existing real-decision test, never bypassing it.
- **Authority's resolution logic** — untouched; Signal computation reads through the same permission-respecting providers every other reader already uses (per §5.3's own leakage-prevention discipline, already established in Enterprise Foundation).
- **Tamizhi's behavioral philosophy** — reinforced, not touched: §4's structural distinction is what keeps Tamizhi from ever quietly absorbing the OIE's deterministic certainty into its own advisory, provider-dependent voice.
- **Institutional Policy Model** — extended, not modified: §6 reuses Policy → Business Rule exactly as Constitutional Clarifications Part 2 already resolved it, adding no new lifecycle state.

---

## What this document does not decide

- **Which specific Signals get built first, or in what order** — a Roadmap and prioritization question, deliberately out of scope, per the founder's own standing instruction not to update the Roadmap here.
- **The exact schema of `OperationalSignal` beyond the properties named in §1** — implementation work for whenever this is actually built.
- **Whether the OIE is formally added as a new row to ARUMBU Constitutional Clarifications v1's own living engine table** — that document's own status already anticipates exactly this kind of addition ("updated the same day an engine's status changes"), but making the edit is a distinct act from proposing the addition, and this document deliberately only proposes.

## The closing test

Every Signal in §3's catalog was checked against one question before it was written down: *could two different people, given the same institutional data and no access to each other, independently compute the identical number?* Every entry that survived that test earned its place in this document. That is the entire discipline "operational mathematics" asks to be held to — not that a signal sounds insightful, but that it's provably, boringly, permanently true the moment the arithmetic is done, which is exactly what makes it trustworthy enough to run before any human ever thought to look.
