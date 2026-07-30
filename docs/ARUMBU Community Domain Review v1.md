Status: 🟡 Draft — design review, not yet accepted. Design-only: no code, no implementation, no architecture changes until this document is accepted. Extends the RDIOS Product Foundation v1's §4 (Application Architecture) and builds directly on the RDIOS People Domain Review v1's already-frozen boundary rule rather than re-deriving it. Governed throughout by the already-frozen RDIOS Institution Intelligence Principles v1 — this document sharpens where those principles apply inside Community, it does not add new ones.

# ARUMBU Community Domain Review v1

## The question this document answers

The People Domain Review answered who's *inside* an institution. This document answers who's *around* it. A hospital has patients and donors. A temple has devotees, volunteers, and vendors. A school has students, donor parents, and suppliers. A company has customers and vendors. Every one of these is a real, ongoing relationship the institution needs to remember — and today, ARUMBU's own navigation already senses this (`os/institution/terminology.ts` relabels the "Customers" destination as "Patients," "Students," "Beneficiaries," "Community," or "Congregation" depending on institution type) without ever having formally defined what the underlying thing being relabeled actually *is*. This document defines it — one domain model that Customer, Patient, Student, Devotee, Donor, Beneficiary, Volunteer, Vendor, and Supplier are all real, named shapes of, the same way Position and Affiliation are named shapes of "relationship" inside People.

The People Domain Review already drew one boundary precisely: "not every relationship requires a Person and a Membership — only relationships requiring actual system access do." That sentence is this document's starting point, not its subject. Community is the domain of everything on the *other* side of that boundary — everyone and everything an institution relates to who is not, by default, a member of it.

## What is a "relationship" in ARUMBU?

A relationship is the recorded fact that an institution and an external party — a person or an organization — are connected in some way the institution needs to remember, that carries **no authority inside the institution's structure**, and that does **not**, by default, require that party to ever sign in. It is the external counterpart to Affiliation: Affiliation is a real, non-authority relationship the institution already has a Person and a Membership for; a Community relationship is a real, non-authority relationship the institution does *not* yet have a Person or Membership for, and in the overwhelming majority of cases never will.

Two concepts, mirroring the discipline the People Domain already set:

**Contact** — the external counterpart to Person, with one deliberate difference: **a Contact is institution-scoped, not global.** Person is global because People Domain Review needed one identity a consultant or trustee could carry across institutions they actually belong to. Community has no equivalent proven need yet — a donor who happens to give to two unrelated institutions gains nothing from ARUMBU silently knowing that, and resolving "is this the same vendor across two tenants" correctly is a real identity-matching problem, not a free byproduct of good schema design. Each institution's Contacts are its own, exactly as Customers' contact records already are per the People Domain Review's existing "the subsystem owns the truth" framing. A future cross-institution Contact-matching capability is a plausible extension (§ What remains open), not something to design speculatively now.

**Relationship** — the fact that a Contact relates to this institution in a specific way, carrying two things: a **Direction** (below) and a **Type** (an institution-configured label like "Devotee" or "Vendor"). A single Contact can hold more than one Relationship concurrently — a hospital's patient who is also a donor, a temple's devotee who also volunteers, a company whose customer is also, separately, a supplier — the same "more than one concurrent thing attached to one identity" shape Membership already proved correct for Position and Affiliation.

## The rule that decides what a relationship *is*

Just as People Domain Review found that "employment is never a field, it's an emergent property of which relationships a Membership holds," Community has its own version of that rule:

**Direction is universal. Type is institution-specific.** Every external relationship an institution has, regardless of institution type, resolves to exactly one of three directions:

- **Receiving** — the institution provides something to this Contact: care, education, goods, spiritual service, benefit. Customer, Patient, Student, Devotee, Beneficiary, Congregation are all Receiving-direction Types.
- **Supporting** — this Contact gives something to the institution without the institution owing them a service in return: money, time, standing. Donor and Volunteer are Supporting-direction Types.
- **Supplying** — this Contact provides something the institution consumes to operate: goods, services, contracted work. Vendor, Supplier, Contractor are Supplying-direction Types.

Direction is the fixed, three-value enum the rest of the engine — Attention, Finance, History — can reason about without ever knowing an institution's actual vocabulary. Type is Institution Configuration (Foundation §8), seeded from sensible starter sets per institution type exactly the way Position and Affiliation types already are, editable, never hardcoded. ARUMBU never needs to know that a temple calls its Receiving-direction relationships "Devotees" and a hospital calls the identical direction "Patients" — it only ever needs to know which direction a Type belongs to, the same way it never needs to know what a Position is called to know it carries authority.

