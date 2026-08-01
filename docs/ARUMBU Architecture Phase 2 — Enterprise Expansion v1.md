Status: 🔵 Architectural discovery — design only, no code, no schema, no roadmap change. The ARUMBU Constitution v1 is treated throughout as permanently frozen and immutable; nothing below reinterprets it. Every proposal is tested against it and against the ARUMBU Enterprise Foundation v1 and ARUMBU Integration & Automation Framework v1 before being accepted, and several candidates below are explicitly rejected or redirected rather than designed, because discovery that accepts every candidate isn't discovery.

# ARUMBU Architecture Phase 2 — Enterprise Expansion v1

## Method

Every one of the eleven built pieces (Home, People, Organization, Work, Finance & Assets, Community, Projects, Documents, Reports, Universal Search, Tamizhi) and every frozen constitutional document was re-read specifically looking for what the architecture already implies but has never named. Thirty-five candidate capabilities were given; not all thirty-five earned a first-class design answer, and this document says so plainly rather than forcing ten uniform answers onto capabilities that don't deserve them. Related capabilities are grouped into clusters where the architecture treats them as one underlying question wearing several names — forcing ten separate, repetitive answers onto seven near-identical items would itself be exactly the kind of "increase the number of features without strengthening institutional capability" the ARUMBU North Star exists to prevent.

Two findings recur often enough to state once, up front, rather than sixteen times:

- **The Extension Architecture (Product Foundation §9) is not a fallback — it is frequently the correct answer.** Several capabilities on the founder's list are real, valuable, and simultaneously *not ARUMBU core's job to build*, because the Constitution already named exactly where they belong: beside the platform, built by whoever needs them, on the seams core already provides.
- **The Universal Record Model's own checklist (Identity, institution-scoping, a "now," History/Attention/Search-eligibility) is the actual instrument used throughout this document to answer "application, engine, infrastructure, or configuration."** It is applied the same way, every time, rather than judged case-by-case on vibes.

---

## Section A — Already named, still unbuilt (not new discoveries, confirmed and cross-referenced)

Two items on the founder's own list are not new capabilities at all — the Constitution already designed them, and this document's job is only to confirm that and stop anyone from accidentally re-designing them from scratch later.

**Calendar & Scheduling — the aggregation half already exists on paper.** Product Foundation §5 already names Calendar as an Operating System Layer citizen: "Aggregates due dates and time-bound commitments across applications the same way Attention aggregates decisions." This is not the same thing as a booking/meetings application (see §B5 below, which *is* a new discovery) — it is the OS-layer surface that shows a person their Work due dates, Approval deadlines, and Policy review dates in one place, built entirely from data every application already emits. Still unbuilt, but not newly discovered here.

**Automation & Integration Framework** — fully designed in the immediately preceding ARUMBU Integration & Automation Framework v1. Not re-examined here; every capability below that would want automation or external connectivity inherits that document unchanged.

**Public Portals** — already fully placed in Platform Integration Strategy §5's own table: "Customer / Vendor / Citizen / Client Portal... Inside RDIOS... a limited-scope external Person + Membership, exactly the mechanism the People Domain Review already designed." Not a new discovery; restated here only so it isn't mistaken for one when this document's list is later compared against the founder's original prompt.

---

## Section B — Capability clusters

### B1. Time & Presence — Attendance, Leave Management, Timesheets, Shift Planning

**1. Why genuinely needed?** Every institution on the founder's own nine-type list tracks *when* people are present and *when* they're formally away, and today People/Organization answers *who* and *what authority*, never *when*. This is a real, structural gap, not a nice-to-have — a hospital's shift coverage and a school's attendance register are both institutional facts nobody currently has anywhere to put.

**2. Constitutional principles extended:** People Domain Review's own Position/Affiliation model (a shift is a time-bound instance of a Position being staffed); Governance's Approval Chain (leave requests are an ordinary Approval, nothing new); Universal Record Model (a Leave Request, a Shift, and a Timesheet entry are all textbook Records — Identity, institution-scoped, a "now").

**3. Existing applications integrated with:** People (whose Membership/Position this belongs to), Work (a Leave Request is structurally identical to an Approval; a missed Shift is Attention-worthy the same way an overdue Task is), Reports (attendance/leave Analytics).

**4. Engines reused:** Authority (who may approve leave — an ordinary Area of Responsibility, "HR" or "People," already nameable today), Attention (a pending leave request, an uncovered shift), History/Audit (every clock-in, leave grant, and shift assignment narrated exactly like every other institutional act).

