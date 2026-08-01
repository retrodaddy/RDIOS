Status: 🔵 Architectural investigation — design only, no code, no schema, no roadmap change, no constitutional amendment, no UI, no attendance system, no employee tracking system. The ARUMBU Constitution v1 is treated as permanently frozen and immutable throughout. This document also reconciles directly with the ARUMBU Architecture Phase 2 document's own B1 ("Time & Presence") proposal, rather than silently overlapping or contradicting it — the two are shown, with evidence, to be answering genuinely different questions that happen to share a word.

# ARUMBU Institutional Presence Model v1

## Method, and one piece of prior work this document has to reconcile with honestly before doing anything else

The ARUMBU Architecture Phase 2 document already proposed a cluster called "Time & Presence" — Attendance, Leave Management, Timesheets, Shift Planning — and concluded it deserves a new first-class Application. That finding is not reopened here. But the founder's own brief for this investigation describes something that document never actually examined: *the surgeon is in surgery, the principal is in a meeting, the merchandiser is working on Production Order #248* — none of these are attendance punches, leave requests, timesheets, or shifts. They are live, momentary facts about *reachability right now*, not durable HR records. **The first job of this document is to determine honestly whether this is the same question Phase 2 already answered, a genuinely different question, or both — and it turns out to be both, cleanly separable, which is itself the first real finding.**

---

## Q1 — Definition, and the collapse test

**Attempt at one sentence:** *Institutional Presence is a real, current fact about whether a specific person is reachable for a decision right now, and why, if not.*