This also resolves something the current terminology data leaves ambiguous without saying so: `os/institution/terminology.ts`'s `affiliationExample` field today lists "Volunteer" and "Donor" as *Affiliation* examples for several institution types. That remains correct only for the subset of volunteers and donors who actually hold system access — a volunteer coordinator who needs to log in and manage shifts, for instance, genuinely is a Membership with an Affiliation. Every other volunteer and donor — the overwhelming majority — is a Community relationship, not a People one. Nothing about the existing terminology data is wrong; it was simply speaking about the narrow case that crosses the boundary, without the wider case (this document) having been defined yet to make that narrowness visible.

## Where Community stops and People starts

Unchanged from the People Domain Review, restated here because it is the load-bearing rule this entire document sits on top of: **the boundary crosses only when real system access is required.** A patient who gets a portal login, a donor who gets a recognition dashboard, a volunteer coordinator who needs to manage shifts inside ARUMBU itself — the moment access to the system is genuinely needed, that Contact gains a real Person identity and a Membership, almost always through Affiliation rather than Position, since a patient or donor holds no authority in the institution's structure. Their Community Contact record and their People Membership are two different things owned by two different layers, exactly as People Domain Review already specified for Customers generally; this document does not reopen that rule, only confirms it now applies identically to every Relationship Type, not only to customers.

Most Community relationships never cross this boundary at all, and that is the correct, expected, permanent state for the large majority of them — a Contact does not need to want to log in eventually to be worth recording well today.

## How the nine named relationships fit one model

| Named relationship | Direction | Typically appears for |
|---|---|---|
| Customer | Receiving | Company, Manufacturing |
| Patient | Receiving | Hospital |
| Student | Receiving | School, College |
| Devotee | Receiving | Temple |
| Beneficiary | Receiving | NGO, Trust |
| Congregation member | Receiving | Church, Mosque |
| Donor | Supporting | Any type, most often NGO, Temple, School, Trust |
| Volunteer | Supporting | Any type, most often congregation-style and NGO institutions |
| Vendor / Supplier | Supplying | Every institution type — the one Type that is nearly universal regardless of what the institution otherwise does |

None of these are separate domain concepts. All nine are Relationship Types, each carrying one of the three Directions, each configured per institution the way Position and Affiliation types already are. A hospital does not need a different domain model from a temple's — it needs a different, institution-configured *vocabulary* laid over the identical three-direction shape. This is the same trick the whole platform already relies on (Foundation §8, threaded through every application built so far); Community does not invent a new mechanism, it is simply the next domain that needs it.

## What should be universal, and what should be institution-specific

**Universal — never configured away, identical for every institution:**
- The Contact / Relationship shape itself.
- The three Relationship Directions (Receiving, Supporting, Supplying) — fixed, not institution data, because Attention, Finance, and History all need to reason about direction without needing to know an institution's vocabulary.
- The People-boundary rule (access requires a real Person + Membership; nothing else does).
- A Relationship's status lifecycle — active, inactive/lapsed, ended — mirroring the same shape Membership already uses, so "is this relationship still real" is answered the same way everywhere.
- The connection points into Finance, Work, Documents, and History described below — every application reaches into Community through the same doors, never a bespoke one per institution type.

**Institution-specific — Institution Configuration, not engine behavior:**
- Relationship Type vocabulary and which Types are seeded as starters for a given institution type (the table above).
- Nav label, question, and empty-state description for the Community destination — extending the exact mechanism `os/institution/terminology.ts` already uses for the "customers" key today, not a new one.
- Whether Supporting or Supplying relationships are prominent enough in a given institution's daily use to warrant their own view versus living inside one combined Community screen — a UI sequencing question, not a domain one, and explicitly out of scope for this document.
- Whether Community is active at all for a given institution — Foundation §4 already establishes that applications are enabled per institution, not force-fed; in practice, the Supplying direction alone (nearly every institution buys something from someone) makes full disablement rare, but the option should remain real, not assumed away.

## How Community should connect with Finance, Work, Projects, Documents, and History

**Finance.** This is Community's most natural, lowest-risk connection point, and one the M7 Finance & Assets build already half-anticipated without being able to complete it, since Community didn't exist yet. Today, `Expense.payee` and `Income.payer` are free-text fields — a person types "Local Flower Vendor" or "Anonymous Devotee" by hand, the same way `Asset.custodianPersonId` used to have no real answer before People existed to supply one. The natural evolution, once Community is real, is for a Supplying-direction Relationship to become the real referent behind `payee`, and a Receiving- or Supporting-direction Relationship to become the real referent behind `payer` — exactly the same pattern `Asset.custodianPersonId` already uses to point at a real Person instead of a name typed by hand, and exactly the same pattern `Asset.acquiredViaExpenseId` already uses to connect two applications' records instead of duplicating a fact. This document does not propose migrating those fields now — the free-text version remains correct and complete on its own — only names the seam so the eventual connection is additive, not a redesign.

