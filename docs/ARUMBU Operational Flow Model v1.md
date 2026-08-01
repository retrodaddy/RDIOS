Status: 🔵 Architectural investigation — design only, no code, no schema, no roadmap change, no constitutional amendment. The ARUMBU Constitution v1 is treated as permanently frozen and immutable throughout. This is a second, deeper pass over territory the ARUMBU Operational Object Framework v1 already investigated once — it does not assume that investigation's verdict repeats, and it tests it against genuinely new evidence (communication, notification routing, measurement attribution) before either confirming or revising it.

# ARUMBU Operational Flow Model v1

## Method, and an honest note on what this document owes the one before it

This is not the first time this question has been asked. The Operational Object Framework already investigated whether a Production Order, a Patient Case, and a Citizen Case require new architecture, and concluded they don't — they're Project. This document does not treat that conclusion as settled and move on; it treats it as a hypothesis worth attacking again, from angles the first investigation didn't use (communication-centricity, notification derivation, measurement attribution, a CEO's actual mental model at Home), because a conclusion that only survives one angle of attack isn't confirmed, it's untested from every other direction. Where this document's new evidence changes nothing, it says so and cites the earlier finding rather than re-deriving it from scratch. Where it finds something genuinely new, it says that too.

---

## Q1 — The smallest possible definition, and the immediate collision

**Attempt:** *An Operational Flow is a real institutional thing that moves through stages, accumulating people, work, money, documents, and communication around it until it completes.*

**Does this collapse into Project? Yes — immediately, and completely.** Project's own frozen definition (M9): "the coordination container across People/Work/Finance/Community/Documents." Project already has a `stage` field. Project already has cross-referencing from Work, Finance, and Community. Project already has a filtered Timeline. There is no clause in the one-sentence definition above that Project's existing design fails to satisfy.