**Does it collapse into Attendance?** No — Attendance (a punch-in/punch-out record, per Phase 2's own B1) is a durable, retrospectively-queryable Record ("was Ravi at work on the 14th"). Presence, as defined above, is about *this exact moment*, not a historical record of hours worked.

**Does it collapse into Leave?** **Partially, and precisely — the same shape of partial collapse the Discussion investigation already found for History.** A person on approved Leave genuinely is a Presence fact (unreachable, with a known reason and end date) — but Leave itself, per Phase 2's own B1, is already correctly scoped as a durable, Approval-gated Record with its own Identity, institution-scoping, and a "now" worth remembering. **Leave doesn't need to be redesigned by this document; it needs to be recognized as one legitimate source Presence can read from, not a competing concept.**

**Does it collapse into HR?** No — HR is not itself an architectural concept in this corpus (Phase 2's own cluster is named "Time & Presence," not "HR"), so there's nothing concrete to collapse into.

**Does it collapse into Calendar?** **Close, and instructive.** Product Foundation §5 already names Calendar as an unbuilt OS Layer piece that "aggregates due dates and time-bound commitments across applications." A person's active calendar event is a genuine, strong signal of their current reachability — but Calendar answers "what's scheduled," never "is this specific person currently free," and critically, a meaningful share of the real-world examples in this document's own brief (a surgeon mid-operation, a site engineer physically elsewhere) may have no calendar entry at all. Calendar is a real *contributor* to Presence, never a full substitute for it.

**Does it collapse into Meetings?** Same relationship as Calendar — a contributor (per the Architecture Phase 2 document's own B5 proposal), not a substitute.

**Does it collapse into Identity?** No — Identity resolves *who someone is and which institution they're acting in*; it says nothing about whether they're reachable right now, and nothing about Identity's own frozen design (`getIdentityContext()`, session resolution) was ever meant to answer that question.

**Does it collapse into Task assignment?** Close, but incomplete — "the merchandiser is working on Order #248" is partly derivable from Work's own current assignment data, but a person can be assigned to a Task and still be unreachable for an unrelated reason (in a meeting, on leave), so Task assignment alone under-describes the fact.

**Verdict on Q1: no existing concept fully absorbs it, several partially contribute to it, and this is worth taking seriously rather than dismissing — but the true shape of what survives is much smaller than "a new concept" implies, as the rest of this document will show precisely.**

---

## Q2 — Every built domain, tested for relevance

| Domain | Does Presence affect it? | Evidence |
|---|---|---|
| **People** | Yes, directly — a Person/Membership's current reachability is exactly the kind of ambient fact a roster or profile view would want to show. | §Q7 |
| **Community** | No — Presence concerns institution members, not external Contacts, by definition. | §Q1's own scope |
| **Work** | Yes — assignment logic benefits from knowing whether a candidate assignee is currently reachable. | §Q6 |
| **Money** | No direct relevance — a Finance approval's own routing is a Governance question, not a Finance-domain one. | — |
| **Projects** | Yes, ambiently — knowing a Flow's own responsible Position is currently unreachable is exactly the calm, honest context the Operational Flow investigation already found valuable. | §Q7, prior document |
| **Documents** | No. | — |
| **Reports** | No direct relevance — Reports is retrospective; Presence is, by definition, about right now. | §Q1 |
| **Search** | **Yes, and unusually cleanly** — M12's own frozen `SearchResult` model already names a field called "Current Status." | §Q7 |
| **Tamizhi** | Yes, as Evidence only, never as something it authors. | §Q6, §Q9 |
| **Attention** | Yes — the single strongest consumer found in this investigation. | §Q6 |
| **Authority** | No direct relevance — who holds an Area is unaffected by whether they're currently reachable. | — |
| **Operational Intelligence** | Yes — a delay Signal ("Approvals pending 9 days") becomes more honest, not more urgent, if it can distinguish genuine unavailability from neglect. | §Q6 |
| **History** | Rarely — only significant Presence changes, tested precisely in §Q10. | §Q10 |

---

## Q3 — Sixteen institutions, in their own language, no software vocabulary

**Garment Manufacturing:** *on the floor* / *at the cutting table* / *with the vendor*.
**Hospital:** *in theatre* / *on rounds* / *on call* / *off duty*.
**School:** *in class* / *on yard duty* / *in the staff room*.
**College:** *in lecture* / *in office hours* / *on sabbatical*.
**NGO:** *in the field* / *at headquarters* / *on a site visit*.
**Temple:** *in the sanctum* / *performing seva* / *away for the festival circuit*.
**Church:** *leading service* / *in counseling* / *on retreat*.
**Mosque:** *leading prayer* / *at the madrasa* / *on hajj*.
**Government Office:** *at the desk* / *in a hearing* / *on tour* (official travel).
**Construction:** *on site* / *at another site* / *in a safety briefing*.
**Software Company:** *heads-down* / *in standup* / *on call* (a rotation, a different meaning of the same phrase a hospital uses).
**Retail:** *on the floor* / *at the register* / *in the stockroom*.
**Agriculture:** *in the field* / *at the mill* / *off-season*.
**Mining:** *underground* / *on the surface* / *on shift* / *off shift*.
**Power Plant:** *in the control room* / *on the floor* / *on shift* / *off shift*.
**Logistics:** *on the road* / *at the depot* / *in transit*.

**The finding this table exists to produce: no two institutions share a vocabulary, and forcing them to would be exactly the "hardcoded enum" mistake this corpus has already refused repeatedly.** This is direct, unambiguous confirmation that whatever survives this investigation must treat the *specific states* as Institution Configuration Layer content — the identical discipline already applied to Position types, Project stages, and Document types — never a platform-fixed list.

---

## Q4 — The minimum universal set

Tested against Q3's own sixteen-institution vocabulary, asking which concepts recur in every one of them regardless of the specific words used:

- **Available / reachable** — the calm default state, present in every institution's own language even where the specific phrase differs. **Universal.**
- **Unavailable / unreachable, cause unspecified** — the honest fallback when nothing more specific is known. **Universal.**
- **On Leave** — genuinely universal as a *concept*, but not as a Presence-native state — it is always a reflection of Leave's own already-designed Record (Phase 2's B1), never a state Presence invents independently. **Universal, by reference, not by ownership.**
- **Emergency** — a real, distinct override state found, in some form, in every one of the sixteen institutions (a hospital's crisis, a mine's incident, a temple's sudden need). **Universal**, and the one state in this list that should propagate fastest and override every other routing consideration.
- Everything else named in the brief's own examples — Meeting, Training, Travelling, Working, Offline — and every institution-native phrase in §Q3 — **institution-specific**, configured, never hardcoded.

**What should never exist, named directly per the brief's own instruction:** a Presence model that defaults to precise, continuous, granular tracking (exact GPS coordinates, minute-by-minute location logs) presented as an ordinary status. This is not a hypothetical caution — it is the sharpest, most consequential finding in this entire document, examined fully in §Q8, and it should never be the baseline expectation for any institution, only a narrow, explicit, Policy-gated exception for a specific, named safety context (a lone field worker's own safety-check system), never routine employee monitoring dressed up as a status field.

---

## Q5 — Duration

**Not uniformly, and the answer splits along the exact line already found in Q1: durable states have Start/End/Reason because they're reflections of a real Record (Leave); transient states are point-in-time flags with no fixed end known in advance, changing only when the next real fact supersedes them.** "On Leave through the 14th" has a Start, End, and Reason because Leave's own Record already carries all three. "In a meeting" is simply true right now, until it isn't — it was never meant to have a stored duration, the same way a light switch has a state, not a duration. **History should not remember Presence forever** — an institution's memory gains nothing from knowing Ravi was "busy" at 2:14pm three weeks ago — **only significant changes deserve permanence**, tested precisely in §Q10.

---

## Q6 — Operational impact: Finance Manager → On Leave

Walked through directly, system by system, because this is where the investigation earns whatever verdict it reaches:

- **Escalation (Governance §7).** The single most valuable consumer found in this document. Governance's own Escalation mechanism is currently, entirely, time-based — it widens the eligible pool only after a decision has sat unresolved past a configured window, with no way to distinguish "the responsible person is neglecting this" from "the responsible person is legitimately, verifiably unreachable." **If Escalation could optionally consult a known Leave period, it could widen the pool proactively, at the moment Leave begins, rather than waiting for the usual delay to elapse for no honest reason.** This does not change Governance's own decision logic in any way — the pool still widens up the identical reporting graph, resolved the identical way — it only makes the *trigger condition* smarter.
- **Assignments.** Work's own assignment logic could optionally avoid defaulting new Tasks onto someone known to be On Leave — a real, small, non-disruptive improvement.
- **Notifications.** Routing, per the Discussion & Collaboration investigation's own already-established discipline, could reasonably delay non-urgent notifications to someone known to be unreachable, without inventing a new routing mechanism.
- **Tamizhi.** Could cite a known Leave period as Evidence inside a Recommendation — a direct, natural strengthening of M13's own Rule A (stuck approvals + vacant Positions), now also able to say *why* a Position's holder hasn't acted, not merely *that* they haven't.
- **Operational Intelligence.** A delay Signal becomes more honest, not more urgent, when it can distinguish genuine unavailability from neglect — directly closing a real ambiguity the Operational Intelligence Framework itself never had a way to resolve.
- **Attention.** Be Aware could surface "the Finance Manager is on leave through the 14th; 3 approvals are waiting" as a real, calm, honest fact — through the unmodified Attention Contract, no new tier.

**None of the six systems above need their own decision logic changed. Every one of them simply gains one optional additional input.** This is the precise shape of the finding this document is building toward.

---

## Q7 — Communication and surfacing: proving every option wrong, then finding the one that isn't

- **Comments / Discussions** — weak as a primary home; Presence isn't conversational content. A Discussion's own participant list showing ambient status alongside a name is plausible, but that's a UI concern, out of this document's scope, not a new mechanism.
- **Notifications** — real, direct, already covered in §Q6.
- **People** — real, direct; a roster or profile view is a natural home for ambient status.
- **Projects** — real, ambient, per §Q6's own Attention finding, extending Operational Flow's own conclusions about calm, honest composition.
- **Nowhere** — rejected; too many of the above survive.
- **Search — the strongest, most concrete finding in this entire document, because it required inventing nothing.** M12's own frozen Search Result Model already names seven fields, one of which is literally **"Current Status."** Today, for a Person result, that field most plausibly renders membership status (Active/Invited). **Nothing about this document requires changing Search's own frozen model at all — it requires recognizing that the field already exists, was already correctly designed to hold exactly this kind of fact, and has simply never been asked to hold anything richer than membership state.** This is not a new surface. It is an old, correctly-designed surface, finally given something worth putting in it.

---

## Q8 — Privacy

**No — not every institution has the right to know every person's Presence at every level of detail, and this document treats that as a foundational constraint, not an afterthought.** Tested directly against the five named institution types:

- **Hospitals** — a patient must never be able to infer "Dr. X is currently in Room 4 with Patient Y" from any Presence surface; clinical Presence detail is among the most sensitive categories this document names.
- **Government** — the opposite pressure exists here, legitimately: some jurisdictions have real transparency expectations about whether an official is "in office" during public hours — a genuine, real tension, not resolved uniformly by this document, and correctly left to institution-level Policy rather than a platform default.
- **NGOs, Churches** — generally lower stakes, but pastoral and beneficiary-facing Presence (a counselor's specific location, a field worker's exact whereabouts) deserves the same caution as clinical detail.
- **Companies** — the least sensitive case in general, but still real: an employee's specific reason for being unreachable ("On Leave — medical") is more detail than most colleagues have any institutional need to see.

**The resolution, reusing mechanisms already frozen rather than inventing a new privacy model:** Presence visibility is **Policy-governed**, exactly the way the Institutional Policy Model already handles every other institution-specific rule, and **Authority-scoped**, exactly the way Governance's own Areas already determine who sees what. A colleague sees only a coarse state ("Unavailable"); a direct manager or the relevant Area holder (HR, per Governance's own already-configurable Areas) may see the underlying reason where the institution's own Policy permits it. **Nothing here requires a new visibility mechanism — it requires exactly the same two-layer discipline the Audit Engine already applies to who can read History** (subject-level respect, plus an explicit oversight grant), reused a second time for a different kind of sensitive fact.

---

## Q9 — Integrations: who creates, who observes, who must never own

Reusing the Integration & Automation Framework's own already-frozen discipline directly — *"Integrations own no truth. They translate."*

- **Create Presence:** Calendars and Meetings (an active calendar event is a real, direct signal), badge readers / access control / time clocks (a physical check-in is a real, direct signal), and explicit manual status-setting by the person themselves.
- **Merely observe or contribute weak signal:** Email (an out-of-office autoresponder is a soft hint, not authoritative), Session activity (already a real, existing concept in Enterprise Foundation §2.2's own session lifecycle — active/idle — a legitimate weak contributor).
- **GPS / mobile location** — named separately and deliberately, because it deserves more caution than "creates" implies: real, potentially valuable for specific narrow safety contexts (§Q4's own named exception), and the single most invasive source on this list. It should never contribute to ordinary, institution-wide Presence by default, only where an institution has explicitly, narrowly opted into it for a stated safety purpose, gated by Policy exactly as §Q8 already requires.
- **Must never own it:** **Tamizhi**, explicitly and by the same reasoning that already governs everything else it touches — Tamizhi has no legitimate way to know a person's real-world whereabouts independently, and declaring a Presence fact on its own authority would be Tamizhi asserting something about the physical world it cannot actually verify, a direct violation of Institution Intelligence Principles' own "the honest answer is 'I don't know' rather than a confident approximation." Tamizhi may only ever **read** Presence as Evidence, exactly as it already reads Operational Signals, never author it. **No single external system either** — every source above is a Connector-fed contributor to one institution-owned fact, never a delegated owner, the identical discipline the Integration Framework already established for every other external system this platform touches.

---

## Q10 — History: does it become noisy?

**Yes, immediately and badly, if every Presence change were treated as audit-worthy — and this document rejects that outright, reusing a discipline already frozen rather than inventing a new threshold.** The Audit Engine Design already draws exactly this line: *"Read/view events are never audit-worthy, by design — looking at a record is not an institutional act worth remembering forever."* An ordinary transient status change ("in a meeting" → "available") is the closest thing to a read/view event this investigation has found outside the Audit Engine's own original examples — real, true, and utterly unremarkable a moment later.

**The correct boundary, precise and narrow:** only two categories ever touch History, and neither is a new rule. **Emergency** declarations (§Q4's own universal state) are audit-worthy by the identical "built-in event types... audit-worthy by default" guarantee the Audit Engine already extends to every genuinely significant institutional fact. **Leave's own start and end** are already History-worthy today, through Leave's own existing Record and Approval mechanism (Phase 2's B1) — not a new History entry this document invents, simply Leave's own already-correct behavior, restated here to confirm it needs no change.

---

## Q11 — Shared Engine eligibility, tested against the exact bar already used for Authority, Search, Tamizhi, Operational Intelligence, Measurement, and the Structure Engine

**Fails the bar cleanly, and — worth stating precisely rather than glossing over — fails it more decisively than Operational Intelligence did.** Authority resolves standing. Search ranks results. Tamizhi advises. Operational Intelligence performs genuine, valuable, institution-agnostic *computation* across nine domains' worth of real signals, substantial enough to earn a place on the living, non-frozen engine roster even though it doesn't decide anything either. **Presence, by contrast, aggregates a much thinner set of sources into one small status flag — real and useful, per §Q6, but not substantial enough on its own to justify a named engine the way Operational Intelligence's own breadth did.** It is not a new Application (too thin, answers no standalone institutional question the way People or Work does). It is not a Universal Record Model discipline (§Q1, §Q5 already established this directly — a transient Presence state has almost no meaningful "then," which is the specific property Universal Record Model Q1 requires a Record to have; unlike a History/Audit entry, which fails that test by having *only* a "then," transient Presence fails it by having *almost only* a "now"). **The honest, disciplined answer: Presence does not earn its own named architectural citizen at all.** It earns something smaller — an optional input a small number of already-frozen mechanisms may consult.

---

## Q12 — Active disproof: assume Attendance, Leave, Calendar, Tasks, and Automation already solve everything

**The strongest version of the argument:** Leave already tells you when someone is formally unavailable. Calendar already tells you when someone has a scheduled commitment. Task assignment already tells you what someone is currently working on. Automation can already react to any of these as Events. There is nothing left for a new "Presence" concept to add — every fact this document's brief names is already derivable from data that already has, or will have, a real home.

**Where this argument holds completely:** every individual source is correct. Leave genuinely is enough to know someone is on leave. Calendar genuinely is enough to know someone has a meeting. Nothing about any single source needs to be redesigned, and this document does not propose redesigning any of them.

**Where it fails, precisely:** **none of these sources are unified, and Governance's own Escalation mechanism, Attention's own composition, and Work's own assignment logic would each have to independently learn to separately query Leave, then Calendar, then Task assignment, then Session activity, every single time any of them wanted to ask the one honest question 'is this person currently reachable, and if not, why' — repeating the identical multi-source lookup logic in at least three separate places.** This is the exact shape of duplication risk the Universal Record Model already caught once (eleven independently-duplicated `globalThis` guards) and the Measurement & Resource Model already caught a second time (ten future applications each reinventing quantity tracking). **The disproof fails at exactly the point where unification, not any individual source, is the actual gap** — which is a real, narrow, evidence-backed finding, not a broad new concept the disproof failed to touch at all.

---

## Q13 — Ten years from now

With Spreadsheet, Calendar, Inventory, Manufacturing, Payroll, Recruitment, Learning, Fleet, Maintenance, Automation, and Messaging all built, does the value grow or disappear?

**Grows, directly and for the identical reason every confirmed refinement in this series has grown under its own ten-year test.** Recruitment's own interview scheduling needs to know who's currently reachable to interview. Fleet needs to know which driver is currently on the road versus at the depot. Maintenance needs to know which technician is currently free versus mid-job. Every one of these is the same underlying question this document already answers once, generically — none of them need their own bespoke version of it, and the unification gap named in §Q12 becomes more expensive to leave unsolved, not less, as more domains independently reach for the same fact.

---

## Verdict

**2. Refine an existing concept — specifically, Governance's Escalation trigger, Attention's composition, and Search's own already-named "Current Status" field, each given one optional additional input they don't have today.**

**Not a rejection** — Q12's own dedicated disproof section found a real, narrow, precisely-located gap (unification, not any individual source) that survives every attempt to argue it away. **Not a new constitutional concept either** — Q11's application of the exact bar used for five prior engines fails it more decisively than any candidate examined so far in this series, and Q1/Q5's application of the Universal Record Model's own Record test confirms the transient half of "Presence" isn't even Record-shaped, let alone engine-shaped.

**The smallest possible addition, precisely bounded:**

1. **A small, non-Record, non-History-worthy current-status signal per Membership** — computed where possible from Leave, Calendar, active Task assignment, and Session activity, and explicitly set where those sources are silent — never stored as a durable, historically-queryable fact except in the two cases §Q10 already names.
2. **Governance's Escalation (§7) gains an optional, Presence-aware trigger condition** — widening the eligible pool proactively when a known Leave period begins, rather than waiting only for the existing time-based window to elapse. Governance's own decision logic is entirely unchanged; only the timing of when it fires improves.
3. **Search's Result Model needs no change at all** — its own already-frozen "Current Status" field is confirmed as the correct home, finally given something richer to hold for a Person result than membership state alone.
4. **Ownership discipline, reusing the Integration & Automation Framework unchanged**: every external source is a Connector-fed contributor, never an owner; Tamizhi may only ever read Presence as Evidence, never author or declare it; GPS-precision tracking is explicitly named as something that must never become a default, only a narrow, Policy-gated, explicitly-opted-into exception for a stated safety purpose.
5. **Privacy reuses the Audit Engine's own two-layer read discipline** (subject-level respect, plus an explicit oversight grant) rather than inventing a new visibility model, and every specific state — Meeting, Training, "in theatre," "underground" — remains Institution Configuration Layer content, never a hardcoded platform enum.
6. **Phase 2's own B1 Time & Presence proposal is confirmed unchanged** — Leave, Attendance, Timesheets, and Shift Planning remain exactly as that document scoped them; this investigation adds nothing to that Application and asks nothing of it beyond being one of several sources the small signal above may read from.

As with every investigation in this series before it, the absence of a genuinely new primitive — after an investigation built specifically to find one if it existed — is the finding, not a disappointing shortfall of one.
