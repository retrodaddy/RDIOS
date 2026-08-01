Status: 🟠 Reality Validation — adversarial simulation, not a design document, not a walkthrough, not a success story. The Constitution v1, the Platform Excellence Framework, and the Extension Development Standard are all treated as frozen. This document assumes a fully, honestly implemented ARUMBU, so any failure found below is a failure of the design, never a known prototype limitation already documented elsewhere. The objective throughout is to make the architecture fail, not to demonstrate that it works.

# ARUMBU Reality Validation — School v1

## 1. Executive Summary

**Greenfield Higher Secondary School**, roughly 2,000 students and 150 staff across three buildings, a transport fleet, a library, science labs, and a sports complex, was run through one full academic year on ARUMBU — admissions, a mid-year teacher resignation, board examinations, a fire drill, a disciplinary case involving two students' worth of guardians with genuinely different visibility rights, a government inspection, and an unexpected weather closure. Eleven candidate architectural failures were identified and investigated under this document's own rejection-first discipline. Ten were disproven. **One survived** — a genuinely new kind of finding, distinct in character from either prior Reality Validation: a real mismatch between Governance's institution-wide Area-of-Responsibility grants and a specific, safety-and-legally-critical need for restriction that varies **per relationship instance**, not per role. It does not require a constitutional amendment. Two already-known, previously-documented gaps (Notifications, and Project nesting) recurred under real operational pressure and are named honestly, but not counted as new. **Verdict: Architecture Held with Operational Conventions.**

---

## 2. Timeline of the Academic Year

**April.** The academic year opens. Admissions (Mr. Ranjit Dutta, Vice Principal) processes 210 new entrants across grades. Each Student's own academic life is created as a Project — per the Operational Object investigation's own finding — its institution-configured stage vocabulary reading Enrolled, Active, Promoted, Graduated. Twin siblings Diya and Kabir Sen enroll together; their guardian, a single father, is registered once as a real Person with Membership and Affiliation, linked to both children's own Student Records. Timetables are finalized; Work items track room and teacher assignments across three buildings. No stop.

**May.** Mrs. Sunanda Roy's Grade 8 class runs uneventfully. The library (Ms. Farida Ahmed) processes routine circulation. A minor lab equipment fault in Chemistry is logged as a Maintenance Task against a real Asset, resolved within days. Fee collection for Term 1 opens; most guardians pay directly, three families' fees are partially covered by a corporate scholarship trust — the school's Finance domain records two separate Income transactions against the same fee obligation, one from each payer, no strain on the shared transaction spine.

**June.** A school trip to a science museum is organized — Work items for permission slips, transport booking, and staff chaperoning, cleanly composed. Mr. Vivek Chandran, a senior Physics teacher, resigns mid-term for a job abroad, effective July 31st. Governance's Transfer discipline handles his own Approval-chain-adjacent duties (exam paper review sign-off) cleanly — the seat vacates, Escalation widens correctly.

**July.** Timetables are reworked around Vivek's departure; HR (Ms. Ayesha Siddiqui) begins recruitment. A transport breakdown strands one bus route for forty minutes — real-time parent notification and a replacement vehicle are coordinated. **Tested directly against the Institutional Presence investigation's own already-named exception — school transport is precisely the "narrow, explicitly-opted-into" safety case that document anticipated for GPS-based Presence. Confirmed, not newly discovered.**

**August.** Mid-term examinations approach. Question papers for the Term 1 exams are drafted and stored as Documents, restricted to the Exam Committee. **The first genuine test of this document, investigated in full below — resolved, but only by reaching for a mechanism this Constitution designed for a different purpose entirely, worth naming precisely.** A parent complaint arrives about a grading discrepancy; resolved through an ordinary Comment thread on the relevant Student Record, promoted to a Decision once the regrade is confirmed.

**September.** A disciplinary matter opens: Rohan Malhotra, Grade 9, is accused of bullying a younger student. Counseling and disciplinary Work items are created, gated to the Principal, the Counselor, and the School Committee. Both families' guardians need to be informed, but with meaningfully different visibility — the accused student's guardians should not see the complainant's own counseling notes, and vice versa. **No stop yet; this thread continues into November.**

