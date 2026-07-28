Status: 🟢 Frozen v1 — per RDIOS Architecture Freeze Declaration v1. Extends the RDIOS Product Foundation v1's §3 (Tenant Architecture) and §4 (Application Architecture: People). Builds directly on RDE's own settled Workforce reasoning rather than re-deriving it — RDE's Position/Affiliation/Capability split was arrived at through genuine domain-driven reversal (not implementation convenience) and is carried forward here as precedent, generalized for multi-tenancy.

# RDIOS People Domain Review v1

## The question this document answers

Not everyone with a real relationship to an institution is an employee. A hospital has doctors, patients, donors, and volunteers. A temple has trustees, priests, and devotees. A school has teachers, students, and parents. RDE's own domain — an agency with a founder and a small team — never had to answer this question, because everyone who mattered was, functionally, staff. RDIOS cannot inherit that assumption. This document defines the People Domain precisely enough that "employee" becomes one possible shape a relationship can take, not the default one.

## The four concepts, and how they relate

**Person** — a global identity. Email, name, nothing tenant-specific. A person exists once, regardless of how many institutions they touch. A consultant serving two institutions, a trustee on two boards, a doctor with privileges at two hospitals — all one Person, never duplicated.

**Institution Membership** — the fact that a Person has *some* relationship with *this* institution, at all. The thinnest possible unit of "this person is known to this institution." A Membership by itself grants nothing — it's the anchor everything else attaches to, and the boundary at which tenant isolation actually applies to a person (§3 of the Foundation).

**Position** — an authority-bearing seat within one institution. What RDE already built and froze: append-only Position Holder history, a self-referencing reporting graph, Position Permissions. This is the *employment-shaped* relationship — not literally "employed" in a payroll sense, but "holds real authority in the structure." A department head, a trustee with signing authority, a priest with liturgical authority — all Positions, regardless of whether any money changes hands.

**Affiliation** — a real, meaningful, non-authority relationship. This is exactly the concept RDE's own Domain Architecture Review fought for and correctly won — a volunteer, a donor, an alumnus, a board member without operational authority, a vendor contact, a contractor without a Position. Affiliation was proven, in RDE's own history, to be a genuine independent domain concept and not a workaround for a missing feature; RDIOS generalizes it rather than reinvents it.

**Capability** — a Person's *current* qualification or skill, scoped to one institution. RDE's own reconsideration got this right: Capability is not append-only history like Position and Affiliation, because a capability is an attribute of the person's present state, not a record of who held a slot over time. That conclusion holds unchanged here.

## The rule that decides what's "employment" and what isn't

**Employment is never a field. It's an emergent property of which relationships a Membership holds.** A Membership with an active Position is, functionally, "staff" in whatever language the institution uses for that. A Membership with only Affiliations is a volunteer, donor, or contact — real, tracked, permissioned appropriately, never treated as staff by default.

Even the finer distinctions inside "employment" — full-time, contract, locum, resident, trustee, priest — are not a fixed enum RDIOS ships with. They're **Position types and Affiliation types**, configured per institution in the Institution Configuration Layer (Foundation §8), seeded from sensible starter sets per institution type. A hospital's Position types look nothing like a temple's; RDIOS never needs to know the difference, because it never hardcodes either.

## Where Customers stops and People starts

A real boundary question: is a customer contact the same kind of entity as an institution member?

**No, by default.** Customers (the CRM application) owns its own contact and organization records completely — that's "the subsystem owns the truth" applied literally. A customer contact never needs a Person row, a Membership, a Position, or an Affiliation, because they never need to authenticate into RDIOS or be reasoned about by the Attention Engine as a person with decisions to make.

**The boundary crosses only when system access is actually required.** A patient who gets portal login, a donor who gets a recognition dashboard, a parent who needs to see their child's records — the moment external access to RDIOS itself is needed, that person gets a real Person identity and a Membership, almost always scoped through Affiliation rather than Position (a patient holds no authority in the hospital's structure), with permissions scoped tightly to exactly what that access is for. The CRM's own contact record and this Person/Membership pair can reference each other, but they remain two different things owned by two different layers — the CRM record is Customers' truth; the Person/Membership is the People Domain's truth about system access.

This means: **not every relationship requires a Person and a Membership — only relationships requiring actual RDIOS access do.** Most customer, donor, and vendor relationships never cross into the People Domain at all.

## Multiple relationships, multiple institutions

A single Membership can hold more than one Position (a person acting as both a Department Head and, temporarily, covering a vacant adjacent seat) and any number of Affiliations concurrently — RDE already proved this shape works (a person can hold a Position while also carrying Affiliations, nothing about the schema forces exclusivity). A single Person can hold Memberships in multiple institutions simultaneously, each fully isolated from the others per the Tenant Architecture — nothing about one Membership is visible from another, even to the person themselves unless they explicitly switch context.

## Capability stays tenant-scoped, deliberately

A qualification often feels portable in the real world — a medical license, a certification. RDIOS does not attempt to model portable, verifiable, cross-institution credentials in v1. Capability remains scoped to one institution's Membership: "this institution currently recognizes this person as able to do X." A future cross-tenant credential-verification feature is a real, named extension point (Foundation §9) — not something to design speculatively now, per the same discipline that's kept this entire engagement from building ahead of a real need.

## Offboarding generalizes directly

RDE's Atomic Offboarding Architecture — the per-concept classification (Close/Preserve/Archive/Transfer/Reassign/Delete/Leave-Untouched) applied to every touchpoint a person has in the system — carries forward as the correct *shape* of the operation, now applied per-Membership instead of per-account, and driven by whichever Position/Affiliation types that Membership actually held rather than RD's specific list. Ending a Membership atomically closes its Positions and Affiliations, following the same fallback-holder and no-orphaned-decision guarantees RDE already live-verified. This is a direct generalization, not new design — the policy was already proven correct; only its scope becomes per-tenant and its vocabulary becomes configurable.

## What this settles, concretely, for implementation later

- `people` (global) / `institution_memberships` (per-tenant anchor) / `positions` + `position_holders` (authority, append-only) / `affiliations` + `person_affiliations` (relationship, append-only) / `capabilities` + `person_capabilities` (qualification, mutable, not append-only) — five real tables plus the global Person, not a collapsed or reduced model.
- Position and Affiliation *types* are Institution Configuration, not code.
- Customers' contacts are a separate application's data by default; they only enter the People Domain when real system access is required.
- Capability stays single-institution scope for v1; cross-tenant credentials are a named future extension, not a current gap.

## What remains open

- The exact UI difference (if any) between "inviting a teammate" and "inviting an external contact who needs limited portal access" — both end up as a Membership + Affiliation, but the *experience* of creating each should probably not look identical. Worth resolving once the People application's screens are actually being designed, not here.
- Whether a Membership needs its own lightweight status (invited / active / suspended / ended) independent of whatever Positions or Affiliations it holds — likely yes, mirroring RDE's proven invited/active team-member states, but not fully specified in this pass.