**Per this document's own instruction: stop and explain why, before continuing.** The reason this collision happens is not that the idea is wrong — it's that "Operational Flow" and "Project" are the same architectural concept observed from two different vocabularies: one platform-neutral (Project, People, Work — Product Foundation's own generic application names), one industry-specific (Production Order, Patient Case, Citizen Case — the words an actual Merchandiser or Registrar would use). **This is not evidence the concept is fake. It is evidence the concept already has a home, and the real question this document has to answer is whether anything about the deeper investigation below reveals a genuine gap in that home, or only confirms, again, that the home is correctly built.** The rest of this document proceeds exactly that way — not defending the collision, but not treating it as automatically fatal to the whole exercise either, since the founder's own brief poses ten more questions specifically to test whether it holds up.

---

## Q2 — Orbit review, now including Attention, History, Authority, and Operational Intelligence

| | Orbits the Flow? |
|---|---|
| People | Independent — a Person and their Positions exist regardless of any Flow. |
| Community | Orbits, optionally, via `projectId` — unchanged from the prior investigation. |
| Work | Orbits, optionally, via `projectId` — unchanged. |
| Money (Finance) | Orbits, optionally, via `projectId` — unchanged. |
| Projects | **Is** the Flow. |
| Documents | Orbits, optionally, via its own polymorphic relationship mechanism. |
| Reports | Independent — reads across everything, privileges nothing. |
| Search | Independent, structurally. |
| Tamizhi | Independent, structurally — reasons over whatever its rules cite. |
| **Attention** | **Structurally independent — but its output quality is disproportionately better when a Flow exists to compose around.** This is a genuinely new observation this pass makes explicit: Attention doesn't orbit a Flow the way Work or Finance do, but a Flow is what lets several of Attention's own contributions be recognized as *the same underlying situation* rather than five unrelated cards. Already named once, more softly, in the prior investigation's own §10; restated here with more confidence because §3 and §7 below independently reinforce it. |
| **History** | **Structurally independent (the polymorphic `subject_type`/`subject_id` pattern works for any Record) — but a Flow's own filtered Timeline is, in practice, the single most valuable View of History any Record type produces**, because it's the one Timeline a person is most likely to actually want to read start to finish, per Q3's own sixteen lifecycles below. |
| **Authority** | Independent — Governance's Areas of Responsibility resolve completely without reference to any Flow. |
| **Operational Intelligence** | Independent, structurally (Signals attach to whatever `subjectType`/`subjectId` they're actually about) — **but a disproportionate share of the highest-value Signals from the Operational Intelligence and Measurement & Resource investigations (shortage, delay, yield) are most meaningfully attributed to a Flow specifically**, because a Flow is the human-meaningful unit the shortage is actually *about*, not merely a bare Resource pool or a bare Task in isolation. |

**The pattern found, stated precisely because it's new to this pass:** nothing in this table changes the ownership answer from the prior investigation — no additional application or engine turns out to *orbit* the Flow that didn't already. What changes is a second, softer finding: **several structurally-independent OS pieces produce meaningfully better output when a Flow exists**, which is real evidence for Project mattering more than its own brief may credit it for, without being evidence for a second architectural concept.

---

## Q3 — Sixteen industries, full lifecycles, undsimplified

**Garment Manufacturing.** Merchandiser starts it on receiving a customer order. Sampling (Designer contributes; fabric measured in meters). Customer/Merchandiser approval of the sample. Printing (external Printer/vendor contributes). Cutting (fabric consumed and wasted, both measured in kg/meters). Stitching (labour hours). Packing. Dispatch (a Logistics partner contributes). Ends at delivery confirmation and payment reconciliation. Attached: fabric specs, sample-approval photos, vendor invoices. Measured: kg fabric in, meters cut, waste %, units produced.

**Hospital.** Registrar/Nurse starts a Patient Case on admission. Doctor diagnoses (lab results attached). Senior physician approves higher-risk treatment plans. Pharmacy dispenses medication (units, blood, dosage measured). Ongoing nursing care (recurring Work items). Doctor discharges. Finance bills. Ends at billing closure. Attached: lab reports, imaging, consent forms. Measured: vitals, medicine units, bed-days.

**School.** Admissions officer starts a Student's enrollment. Across the year: attendance recorded, assignments graded (teacher approval), parent-teacher meetings (Community). A disciplinary incident, if one occurs, is its own narrower episode inside the year. Ends at year completion or promotion. Measured: attendance %, grades, meal-programme food.

**College.** Same shape as School, semester-scoped, adds lab-reagent measurement and a placement process that behaves like its own sub-coordination inside a Student's overall record.

**NGO.** Programme Officer starts a Beneficiary Case or Programme cycle. Needs assessment. Resource allocation (relief supplies, measured in kg/units). Distribution (Work, Community relationship). Monitoring and reporting (Documents, Reports). Closes at programme end or stays ongoing. Measured: kg of supplies, beneficiary counts, funds disbursed.

**Temple.** Trustee or Priest starts a Festival. Budget approved (Finance). Ghee and flowers procured (measured in liters/kg). Volunteers and priests execute the event (People). Donations received (Finance/Community). Closes at financial reconciliation. Measured: ghee, flowers, donations, attendee counts.

**Church.** Pastor/Elder starts a Ministry Event. Volunteer coordination (Community). Communion supplies prepared (measured). Event occurs. Pastoral follow-up (Work). Closes.

**Mosque.** Imam/Committee starts a Community Programme (e.g., a Ramadan iftar series). Food procured (kg measured). Daily execution across the period (Work, volunteers). Donations tracked (Finance). Closes at period end.

**Government Office.** Citizen files an application. Registrar opens an Official File. Routed through an Approval Chain spanning several Department Areas (Governance's own worked quorum example, literally). Documents verified. Decision issued. Citizen notified. File closes, or renews periodically. Measured: processing time (a real delay Signal), backlog counts, consumables used.

**Construction.** Site Manager opens a Site. **A Building nests inside it. A Floor nests inside the Building. A Work Package nests inside the Floor** — four genuine levels, each with its own team, its own timeline, its own inspections. Material delivered (cement bags, steel tons, measured). Labour tracked. Inspections (Approvals, quality-adjacent). Completion sign-off cascades upward. Closes when the Site closes.

**Software Company.** Product Manager opens a Feature. Design (Documents). Development (Work, often sub-tasked). Code review (Approval). QA (Work). Deployment (a discrete event). Client delivery and post-launch monitoring. Closes at stable release, or stays open as ongoing maintenance. Measured: engineering hours (capacity-shaped, per the Measurement & Resource Model's own deliberate exclusion of this shape), incident counts.

**Logistics.** Dispatcher opens a Shipment. Loading (weight/volume measured). Transit (driver Work, milestone tracking). Customs (Approval, Documents). Delivery confirmation (a Document). Invoice reconciliation (Finance). Closes at delivery.

**Retail.** A Buyer opens a Purchase Order (bulk restock) independently of any specific Customer Order; supplier fulfillment (units measured), shelf stocking (Work), sales tracked per SKU, a reorder trigger fires as a genuine Shortage Signal. A separate, smaller, faster Customer Order Flow runs independently and far more frequently.

**Agriculture.** A Season Flow opens at planting. **A Field Operation nests inside it** — irrigation, fertilizing, pest monitoring, each its own recurring Work. Harvest yield measured. Sale and distribution (Finance, Community). Season closes at harvest completion.

**Mining.** Mine Manager opens an Extraction Operation (per shift or per batch). Drilling and extraction (tons measured). Processing (a genuine transformation event — raw ore to refined output, per the Measurement & Resource Model's own transformation concept). Safety inspections (Approvals). Transport (Logistics-adjacent). Sale (Finance). Closes per batch, or runs continuously with periodic closures.

**Power Plant.** Shift Supervisor opens an Operating Cycle per shift. Fuel input measured, generation output measured (a real yield ratio, input-to-output, per the Measurement & Resource Model's own Yield primitive). Maintenance events (Work, Asset-linked) run as their own, longer, **parallel or nested** Flow alongside the operating cycle. Safety inspections (Approvals). Closes at shift handover; the Maintenance Flow closes on its own, separate schedule.

**What these sixteen lifecycles converge on, stated once rather than sixteen times:** every single person, document, measurement, approval, and closure event named above already has an architectural home — a responsible Position (Governance), a stage (Project), a measured quantity (the Measurement & Resource Model), an attached Document (Documents), an approval (Work's own Approval type), a closure (Project's own "now"). **Nothing in sixteen independently-reasoned, deliberately un-simplified lifecycles required inventing a concept that doesn't already exist — except one, found independently three separate times: Construction's four levels, Agriculture's Season-then-Field-Operation, and the Power Plant's Cycle-alongside-Maintenance all require genuine nesting, which Project's current schema cannot express.** This is the single strongest, most concrete finding in this document, and it is now confirmed a third time (once in the prior investigation, twice independently within this one).

---

## Q4 — Communication: does it belong to the Flow?

**Tested by trying to disprove every option in turn, as instructed.**

- **Should conversations live strictly under Work (a single Task)?** No — disproven directly by Q3's own examples: "Where is Order 145?" routinely spans several stages (sampling *and* cutting *and* dispatch) at once. Binding conversation to one Task under-serves the actual question people are asking.
- **Should conversations become their own first-class Application?** No — and this is not a fresh finding, it's a direct application of an already-frozen conclusion. The ARUMBU Architecture Phase 2 document already investigated exactly this (its own §B6, "Internal Communication") and rejected it outright, on the grounds that it would compete with the already-designed connector-based approach (Slack/Teams/WhatsApp/Email, per the Integration & Automation Framework) and would directly violate the North Star's own "strengthen capability, not feature count." This document does not reopen that finding; it confirms it holds under a second, independent line of questioning.
- **Should conversations live strictly under Projects, mandatorily?** No — over-constraining. Not every real institutional conversation concerns a specific coordination container (routine chatter, a quick clarifying question with no operational weight), and forcing every message to attach to a Flow would manufacture artificial Flows purely to hold conversation, which is not what any Flow is for.
- **The option that survives: communication already has a home, and it isn't new.** The Universal Record Model already names Comments as a universal door every Record type is eligible for — "real value for Work (already built)... kept as a universal door" (Universal Record Model §3), explicitly left open rather than mandatory. What this investigation adds is not a new mechanism, but a precise confirmation of *where that door is most valuable*: the observation "people ask 'where is Order 145,' not 'what did John say'" is exactly evidence that Comments should default to being **surfaced and composed at the Flow level** — aggregated across a Project's own linked Tasks and stages into one coherent thread — rather than scattered across five separate Task-level comment sections a person has to hunt through individually. **This is an implementation-completeness finding (Comments, still unbuilt per Universal Record Model's own honest accounting, should be built with Flow-level aggregation as its primary presentation), not an architecture finding.**

---

## Q5 — Notification routing

**Yes — it falls out of the Flow model, but "falls out of" means it falls out of Governance, not out of any new mechanism the Flow itself would need to invent.** For the wastage example (Merchandiser, Supervisor, Designer, Printer, Vendor, Finance, Owner):

- **Not everyone** — a blanket "notify all seven" is precisely the manufactured-urgency failure Product Philosophy already warns against.
- **Whoever holds the Area of Responsibility for the stage where the wastage occurred** (Production, or whatever the institution calls it) — Governance's existing Area-resolution mechanism, unmodified.
- **The Flow's own named responsible Position** (the Merchandiser, if Project carries such a field — a real, narrow property worth confirming exists, or adding if it doesn't, per the same "smallest possible addition" discipline this document's own rules require).
- **Finance, only if the wastage crosses a Policy-configured cost threshold** — directly reusing the Institutional Policy Model's own Business Rule mechanism and the Measurement & Resource Model's own Waste/Loss distinction, exactly as already designed elsewhere in this series.
- **The Owner, only via Governance's own Escalation mechanism (§7 of that document) if the responsible parties don't act** — never as a default recipient.

**Nothing here required a new routing concept.** It required exactly one confirmation (does Project already carry a named responsible-Position field) and reused three already-frozen mechanisms (Governance's Areas, Policy's Business Rules, Governance's Escalation) without modification.

---

## Q6 — Measurements: Flow or Inventory?

**Both, simultaneously, via the identical multi-reference pattern the platform already uses elsewhere — not an either/or.** Applying the Measurement & Resource Model's own design directly: a Resource Transaction (10m sent for sample; 1.3m wasted) is primarily attributed to the **Resource** itself (the fabric pool, so the institution's total stock stays accurate — this is where "remaining" is actually computed from, per that document's own §2 finding). It should **also, optionally**, carry a reference to the **Flow** that consumed it — the exact same "optional `projectId` cross-reference" pattern M9 already proved for Work, Finance, and Community, extended here to Resource Transactions as one more instance of a pattern that already exists rather than a new one.

**Repeated across the other seven, briefly, confirming the same shape each time:**

- **Hospital** — medicine units dispensed, attributed to the medicine stock *and* the specific Patient Case.
- **Construction** — cement bags used, attributed to cement stock *and* the specific Work Package.
- **Agriculture** — seed and water used, attributed to input stock *and* the specific Field Operation.
- **Logistics** — fuel consumed, attributed to fuel stock *and* the specific Shipment.
- **Retail** — units sold, attributed to SKU stock *and*, where relevant, a specific Customer Order.
- **Government** — consumables used, attributed to supply stock *and* the specific Citizen Case, where tracked that granularly.
- **Schools** — meal-programme food, attributed to the general food stock — and here, honestly, **often with no Flow attached at all**, since a routine daily meal frequently has no coordination container worth creating. Named specifically because a real answer to this question has to include the honest case where the second reference is absent, not just the seven where it's present.

**The finding, stated once: measurement belongs to the Resource for stock-accuracy, and optionally, additionally, to the Flow for institutional-history purposes — both true at once, via a pattern that already exists.** Nothing here requires choosing one home over the other, and nothing here requires inventing anything beyond confirming the Resource Transaction record (already proposed, not yet built) should carry the same optional cross-reference field every other domain's own transaction record already carries.

---

## Q7 — Home: Applications, or Operational Flows?

**Flows, by an unusually wide margin — and this is the most consequential UX finding in this document, precisely because it wasn't manufactured to sound impressive; it's the direct, converging output of Q3's sixteen lifecycles.** Not one of the sixteen people described in those lifecycles — the Merchandiser, the Registrar, the Site Manager, the Shift Supervisor — narrated their day in application terms ("let me check Work, then Finance, then Documents"). Every one of them narrated it in Flow terms: the Order, the Case, the Shipment, the File, the Site. **This confirms, with unusually strong and repeated evidence, that a CEO's own actual mental model at Home is already Flow-centric, and Home should reflect that more deliberately than it currently does.**

This is not evidence for a new tier, a new Record type, or a new engine. It is the strongest possible confirmation of the refinement already named once, more tentatively, in the prior investigation (§10, Attention rollup) and again in Q2 above: **when several Attention-worthy facts share one Project, composing them into a single card that names the Flow — "Production Order 145 needs attention" — rather than several uncomposed application-level fragments, is not a nice-to-have. It is the difference between Home speaking the language its own users actually think in, and Home speaking the language ARUMBU's own internal folder structure happens to use.** This remains a refinement to existing Attention Contract composition, not a new architectural concept — but this pass raises its priority meaningfully above where the prior investigation left it.

---

## Q8 — Hierarchy: is Construction's example already Project nesting, or something different?

**The same gap, confirmed a third time — and one important distinction worth drawing precisely, because not everything that looks like a sub-thing actually is one.**

Compare the Construction example (Site → Building → Floor → Work Package) against the Production Order's own internal stages (Sampling → Printing → Cutting → Stitching). These look superficially similar — both are "things inside a bigger thing" — but they are structurally different, and treating them the same would be a real mistake:

- **Sampling, Printing, Cutting, and Stitching are sequential *stages of one Flow*** — they share the same team (broadly), the same overall responsible Position, and the same single Timeline. This is exactly what `Project.stage` already exists to express, and nothing about it needs nesting.
- **A Building, a Floor, and a Work Package each plausibly need their own independent coordination** — their own responsible Position, their own team, their own Timeline, their own Documents — while still belonging to the parent Site. This is genuine nesting, not merely a stage transition.

**The test that distinguishes them, worth stating as a real, reusable design principle: a sub-thing deserves its own nested Flow only if it needs independent coordination of its own — a distinct responsible Position, a distinct team, a distinct Timeline. If it only needs a different label on the same coordination, it's a stage, not a nested Flow.** Applying this test to Q3's own sixteen lifecycles: Construction, Agriculture (Season → Field Operation), and the Power Plant (Cycle alongside Maintenance) all pass this test genuinely. The garment Production Order's own stages do not — they were never a nesting example to begin with, and this document declines to treat them as one just because the founder's own Q6 walkthrough uses the identical arrow notation for both.

**Confirmed: this is Project nesting — a real, narrow schema gap (a self-referential `parentProjectId`), not a different concept.** Named once already in the prior investigation; found independently twice more here, which per the Universal Record Model's own convergent-evidence standard is exactly the kind of repeated, unprompted discovery worth treating as settled rather than coincidental.

---

## Q9 — Shared Engine eligibility, tested against the exact bar already applied to Authority, Search, Tamizhi, Operational Intelligence, the Structure Engine, and the Measurement Model

**Does it make institution-agnostic decisions or enforce rules independent of any one domain's content?** No. A Flow coordinates and references; it decides nothing, ranks nothing, advises nothing, and resolves no standing. This is the identical test Work and Documents already failed (Constitutional Clarifications v1's own engine-terminology reconciliation) and the identical test Operational Object already failed once. **It fails again, for the same reason, and there is no new argument in this document's own eleven questions that changes that answer.**

**Is it an Application?** No — not a *new* one. It is Project, an Application that already exists.

**Is it Infrastructure?** No — it has real institutional truth of its own (a Flow's "now" genuinely matters to the institution), which disqualifies it from Infrastructure by the identical test already applied to Integrations and to the Operational Intelligence Engine's own boundary in the two documents that examined those questions.

**Is it a Universal Record discipline?** **Closest of the five candidates, and worth naming precisely rather than dismissively.** Not a new discipline sitting beside the Universal Record Model the way that document sits beside the Application Layer — but a genuine, narrow **checklist-within-the-checklist**: a Record type that wants to correctly serve as a Flow should be checked against a small, specific set of properties — does it support an institution-configured stage sequence, does it support optional self-referential nesting, does it carry a named responsible Position, does it aggregate Comments/Attention/Signals from its own linked children. Project already satisfies most of these; the two gaps found in this document (nesting, and confirming a responsible-Position field) are exactly what closing this checklist would require.

**Is it merely Project terminology?** No — and this is worth stating precisely, because it slightly undersells what this investigation actually found. It is Project's **already-confirmed structural role**, now named with more precision than "just call it something else per institution type" would imply — a real checklist of properties worth holding Project to, not merely a vocabulary overlay.

---

## Q10 — Active disproof: an entire section arguing Operational Flow should not exist

Every single fact named across sixteen deliberately un-simplified industry lifecycles (Q3) was successfully expressed using vocabulary Project, Work, Finance, Documents, Community, Governance, and the Measurement & Resource Model already provide: a responsible Position (Governance), a stage (Project's own field), a measured quantity (a Resource Transaction), an attached Document (Documents' own relationship mechanism), an approval (Work's Approval type), a communication thread (Comments, the already-named universal door), and a closure event (Project's own "now"). **Not one of the sixteen lifecycles required a concept that doesn't already exist somewhere in this corpus.**

If Operational Flow were built as a *separate* Record type from Project, it would immediately and unavoidably duplicate every one of those mechanisms — its own cross-reference fields, its own Timeline, its own stage concept, its own responsible-Position field — the exact premature-abstraction failure the Universal Record Model already named and refused to commit once (its own §10, "a single literal database table... would be precisely the kind of premature, heavy abstraction this entire engagement has correctly refused every other time it's come up") and the Operational Object investigation already refused a second time.

**The disproof succeeds almost completely.** What survives it is narrow, specific, and named three separate times across two independent documents: **nesting.** Project's current schema — flat, with no self-reference — genuinely cannot express Construction's four levels, Agriculture's Season-then-Field-Operation, or the Power Plant's Cycle-alongside-Maintenance, and no amount of correct usage of Project's existing fields closes that gap, because the gap is structural, not a matter of using what already exists more carefully. This is the one place the disproof fails, and it fails in exactly the same place, independently, every time this question has been asked.

---

## Q11 — Ten years from now

With Spreadsheet, Calendar, Messaging, Automation, Inventory, Manufacturing, Payroll, Fleet, Maintenance, Recruitment, CRM, Learning, Scheduling, and Quality all built, does the concept get stronger, weaker, or unnecessary?

**Stronger — and by a wide margin, because every one of those fourteen future capabilities is a *new consumer* of the identical coordination point, not a competitor to it.** A Manufacturing Production Order is a Project carrying Resource Transactions (Measurement & Resource Model). A Quality inspection is Structure-Engine content attached to a Project's stage (Architecture Phase 2's own B7). A CRM pipeline deal already *is* a Project, correctly, per Phase 2's own B10 finding. A Maintenance Job optionally references a Project the way it already would an Asset. Fleet fuel consumption is a Resource Transaction, optionally Flow-attributed, exactly as Q6 already specifies. **None of these fourteen future capabilities need Operational Flow to become a separate concept to be built correctly — every one of them becomes easier specifically because Project is already there to reference, and the nesting gap becomes more urgent, not less, as Construction- and Manufacturing-shaped applications actually get built and immediately need it.**

---

## Verdict

**2. Refine Project instead.**

Not a rejection — the underlying instinct that prompted this entire investigation, run twice now from genuinely different angles, was correct: institutions do organize their operational lives around one central coordinating entity, and that entity's structural properties (a responsible Position, a stage sequence, cross-referenced children, a filtered Timeline) are real and worth being precise about. Not a new constitutional concept either — Q9's own application of the exact bar already used for five prior engines fails it cleanly, for the same reason it failed for Work and Documents, and Q10's own dedicated disproof section could not find a single fact across sixteen deliberately un-simplified industry lifecycles that required inventing something new.

**The smallest possible addition, supported by evidence gathered independently across two full investigations rather than intuition:**

1. **Optional self-referential nesting** (`parentProjectId`), confirmed as a real, structural gap three separate times (Operational Object's own §3/§7; this document's Q3 and Q8) — the single item in this entire investigation with the strongest, most repeated evidence behind it.
2. **A confirmed, named responsible-Position field on Project** — needed for Q5's notification routing to resolve cleanly without a manual list, and needed for Q7's own Home-composition rollup to know what to name a card after.
3. **Comments, already named as a universal door in the Universal Record Model, should graduate from acknowledged-but-unbuilt to built, with Flow-level aggregation as its default presentation** — Q4's own direct finding.
4. **Resource Transactions, once built per the Measurement & Resource Model, should carry the same optional Project cross-reference every other domain's transaction record already carries** — Q6's own direct finding.
5. **Attention Contract composition should roll multiple Attention-worthy facts sharing one Project into a single, Flow-named card** — a refinement, not a new tier, raised in priority by Q2 and Q7's converging evidence.

Every one of these five is an extension of something already built or already named, never a new mechanism — which is itself the final, honest piece of evidence this document has to offer: a genuine architectural discovery would have produced at least one finding that didn't reduce to "confirm a field exists" or "finish building a door the Constitution already opened." This investigation, run as hard as the founder's own eleven questions could run it, did not produce one.