**October.** Diwali holidays shift the academic calendar by three days school-wide — an ordinary Institution Configuration and Calendar-aggregation change, absorbed without incident. Annual Day rehearsals run for two weeks, generating a genuine flood of small, simultaneous Work items across nearly every Department. **Tested against Attention's own composition discipline under real volume — survives, and directly confirms the value of the Flow-level composition refinement already named in the Excellence Framework, not a new finding.**

**November — the second genuine test.** Aarav Kapoor, Grade 5, is the subject of a formal, court-documented custody arrangement: his mother holds full guardianship and platform access; his father is legally restricted from receiving academic or counseling records, though he retains the right to see general fee and attendance status. **Investigated in full below — this is the finding that survives.**

**December.** Board examination registrations are submitted to the state Education Board through a Government Connector, in the Board's own rigid, externally-mandated data format, against a hard deadline. **Tested and resolved cleanly, no stop.** Sports Day runs, similarly volume-heavy to Annual Day, with the identical outcome.

**January.** A fire drill runs on schedule. A student medical emergency — an asthma attack during PE — is handled by the school nurse, logged, parents notified within minutes; no architectural strain. An unexpected two-day closure is declared for a regional weather emergency, communicated school-wide. **Tested in full below — a genuine, already-known gap recurs, named but not newly counted.**

**February.** A lost-certificate request arrives from an alumna who graduated eleven years earlier and needs a transcript for a visa application. **Tested and resolved cleanly, no stop.** The state Education Department's annual inspection (Inspector Nusrat Jahan) reviews staff qualifications against current teaching assignments — resolved cleanly by Search and Reports, exactly as the Hospital's own accreditation audit already proved out.

**March.** Board examination results return; student progression runs school-wide — most students promoted, a handful repeating a grade. Year-end Reports generate. Finance reconciles. The year closes.

---

## 3. Every Suspected Architectural Failure

1. Question paper confidentiality — visibility that must change automatically, from very narrow to broad, at a precise scheduled moment.
2. **Differentiated guardian visibility — a legally restricted parent, same Student, different access rights than the other guardian.**
3. Sibling students sharing one guardian household — should there be a "family" grouping above individual Student Records?
4. School transport real-time coordination during a breakdown.
5. Annual Day / Sports Day volume — hundreds of simultaneous small Work items across the institution.
6. Board examination data submitted in a rigid, externally-mandated government format.
7. School-wide, institution-wide announcements (a holiday shift, an emergency closure) — do they have an honest home anywhere on the platform?
8. Split fee billing across a guardian and a scholarship trust for the same obligation.
9. A former student's decades-later certificate request, long after their own Membership went inactive.
10. Multi-year student progression and the Academic Career → Academic Year → Term hierarchy.
11. Fraud risk in a duplicate-certificate request from someone claiming to be a former student.

---

## 4. Investigation of Each

**1. Question paper confidentiality.** Tested against Documents' own subject-type permission model — is it capable of a *scheduled, automatic* Area-requirement change (narrow before the exam, broad after)? Tested directly against Enterprise Foundation §3.3 and §10.9 — the identical scheduled-transition infrastructure already designed for Delegation and Escalation expiry generalizes cleanly to a Document's own required Area changing at a declared future time. Pushed further — is there a residual gap around physical-room enforcement ("visible only to invigilators physically present")? No: that is a real-world physical-control question outside any software's legitimate remit, correctly left there. **Resolved by existing architecture — a real, if unglamorous, reuse of a mechanism designed for a different purpose entirely, worth naming precisely rather than assuming a new one was needed.**