**Work.** A task or approval frequently concerns a specific relationship in the real world — following up with a lapsed donor, resolving a patient's complaint, renewing a vendor's contract. Work Items already carry a free-text title and description with nowhere to point at *who* the work concerns beyond that text. A future `relatedContactId` (or similarly-shaped) field on a Work Item would be the natural seam, the same class of connection Finance's `acquiredViaExpenseId` already demonstrates works well: additive, optional, never required, never blocking Work from functioning without it.

**Projects.** Not yet built, so this is necessarily the most speculative connection named here — but a Project scoped to a Relationship (a client engagement, a grant-funded program tied to a specific funder) is close to the default shape most institutions will actually want the moment Projects becomes real. Worth deciding when Projects is actually designed, not here.

**Documents.** A Relationship should be able to carry the same `DocumentRef` placeholder-reference pattern the M7 Finance & Assets build already established for Expenses and Assets — a signed vendor agreement, a patient consent form, a devotee's membership record. This is not a new mechanism to design; it is the same one, applied to a third application, exactly as intended when it was built.

**History.** Every meaningful Relationship event should call the same shared `recordHistory()` every other application already uses — no new history mechanism, ever, per the Platform Cohesion Review's explicit finding that a second parallel history mechanism would be exactly the wrong direction. That same Cohesion Review also found a real, repeated pattern worth naming here before Community inherits it: across People, Work, and Finance, actions that *create or grant* something are recorded far more reliably than actions that *end or revoke* something — appointing is recorded, ending an appointment mostly isn't. Community's own eventual history should be designed from day one to record both a relationship's beginning **and** its ending with equal weight, closing that pattern rather than repeating it a fourth time.

## Where Tamizhi should observe but never interfere

The RDIOS Institution Intelligence Principles v1 already settled how intelligence is allowed to behave everywhere in ARUMBU — this section does not add rules, it applies the existing ones to the one domain where getting them wrong is most visible outside the institution itself, because Community is the one place where "the other side" of a relationship is a real external person or organization, not a colleague.

- **Tamizhi may observe relationship patterns and speak only through the same two doors everything else uses** — a donor who has gone quiet, a patient overdue for follow-up, a vendor whose costs are trending up — surfaced as an ordinary Be Aware item or, only when a real decision is actually due, an ordinary Act Now card with a real verb. Never a separate "insights" panel bolted onto Community, per Principle 7's "no channel of its own."
- **Tamizhi never merges or auto-classifies Contact records on its own authority.** Two Contacts that might be the same person is exactly the kind of judgment call that is cheap to get right by asking and expensive to get wrong silently — per Principle 6, the correct behavior is an ordinary suggestion ("these two might be the same — worth checking"), never a silent merge, because a wrongly merged relationship is very hard to un-merge cleanly and a wrongly *un*-merged one costs almost nothing.
- **Tamizhi never contacts an external party on the institution's behalf.** Sending a message, placing a call, replying to a donor or a vendor — none of this is named anywhere in the Intelligence Principles as something Tamizhi does, and Community is the domain where the omission matters most: a presumptuous or wrong action taken against an internal Work Item is an institution's own problem to fix quietly; the same mistake taken against a real donor or patient is reputational, external, and not fully reversible by an apology inside the product. This is not a new rule — Principle 6's refusal discipline and Principle 5's "never irreversible on its own authority" already cover it — but it is worth stating in Community's own terms, since this is the one domain where the cost of forgetting it is paid by someone outside the institution, not inside it.
- **The closing test from the Intelligence Principles applies here exactly as everywhere else**: if Tamizhi vanished tonight, every Community screen must still make complete sense tomorrow morning. A donor's giving history, a vendor's relationship record, a patient's contact details — none of it should ever depend on Tamizhi having been present to be complete or trustworthy.

## Terminology by institution type

Extending `os/institution/terminology.ts`'s existing pattern for the "customers" nav key — Receiving-direction labels below already match what the platform shows today; Supporting and Supplying are named here for the first time, not yet implemented, and should follow the identical override mechanism when they are.