**5. Constitutional conflicts?** None found. Leave approval is a direct, unmodified instance of Governance §5's Approval Chain; nothing here asks Governance, Attention, or Authority to behave differently.

**6. Universal or industry-specific?** Universal in need, institution-specific in shape — a factory's three-shift roster and a school's term-time attendance register are genuinely different content, identical mechanism, exactly the reusable-vs-configuration test Platform Integration Strategy §7 already sets.

**7. Application, engine, infrastructure, or configuration?** **A new first-class Application** — call it, provisionally, "Time" — because it has real institutional truth of its own (Universal Record Model's own test: a Leave Request's "now" is not merely a projection of some other domain's data), distinct from Work (a Leave Request isn't a Task) and distinct from People (a Shift isn't a Position).

**8. What becomes possible because of it?** Payroll (B2) becomes buildable at all — payroll cannot exist without a real attendance/leave source of truth to compute from. Shift-based Attention ("this shift is uncovered") becomes possible. Capacity Planning (B8) gets a real input instead of a guess.

**9. Would CEOs, managers, and frontline staff all benefit?** Yes, unusually cleanly — a frontline worker requesting leave, a manager approving coverage, and a founder seeing institution-wide attendance trends are three genuinely different, genuinely valuable views of the identical underlying Record.

**10. Reduces friction or just adds features?** Reduces friction directly — today, attendance and leave live in a spreadsheet or a paper register for every institution this platform targets, disconnected entirely from who's authorized to approve what. This closes a real, felt gap rather than adding a feature nobody asked for.

---

### B2. Payroll

**1. Why genuinely needed?** The natural, expected consequence of Finance & Assets plus Time & Presence (B1) existing — an institution that can track hours and approve expenses but cannot pay its people from the same platform has a structurally incomplete Finance story.

**2. Constitutional principles extended:** Institutional Policy Model (a Payroll Policy — statutory withholding, overtime rules — is exactly the "compiled Business Rule from institutional prose" shape Policy already exists for); Finance's own shared transaction spine (a payroll run is a specialized, batched Expense, not a new financial primitive).

**3. Existing applications integrated with:** Finance & Assets (the actual money movement), Time & Presence (B1, the hours worked), People (who gets paid, at what rate — itself likely a new, narrow Capability or Position attribute).

**4. Engines reused:** Policy (statutory rules), Governance (who may run payroll — a genuinely high-stakes Area, likely requiring Separation of Duties per Governance §6, correctly configured on, not off, for this specific decision type), Audit (payroll's own append-only trail is exactly what the Audit Engine already guarantees for every financial posting).

**5. Constitutional conflicts?** **The one real tension worth naming plainly**, not smoothed over: payroll tax and statutory-withholding rules are *genuinely jurisdiction-specific code-shaped logic* — the closest any capability on this list comes to violating Platform Integration Strategy §6's "a `type === 'hospital'` branch anywhere in application code is a bug report, not a shipped feature." The resolution is the same discipline that already protects every other institution-specific rule: statutory logic must live entirely inside Policy/Configuration (a jurisdiction's Payroll Policy, compiled to Business Rules), never hardcoded per-country in application code — harder to hold to here than anywhere else on this list, and worth flagging as the single highest-discipline-required item in this entire document.

**6. Universal or industry-specific?** Universal need, radically jurisdiction-specific content — the most configuration-heavy capability proposed here.

**7. Application, engine, infrastructure, or configuration?** **Extension of Finance & Assets**, not a new top-level application — a payroll run is a Finance Record (a batched, specially-shaped Expense/Transaction), not a new domain answering a new question about the institution.

**8. What becomes possible?** A genuinely complete Finance story; Executive Dashboards (B8) gain a real labor-cost line.

**9. CEO/manager/frontline benefit?** Yes, though asymmetrically — frontline staff benefit from a payslip they can trust and see; managers and founders benefit from labor-cost visibility they don't currently have anywhere.

**10. Friction reduction?** Real, but this is the one capability in this document where the honest answer includes a caution: payroll is also the single easiest capability on this list to get expensively wrong (statutory non-compliance has real legal consequences), and should be sequenced late, after the jurisdiction-specific Policy discipline above has already been proven correct on lower-stakes Policy content.

---

### B3. Recruitment

**1. Why genuinely needed?** Every Person the platform ever knows about currently starts life as an Invitation — but a real hiring process (candidates, interviews, offers) happens *before* someone is a Person at all, and today that entire pre-hire funnel has nowhere to live.

**2. Constitutional principles extended:** People Domain Review's own Person/Membership boundary, extended one step earlier: a Candidate is deliberately *not* a Person (no institution-wide identity, no cross-institution portability) until they're hired — the identical "not every relationship requires a Person and a Membership" discipline the People Domain Review already applies to customer contacts, applied here to the pre-hire case.

**3. Existing applications integrated with:** People (a hired Candidate becomes an Invitation, the existing mechanism, unchanged), Work (interview scheduling as ordinary Tasks), Documents (offer letters, resumes — exactly the "a Document is not a file" pattern already built).

**4. Engines reused:** Attention (a pending offer decision, an unscored interview), History (the hiring decision narrated the same way any other institutional decision is).

**5. Constitutional conflicts?** None found.

**6. Universal or industry-specific?** Universal — every institution on the founder's list hires people, in structurally identical shape (funnel, interview, decision, offer), with only the vocabulary and criteria varying, which the Institution Configuration Layer already knows how to hold.

**7. Application, engine, infrastructure, or configuration?** **A new first-class Application**, narrowly scoped — its own Record type (Candidate), its own lifecycle, genuinely distinct from People (which starts only once a Candidate is hired).

**8. What becomes possible?** A complete Person lifecycle from first contact to offboarding — closing the one gap left in an otherwise-complete People story.

**9. CEO/manager/frontline benefit?** Managers and founders primarily; "frontline" benefit is indirect (a better-run hiring process), honestly the weakest fit of this cluster on that specific question.

**10. Friction reduction?** Real — today this lives entirely outside the platform (email threads, spreadsheets), disconnected from the org chart it's actually about to feed into.

---

### B4. Performance Management & OKRs

**1. Why genuinely needed?** Work already tracks what got done; nothing tracks whether it was any *good*, or whether it served a stated goal — a real, felt gap the moment an institution grows past the size where a founder personally knows how everyone is doing.

**2. Constitutional principles extended:** Universal Record Model's own Q6 (Attention eligibility) applied honestly: most performance facts are **not** Attention-worthy on their own — this is the domain most at risk of manufacturing false urgency, and this document flags that risk explicitly rather than assuming the capability is automatically well-behaved. Reports/Analytics' own "observations, never opinions" discipline (M11's frozen brief) is the correct model to inherit — a Performance capability that renders judgments rather than observable facts would violate that discipline directly.

**3. Existing applications integrated with:** Work (a goal is naturally Project- or Task-shaped), Projects (an OKR is close kin to a Project's own coordination role), Reports (the actual, honest, "observations not opinions" surface this belongs on).

**4. Engines reused:** Attention (sparingly — a stalled goal review, not a running score), Tamizhi (a genuinely good fit for *observing* patterns — "three OKRs have had no update in 60 days" — while never scoring or judging a person, exactly the Institution Intelligence Principles' own boundary already requires).

**5. Constitutional conflicts?** **A real risk, not a conflict**: performance management is the domain most prone to violating Product Philosophy's "calm should matter" and "attention should be earned, not assumed" if built carelessly (manufactured weekly nudges, artificial scoring). Named here as the sharpest design discipline this cluster requires, not as a reason not to build it.

**6. Universal or industry-specific?** Universal in need, highly configuration-dependent in what "good performance" even means per institution type.

**7. Application, engine, infrastructure, or configuration?** **A new first-class Application** for the OKR/goal-tracking Record itself; the actual "performance review" content is closer to Policy-governed Configuration (an institution's own review cadence and criteria) layered on top.

**8. What becomes possible?** Executive Dashboards (B8) gain a real, non-financial signal; Tamizhi gains a genuinely rich, low-risk observation surface if built with the discipline named above.

**9. CEO/manager/frontline benefit?** Yes, all three, if and only if it stays observation-shaped rather than surveillance-shaped — the single biggest design risk on this entire list.

**10. Friction reduction?** Conditional — done well, real; done as a scored dashboard, this becomes the first capability on this list that could plausibly *increase* institutional anxiety rather than reduce friction, which is exactly the North Star's own test ("strengthen institutional capability, not simply increase the number of features") failing if mishandled.

---

### B5. Meetings & Scheduling (distinct from the OS-layer Calendar named in Section A)

**1. Why genuinely needed?** A specific, narrower need than Calendar's aggregation: a real Meeting Record — who was invited, what was decided, what Work items came out of it — none of which "Calendar" (a due-date aggregator) was ever meant to hold.

**2. Constitutional principles extended:** Universal Record Model (a Meeting has real Identity, institution-scoping, and a "now" — scheduled/held/cancelled); the Integration & Automation Framework's own Connector Provider pattern (the actual booking mechanics ride Google/Outlook Calendar connectors, never reinvented locally).

**3. Existing applications integrated with:** Work (action items from a meeting are ordinary Tasks), Projects (a meeting scheduled because a Project is blocked, per the Integration Framework's own worked example), People (attendees).

**4. Engines reused:** the Connector Provider pattern (§ Integration Framework) for the actual calendar mechanics; History (a meeting's outcome narrated once, like everything else).

**5. Constitutional conflicts?** None — this is close to the cleanest fit in the entire document, because it was designed to slot directly into machinery the immediately preceding Integration Framework document already built.

**6. Universal or industry-specific?** Universal.

**7. Application, engine, infrastructure, or configuration?** **A thin Application** — mostly a Record shape and a UI, genuinely minimal net-new machinery because the hard part (actually talking to a calendar) already belongs to the Integration Framework.

**8. What becomes possible?** Governance's own Approval Chain quorum meetings (a temple's five-trustee vote, Governance §5) become a real, trackable institutional event rather than an off-platform phone call nobody records.

**9. CEO/manager/frontline benefit?** Yes, broadly.

**10. Friction reduction?** Real, and unusually cheap to deliver given how much of the hard infrastructure already exists.

---

### B6. Internal Communication

**Answered directly, and rejected as a first-class ARUMBU application — the clearest "do not build this" finding in this document.**

**1. Why genuinely needed?** It isn't, as a *new chat product* — the Integration & Automation Framework already connects Slack, Teams, WhatsApp, and Email; building a competing internal chat product inside ARUMBU would be the single clearest violation of the North Star's own second sentence ("every feature must strengthen institutional capability, not simply increase the number of features") available in this entire list. Product Philosophy's own "why software should disappear into the background" argues directly against ARUMBU becoming one more place people have to check.

**2–6.** Not applicable — this document declines to design a new communication product.

**7. Application, engine, infrastructure, or configuration?** **None of the above.** The correct shape is *more connectors and better Notification Intent composition* (already fully specified in the Integration & Automation Framework), never a new destination.

**8–9.** N/A.

**10. Friction reduction?** The friction-reducing move here is explicitly **not building this**, and this document names that as a real, positive finding — the same discipline the M13 Tamizhi report already modeled ("implement only 1 of 5 output kinds... not hidden") applied here to an entire proposed application rather than a sub-feature.

---

### B7. Productivity & Builder Tools — Spreadsheet, Forms Builder, Workflow Designer, Custom Fields

**This cluster is the single most important architectural discovery in this document — a candidate for a genuinely new Shared Engine Layer citizen, not merely a new application.**

**1. Why genuinely needed?** Every other cluster in this document assumes ARUMBU core builds each new capability itself. That does not scale to "the next decade" the way the founder's own framing asks — a platform meant to serve schools, hospitals, temples, and Fortune 500 manufacturers cannot realistically ship a bespoke first-class application for every institution-specific need those institutions will eventually have. What they can share is **the mechanism to define their own structure** — a form, a spreadsheet-shaped table, a custom field on an existing Record, a lightweight workflow — without waiting for ARUMBU engineering to build it for them.

**2. Constitutional principles extended:** this is the concrete, buildable answer to Product Foundation §9's own Extension Architecture and Platform Integration Strategy §7's reusable-vs-configuration test, taken to its logical conclusion: **Custom Fields and Forms are not a feature, they are the mechanism that lets Configuration (Product Foundation §8) become genuinely end-user-authorable rather than only platform-authorable.** This is also a direct, disciplined extension of the Universal Record Model's own checklist — a Custom Field is simply a Record-type-scoped extension point that stays subject to the identical Identity/institution-scoping/History/Attention/Search eligibility rules every other Record property already follows.

**3. Existing applications integrated with:** potentially every one of them — a Custom Field on a Work Item, a Custom Field on a Contact, a Form that creates a Document. This cluster's entire value is being reusable by everything, not owned by any one domain.

**4. Engines reused:** Search (custom fields must be search-eligible, per the Universal Record Model's own universal doors), History/Audit (a custom field's value changing is an ordinary auditable fact), and — critically — the Integration & Automation Framework's own Automation Rule concept, since a Workflow Designer is very close to a human-authorable Automation Rule editor, not a second mechanism.

**5. Constitutional conflicts?** **A real, precisely-scoped risk, worth naming directly**: an over-powerful Workflow Designer or Spreadsheet could let an institution *rebuild business logic inside configuration data* in a way that quietly bypasses Governance and Policy — a spreadsheet formula computing "requires approval," reimplementing what Governance §5 already owns, outside its view. **The correct constraint, stated as a design boundary rather than left implicit: a Custom Field may hold data; it may never define authority, and a Workflow built through this tool may only ever invoke already-Governance-registered Actions (exactly the Integration Framework's own Automation Rule discipline), never define a new one from scratch inside end-user configuration.** Named here precisely because this is the one place in the whole document where "configuration" could quietly become "undeclared code," which Platform Integration Strategy §6 already treats as a bug, not a feature, no matter how it's packaged.

**6. Universal or industry-specific?** The mechanism is universal; what any given institution builds with it is, by definition, whatever they need — this is the honest resolution to *every* industry-specific request on the founder's original list (see §B9 below).

**7. Application, engine, infrastructure, or configuration?** **A new Shared Engine Layer candidate** — provisionally, a "Structure Engine" or "Definition Engine" — sitting beside Authority, Search, and Tamizhi as genuinely institution-agnostic machinery, consumed by every application rather than owned by one. This is the single strongest "engine" case in this entire document, tested against the same bar Search and Tamizhi already passed: does it make decisions or enforce rules independent of any one domain's content? Yes — it defines *shape*, the same way Authority resolves *standing*.

**8. What becomes possible?** A meaningful fraction of the Operations cluster (§B9) never needs to become a first-class ARUMBU application at all — an institution or a third-party extension builder can compose Inventory, Quality checklists, or Visitor logs directly from Custom Fields + Forms + Workflow, exactly the Extension Architecture's own intended shape (Product Foundation §9), now with a real, concrete mechanism to build extensions *without writing code*, which the current Extension Architecture assumes but never actually enables for a non-engineer.

**9. CEO/manager/frontline benefit?** Indirect but large — this is infrastructure, not a screen most people touch daily, but it's the single highest-leverage item in this document for making everything else cheaper to build, including by the institutions themselves.

**10. Friction reduction?** The single clearest "yes" in this document — it is architecturally the opposite of feature-count growth: one mechanism, reused everywhere, replacing what would otherwise be a dozen separate bespoke industry applications.

---

### B8. Business Intelligence — Operational Forecasting, Executive Dashboards, Budget Planning, Capacity Planning, Resource Planning

**1. Why genuinely needed?** Reports already answers "what happened"; Analytics already answers "what deserves attention." Nothing today answers "what's likely to happen" or "what should we plan for" — a real, distinct third question the M11 brief's own "Reports vs. Analytics" split already implies exists but never built.

**2. Constitutional principles extended:** M11's own frozen category discipline (fixed, universal report categories, "no institution-specific reports") — forecasting and planning should extend that same closed-category model rather than becoming a bespoke BI tool per institution.

**3. Existing applications integrated with:** entirely an extension of Reports — Finance (budget), Work/Projects (capacity, resourcing), Time & Presence (B1, if built — real capacity data).

**4. Engines reused:** none new — this is Reports' own Analytics engine, extended with forward-looking (not merely retrospective) computation, still honestly bounded ("Reports are historical... do not regenerate automatically" per M11's own frozen snapshot discipline — a forecast is explicitly not a snapshot in the same sense and needs its own honest framing, named here as a real design nuance for whenever this is built: a forecast must be clearly labeled as a projection, never presented with a snapshot's implied permanence).

**5. Constitutional conflicts?** None found, with the one nuance named above.

**6. Universal or industry-specific?** Universal mechanism (forecasting, budgeting), institution-specific inputs.

**7. Application, engine, infrastructure, or configuration?** **Extension of Reports**, not a new application — fails the "answers a genuinely new question about the institution" test that would justify a new top-level Application Layer citizen; it answers the same question Reports already owns, one tense later.

**8. What becomes possible?** Executive Dashboards become the natural default landing view for a founder/CEO persona, directly addressing the UX gap the Enterprise Architecture Audit already named (persona coverage beyond the single founder-equivalent account).

**9. CEO/manager/frontline benefit?** Primarily CEO/manager; frontline benefit is indirect (better-planned capacity).

**10. Friction reduction?** Real — replaces the spreadsheet-based forecasting every institution on this list currently does entirely outside the platform.

---

### B9. Operations Cluster — Inventory, Manufacturing, Procurement, Quality, Maintenance, Logistics, Fleet

**Treated as one cluster deliberately, because the honest architectural finding is the same for all seven, and repeating it seven times would obscure rather than clarify it.**

**1. Why genuinely needed?** Real, and only for a genuine subset of institutions — a manufacturer, a hospital's supply chain, a logistics-heavy NGO. Not universal, and this document says so plainly rather than pretending otherwise to look thorough.

**2. Constitutional principles extended:** Finance & Assets' own Asset Registry (Inventory, Maintenance, and Fleet are all, structurally, Asset Registry extensions — an inventory item and a vehicle are both Assets with different attributes); Governance's Approval Chain (Procurement is a purchase-request flow, already the Governance §5 worked example almost verbatim); Institutional Policy Model (Quality is, almost entirely, a Policy-content question — what does "correct" mean for this inspection — not a new mechanism).

**3. Existing applications integrated with:** Finance & Assets (the dominant one, by a wide margin), Work (a maintenance ticket is an ordinary Task/Approval), Documents (a quality certificate, a maintenance log entry).

**4. Engines reused:** the same Governance/Policy/Attention/History set every other cluster reuses — nothing new required.

**5. Constitutional conflicts?** None found in the underlying mechanism. **The real risk is scope, not architecture**: building seven bespoke, deeply industry-specific first-class applications directly contradicts Product Foundation §2's own "not every application matters to every institution... applications are enabled per institution, not force-fed," at a scale (seven entire applications, most institutions needing at most two or three of them) that would make ARUMBU core's own maintenance burden badly mismatched to how few institutions actually need each one.

**6. Universal or industry-specific?** **Industry-specific, decisively** — the sharpest non-universal cluster in the entire list.

**7. Application, engine, infrastructure, or configuration?** **The Extension Architecture (Product Foundation §9), built on top of the Asset Registry (already real) and the Structure Engine (§B7, newly proposed) — not new first-class ARUMBU-core applications.** This is the single most consequential sequencing recommendation in this document: build the Structure Engine and strengthen the Asset Registry first, and a meaningful fraction of this entire cluster becomes buildable by extension developers or institutions themselves, per the Extension Architecture's own already-frozen design, rather than ARUMBU core committing to building and maintaining seven vertical products.

**8. What becomes possible?** A real Extension ecosystem and eventual Marketplace (both already named "beside RDIOS" in Platform Integration Strategy §5) get their first genuine reason to exist — today nothing has needed them badly enough to matter; this cluster is exactly the pressure that would.

**9. CEO/manager/frontline benefit?** Real, for the specific institutions that need any one of these — but this is the cluster where "would CEOs, managers, and frontline staff all benefit" is answered honestly as "only at the subset of institutions this cluster actually applies to," not universally, unlike almost everything else in this document.

**10. Friction reduction?** Real for the right institutions, but **the friction-reducing move for ARUMBU core specifically is not building all seven** — building the shared mechanism (§B7) that lets them be built once each, by whoever needs them, is the actual friction reduction at the platform level.

---

### B10. CRM

**Answered directly: largely already built, under a different, more honest name.**

**1. Why genuinely needed?** As a *new* application, it isn't — Community's own three-Direction model (Receiving/Supporting/Supplying) already covers everything a traditional CRM's contact/pipeline concept does, and the Community Domain Review's own reasoning explicitly rejected the narrower "Customers" framing specifically because it was too sales-pipeline-shaped for a temple's donors or an NGO's beneficiaries.

**2–6.** What a CRM-minded institution (an agency, a sales-driven company) genuinely needs beyond today's Community is a **pipeline-stage concept** — a Contact's Relationship moving through named stages (Lead → Qualified → Won/Lost). This is not a new domain; it is Community's own `Relationship.type`/status field, already correctly designed as institution-configurable free text per the platform's own established discipline (Constitutional Clarifications' own vocabulary ruling reused directly), potentially paired with a Project (M9's own coordination pattern) representing the deal itself.

**7. Application, engine, infrastructure, or configuration?** **Configuration**, layered on Community + Projects — not a new application, and not an engine.

**8–10.** Nothing new to name — this cluster's honest finding is that the founder's own list contains one item that's already substantially solved, correctly, and the real work here is recognizing that rather than rebuilding it.

---

### B11. Knowledge & Learning — Knowledge Base, Learning Management, Training

**1. Why genuinely needed?** Split cleanly into two different needs the founder's single list conflates. **Knowledge Base** is real but is not a new domain — it is a curated, structured *view* over Documents (M10's own "a Document is not a file" model already covers institutional knowledge completely; what's missing is only a browsing/organization layer, not a new Record type). **Learning Management / Training**, by contrast, is genuinely new: a Course, an Enrollment, and a Completion are Records with no honest home in any existing application.

**2. Constitutional principles extended:** Documents (Knowledge Base, directly); People Domain Review's own Capability concept (a completed Training is, structurally, exactly what Capability already models — "a Person's current qualification or skill, scoped to one institution" — this is almost a perfect, pre-existing fit rather than a new concept).

**3. Existing applications integrated with:** Documents (course materials), People (Capability, directly), Work (a required-training Task).

**4. Engines reused:** Attention (an expiring certification — already the identical shape Documents' own "Expired certificate" Attention item already covers), Search.

**5. Constitutional conflicts?** None found — this is one of the cleanest fits in the document precisely because Capability was already built with almost this exact shape in mind.

**6. Universal or industry-specific?** Universal mechanism, institution-specific content.

**7. Application, engine, infrastructure, or configuration?** Knowledge Base: **a feature of Documents**, not a new application. Learning Management/Training: **a new, narrow first-class Application** — real new Record types (Course, Enrollment) that Capability alone doesn't fully cover, though it extends Capability directly rather than duplicating it.

**8. What becomes possible?** A genuinely closed loop: Recruitment (B3) → onboarding Training → a real Capability → eligible for a Position requiring it — the People lifecycle becomes provably complete end to end.

**9. CEO/manager/frontline benefit?** Yes, broadly, and this is one of the few clusters where frontline benefit is arguably the *primary* one (a frontline worker's own training record, portable and visible to them).

**10. Friction reduction?** Real — training compliance tracking is currently spreadsheet-and-binder territory at nearly every institution type the founder named.

---

### B12. Risk & Compliance — Compliance, Risk Management, Incident Reporting

**1. Why genuinely needed?** The Institutional Policy Model already gives an institution a place to *state* its rules; nothing yet gives it a place to track *whether those rules are being followed* or *what happens when they aren't*. For the regulated end of the founder's own list (hospitals, governments, financial trusts), this is close to the single most commercially important gap this entire document identifies.

**2. Constitutional principles extended:** Institutional Policy Model directly — Compliance is, almost entirely, "is this Policy's exception rate acceptable" (§9 of that document already names exception-pattern-watching as a real signal); Risk Management is a genuinely new observational Record type; Incident Reporting shares Work's own Task/Approval shape almost exactly (an Incident is reported, investigated, resolved — the identical lifecycle shape Work already has, with different vocabulary).

**3. Existing applications integrated with:** heavily Policy (Institutional Policy Model), Work (Incident lifecycle), Documents (incident reports, compliance certificates), Reports (a Compliance report category is a natural, near-zero-cost extension of M11's own already-closed 9-category list — worth flagging as a legitimate 10th category candidate whenever Reports is next revisited, not designed here).

**4. Engines reused:** Policy (directly, the primary engine this cluster leans on), Attention (a compliance exception pattern, an unresolved Incident — both genuine, disciplined Attention candidates, not manufactured urgency), Tamizhi (a strong, low-risk observation fit — "exception requests against this Policy have doubled this quarter," almost verbatim the Institutional Policy Model's own §6 worked example for what Tamizhi is allowed to notice).

**5. Constitutional conflicts?** None found — this cluster is, if anything, the strongest possible proof that Policy's own design already anticipated exactly this need (§6 of that document names the Tamizhi-observes-exception-patterns behavior before Compliance itself was ever proposed as a capability).

**6. Universal or industry-specific?** Universal need, though the regulatory stakes vary enormously by institution type — the second-most jurisdiction/regulation-sensitive cluster in this document after Payroll, for the same underlying reason (real external rules ARUMBU must respect, never encode as platform logic).

**7. Application, engine, infrastructure, or configuration?** **Incident Reporting: a new, narrow first-class Application** (a genuine new Record type, Task-shaped but institutionally distinct enough to deserve its own identity, per Universal Record Model discipline). **Compliance and Risk Management: primarily Policy Configuration plus a Reports extension**, not new applications — they are ways of *reading* Policy and Incident data, not new institutional truths of their own.

**8. What becomes possible?** This is the cluster most directly responsible for moving several institution types on the Enterprise Architecture Audit's own "would you deploy this today" list (hospitals, governments) from "no" toward "not yet, but closer" — Policy alone wasn't enough; Policy plus a real way to see whether it's working is what regulated institutions actually evaluate.

**9. CEO/manager/frontline benefit?** Yes, all three — frontline staff report incidents, managers investigate, founders/boards see the compliance posture.

**10. Friction reduction?** Substantial — today this is binders, spreadsheets, and institutional memory living entirely in specific people's heads, which is precisely the failure mode Product Philosophy's own opening argument ("why institutions fail") describes almost word for word.

---

### B13. Visitor Management

**1. Why genuinely needed?** Real for a meaningful subset (hospitals, schools, government offices, manufacturing floors — safety and security matter), not universal (a five-person temple or a remote-first company has little use for it).

**2–6.** A Visitor Log entry is a real, narrow Record (Identity, institution-scoped, a "now" — checked-in/checked-out); the actual mechanism is almost entirely Forms (§B7) plus a QR/barcode connector (already named in the Integration & Automation Framework's own connector list) plus a light Work-shaped approval for anything requiring host sign-off.

**7. Application, engine, infrastructure, or configuration?** **A thin extension composed from the Structure Engine (§B7) and the Integration Framework**, not a bespoke new application — genuinely one of the smallest, most composable items on this entire list once §B7 exists, and a strong candidate for an Extension rather than ARUMBU core.

**8–10.** Real, narrow value at the institutions that need it; low platform-wide leverage — correctly a late-sequence, extension-territory item, not a core priority.

---

## Section C — Prioritization: the next decade, in order

Not a roadmap (no dates, no milestone numbers — that remains the founder's own decision) — an honest ordering, by architectural leverage, of what this document found:

1. **The Structure Engine (§B7)** — highest leverage in the entire document; a meaningful fraction of every later cluster becomes cheaper, or becomes an Extension rather than core work, once it exists.
2. **Time & Presence (§B1)** — the most-needed, cleanest-fitting, lowest-risk new Application in this document; unlocks Payroll.
3. **Meetings & Scheduling (§B5) and the OS-layer Calendar (Section A)** — cheap, clean, already mostly designed by the Integration Framework.
4. **Recruitment (§B3) and Learning/Training (§B11)** — close the People lifecycle end to end; both fit cleanly into existing machinery.
5. **Compliance/Risk/Incident Reporting (§B12)** — the highest strategic leverage for moving regulated institution types toward "deployable," per the Enterprise Architecture Audit's own verdicts; sequenced here rather than earlier because it benefits from Policy already being real, and Policy is itself still unbuilt as of this document.
6. **Business Intelligence (§B8)** — cheap, a pure Reports extension, sequenced whenever Reports is next touched.
7. **Performance Management & OKRs (§B4)** — real value, but the design-discipline risk named above (manufactured urgency, surveillance-shaped drift) means it deserves to follow, not lead, so the discipline has real precedent (Compliance's own Policy-observation pattern) to be checked against.
8. **Payroll (§B2)** — real and valuable, sequenced deliberately last among the "core" items because it carries the highest jurisdiction-specific-logic discipline risk in the document and should follow, not precede, the platform having already proven it can hold genuinely varied institution-specific rule content correctly (Compliance, Policy) at smaller stakes.
9. **The Operations cluster (§B9) and Visitor Management (§B13)** — deliberately last, and deliberately framed as Extension-territory rather than core roadmap items, contingent on the Structure Engine and a mature Extension Architecture existing first.
10. **CRM (§B10) and Knowledge Base (part of §B11)** — not sequenced at all, because neither requires new work beyond configuration and UI polish on what already exists.

---

## Section D — What this document declines to propose, and why

Naming this explicitly, because a discovery document that only ever says "yes, build this" has not actually done its job:

- **Internal Communication (§B6)** — actively rejected as a first-class application; the correct move is more/better connectors, not a new destination.
- **Seven bespoke Operations applications (§B9)** — reframed as Extension-territory, not declined outright, but explicitly not recommended as ARUMBU-core commitments.
- **Public Portals** — not proposed as new, because it isn't new; already fully specified in Platform Integration Strategy §5.
- **CRM as a distinct application** — not proposed, because Community already is one, correctly, under a more honest name.

---

## Closing test, applied

Every proposal above was checked against the North Star's own five sentences, not only the fifteen-part question list: does it help institutions remember, decide, coordinate, govern, or improve; does it strengthen capability rather than merely add a feature; does it stay calm, explainable, and subordinate to human judgment; does Tamizhi, wherever it touches this cluster, advise and never govern; and does every proposal extend the Constitution rather than reinterpret it. Four capabilities failed at least one of those tests plainly enough to be redirected or declined outright rather than designed. The rest passed, and — measured by how many of them needed a genuinely new mechanism rather than a new application built entirely from mechanisms the Constitution already provides — the strongest evidence in this document that the architecture is sound is how rarely, across thirty-five candidates, it had to reach for something new at all.