**2. Differentiated guardian visibility.** Tested against Governance's own Area-of-Responsibility model directly. Governance's Areas are institution-wide grants — once a Membership holds "Guardian," Governance's own resolver has no native concept of holding that Area *differently* for one specific Student than for another, or of one specific relationship instance carrying a restriction the Area itself doesn't express. Tested whether the Universal Record Model's own generic relationship mechanism (already accepted, Q4) resolves this on its own — the *data* is expressible (a relationship record between Guardian and Student can carry a restriction flag), but nothing in Authority's resolution logic, anywhere in this Constitution, was ever asked to consult relationship-instance data as an additional filter beneath its own coarse Area-based gate. Tested against the two-layer read discipline the Audit Engine already uses for History (subject-level respect plus an oversight grant) — that model answers "do you hold this Area generally," not "does this specific instance of the relationship that grants you standing carry an exception." **This survives without a new mechanism, but not by assertion — it requires a precise, previously-unnamed convention:** every application whose domain includes relationship-scoped access (Guardian-to-Student being the clearest instance, but not unique to schools) must filter at the application layer, beneath Authority's own gate, against the specific relationship record's own restriction data — exactly the same "provider-level filtering beyond the Authority gate" pattern Search already uses, simply never before named as a general rule anything else must also follow. **Classified: Operational Convention.**

**3. Sibling family grouping.** Tested against Constitutional Clarifications' own "Organization Contact kind" ruling — a household is structurally identical to an external organization: several individual Contacts (or, here, several Student Records) belonging to one recognizable unit. Applying the identical, already-accepted pattern resolves this cleanly. **Resolved by existing architecture.**

**4. Transport real-time coordination.** Tested directly against the Institutional Presence investigation's own explicit exception clause — GPS-based Presence, never a default, named there as legitimate specifically for "a lone field worker's own safety-check system." A school bus mid-route is the identical shape of case. **Resolved by existing architecture, confirmed by direct citation, not a new finding.**

**5. Annual Day / Sports Day volume.** Tested against Attention's own per-item tiering discipline under real load — every item is still individually judged against "real, present, true, tied to a decision," regardless of how many exist simultaneously; volume alone never breaks the test. The Flow-level composition refinement already named in the Platform Excellence Framework (composing several facts sharing one Project into one card) directly reduces the *felt* noise, confirming that recommendation's value under genuine pressure rather than discovering anything new. **Resolved by existing architecture.**

**6. Board examination government submission.** Tested against the Integration & Automation Framework's own Government Connector pattern and the Structure Engine's own custom-field capability for externally-mandated form shapes (both already named in the Architecture Phase 2 document). Tested further — does the submitted data need its own frozen, permanently referenceable record once submitted? Reports' own frozen-at-generation-time snapshot mechanism, M11, is precisely this shape, reused rather than reinvented. **Resolved by existing architecture.**