| Institution type | Receiving | Supporting | Supplying |
|---|---|---|---|
| Company | Customers | — | Vendors |
| Hospital | Patients | Donors | Suppliers |
| School | Students | Donors | Suppliers |
| College | Students | Alumni Donors | Suppliers |
| NGO | Beneficiaries | Donors, Volunteers | Vendors |
| Temple | Community | Donors, Volunteers | Vendors |
| Church | Congregation | Donors, Volunteers | Vendors |
| Mosque | Community | Donors, Volunteers | Vendors |
| Trust | Beneficiaries | Donors | Vendors |
| Government | Citizens | — | Contractors |
| Manufacturing | Clients | — | Suppliers |
| Other | Customers | Donors | Vendors |

Company, Government, and Manufacturing show no default Supporting-direction label because a Supporting relationship (someone giving money or time without receiving a service) is genuinely uncommon for those institution types, not because the direction doesn't exist for them — a company with a genuine benefactor or a government office with a grant funder can still record one; there is simply no confident default word to seed, the same reasoning `os/institution/terminology.ts` already applies wherever it leaves a key unlisted and falls back to a plain default.

## One naming decision this document settles

The RDIOS Product Foundation v1 named this application "Customers" — a reasonable default at the time, before the People Domain Review's Affiliation-example data or `os/institution/terminology.ts`'s own nav overrides had made clear how far the real domain extends beyond that word. "Customers" is correct only for a Company; it was never going to be the right *engine* name for a domain that already, today, calls itself "Patients" for a hospital and "Community" for a temple.

This document recommends the domain adopt **Community** as its name at every layer that isn't institution-facing copy — the same relationship "ARUMBU" now has to "RDIOS": Community becomes the name a developer, this document, and any future design review use to talk about the domain itself; "Customers," "Patients," "Devotees," and every other Type-specific word remain exactly what they already are — institution-facing labels laid over one underlying thing, never the thing's real name. Nothing about this requires renaming code today; it only settles what the *next* document that touches this domain should call it, so a future "Community Domain: Vendors & Suppliers" review doesn't have to re-litigate the question this paragraph already answered.

## What this settles, concretely, for whenever implementation is designed

- Community is the external counterpart to People: a Contact (institution-scoped, not global) and a Relationship (Direction + institution-configured Type), the same two-tier shape Person/Membership and Position/Affiliation already proved out.
- Direction — Receiving, Supporting, Supplying — is the one universal, non-configurable fact about every Community relationship, regardless of institution type.
- Relationship Type is Institution Configuration, seeded from starter sets per institution type, never hardcoded — identical discipline to Position and Affiliation types.
- The People-boundary rule is unchanged and now explicitly applies to every Relationship Type, not only customers: a Contact gains a real Person + Membership only when genuine system access is needed, almost always through Affiliation.
- Finance's `payee`/`payer` free-text fields and Work's free-text descriptions both have a named, additive seam into Community (mirroring `Asset.custodianPersonId` and `acquiredViaExpenseId`) — not proposed for migration now.
- Documents' `DocumentRef` pattern extends to Community unchanged; History's existing mechanism extends to Community unchanged — with the explicit design intent that ending a relationship is recorded exactly as reliably as beginning one, closing a gap named in the Platform Cohesion Review before Community has the chance to repeat it.
- Tamizhi's behavior inside Community is governed entirely by the existing Institution Intelligence Principles v1; this document adds no new rule, only names the two places (merging Contacts, contacting an external party) where that governance matters most visibly.
- "Community" is the domain's real name going forward; "Customers" and every other Type word remain institution-facing labels over it, the same relationship ARUMBU now has to RDIOS.

## What remains open

- Whether cross-institution Contact matching (the same donor recognized across two institutions that both use ARUMBU) is ever worth building is explicitly not decided here — named as a plausible future extension, not a current gap, per the same discipline that kept Capability single-institution-scoped in the People Domain Review.
- Whether a Vendor/Supplier needs a Capability-like concept of its own (certifications, licenses, insurance on file) is a real, plausible need — a hospital's supplier of medical equipment probably has one — but is not designed here.
- The exact UI difference, if any, between a Receiving-direction relationship's screen and a Supplying-direction one — both are Community, but a patient list and a vendor list will likely not want to look identical. Worth resolving once Community's screens are actually being designed, not here, the same way the equivalent question was left open for People's "teammate vs. external contact" distinction and correctly deferred.
- Whether Relationship Type should support an institution defining its own Direction for a Type it invents, or whether Direction must always be chosen from the fixed three — this document assumes the latter (Direction stays a closed, universal enum even though Type is open), but the assumption is worth stating plainly rather than leaving implicit, since it is the one place this document deliberately did not give an institution full configuration freedom.