**7. Institution-wide announcements.** Tested against Attention (Be Aware assumes per-person relevance, not blanket broadcast — a genuine category mismatch if forced), Comments (not attached to any one Record, a poor fit), and History (not really an audit-worthy fact about a specific Record's own Timeline). None of the three is an honest home. Tested against Product Foundation's own §5 — Notifications is named there, explicitly, as a real, expected Operating System Layer citizen distinct from Attention, and the ARUMBU Constitution Ratification Review v1 already found, independently, that "Notifications is named as real, expected infrastructure in at least three frozen documents and has zero design document of its own." **This is real, and a school-wide holiday announcement makes it concretely felt — but it is not a new discovery. It is the identical, already-documented gap, re-confirmed under real operational pressure. Not counted as a new finding.**

**8. Split fee billing.** Tested against Finance's shared transaction spine — nothing prevents two separate Income transactions, from two different Community Contacts, referencing the same underlying fee obligation. **Resolved by existing architecture.**

**9. Decades-later alumna certificate request.** Tested against the People Domain Review's own Atomic Offboarding classification — Documents and History are explicitly "Preserved, permanently, untouched." Tested whether the alumna herself needs to authenticate into a long-dormant identity — she doesn't; a current staff member, holding real current Authority, retrieves and reissues the record as an ordinary Work item, the alumna never needing to be an ARUMBU actor at all. **Resolved by existing architecture.**

**10. Multi-year student progression and nesting.** Tested explicitly against the Operational Flow investigation's own already-confirmed nesting gap (Construction, Agriculture, and Power Plant were the first three confirmations). A Student's Academic Career containing yearly Academic-Year sub-coordination, in turn containing Terms, is structurally the identical shape — real, and a fourth independent confirmation. **Not a new discovery — already tracked as implementation backlog (Project's own `parentProjectId` extension) by that document; strengthened, not newly found, by recurring here.**

**11. Duplicate-certificate fraud risk.** Tested against whether ARUMBU has, or should have, any built-in real-world identity-verification mechanism for a non-platform actor claiming a past identity. It correctly does not, and should not — verifying that a person requesting a reissue is who they claim to be is a real-world administrative act (ID proof, notarization) the institution performs before ever touching the platform; ARUMBU's own job begins at gating who *within* the institution may act on an already-verified request, which Governance already does completely. **Resolved by existing architecture — correctly out of software's remit, not a gap.**

---

## 5. Findings That Survived Investigation

- **Finding A — Differentiated, per-relationship-instance guardian visibility.** Real, narrow, and genuinely novel in shape: not a missing Record type (Garment Manufacturing's own finding), not a missing Approval-timing state (the Hospital's own Finding A), but a real granularity mismatch between Governance's institution-wide Area grants and a legitimate need for restriction that varies by *which specific relationship instance* grants standing. Classified: **Operational Convention** — every relationship-scoped access decision must filter beneath Authority's own gate, using the relationship record's own data, a rule this Constitution's own architecture already supports but had never explicitly named.

---

## 6. Findings Rejected

Question paper confidentiality (resolved by reusing Enterprise Foundation's own scheduled-transition mechanism); sibling family grouping (resolved by the already-accepted Organization Contact kind pattern); transport real-time coordination (resolved by Institutional Presence's own already-named exception); Annual Day/Sports Day volume (resolved by Attention's own per-item discipline, confirming rather than discovering the Flow-rollup recommendation's value); board examination submission (resolved by the Government Connector and Reports' frozen-snapshot pattern); split fee billing (resolved by Finance's own shared spine); the decades-later alumna request and the duplicate-certificate fraud question (both resolved by recognizing where software's legitimate remit correctly ends). Institution-wide announcements and multi-year student nesting were both investigated fully and found real — but neither is new; both are already-documented, already-tracked gaps this simulation independently rediscovered under real pressure, named honestly and excluded from the final count specifically so they are not double-counted as fresh findings.

---

## 7. Constitution Status

Intact. The one surviving finding required touching nothing frozen — Governance's own Area-resolution logic remains exactly correct for what it was built to answer; what was missing was a single, previously-unnamed rule about where an application's own responsibility begins once Authority's coarse gate has already been passed.

---

## 8. Constitutional Amendments Required

**Zero.**

---

## 9. Implementation Improvements Identified

**One**, directly: a documented, mandatory convention that any domain with relationship-scoped access (Guardian-to-Student, and by direct extension any future domain with an analogous shape — a Hospital's own next-of-kin visibility, a Trust's own beneficiary-family access) filters at the application layer against the specific relationship record's own restriction data, beneath Authority's own gate, every time, without exception. Two already-known gaps (Notifications; Project nesting) were re-confirmed under genuine operational pressure but are not newly counted here, since counting them again would overstate what this specific investigation discovered.

---

## 10. Final Verdict

**Architecture Held with Operational Conventions.**

Eleven candidate failures were pursued through a full academic year — a resignation mid-term, a genuinely fraught custody-restricted disciplinary case, a government inspection, a weather emergency, and the sheer operational volume of two schoolwide events. Ten did not survive investigation, several resolved only by reaching for a mechanism this Constitution built for an entirely different original purpose — proof the architecture's reusability runs deeper than its own worked examples ever explicitly anticipated. One did survive, and it is the first finding in this three-institution series that isn't about a missing Record, a missing status value, or a missing cross-reference — it is about the precise boundary between what Governance's own Authority model was built to answer and what an application must still, honestly, answer for itself. Naming that boundary once, here, is exactly the kind of finding this entire Reality Validation exercise exists to produce.
