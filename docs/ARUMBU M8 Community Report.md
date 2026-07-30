Status: 🟢 M8 Complete — Community implemented exactly per the accepted Community Domain Review v1 and its Reconsideration v1, live and verified
Scope: Contacts (Individual/Organization) · Relationships (Receiving/Supporting/Supplying) · Attention · History (with a real Timeline) · Authority

---

## 1. What this is

Not CRM software, not Procurement, not marketing — the institutional relationship engine the Community Domain Review defined: Contact + Relationship, the external counterpart to People's Person + Membership. Built as the fourth Application Layer module (`applications/community/`), following the exact types → provider → mock-provider → actions → UI discipline People, Work, and Finance already established. No new architecture pattern was introduced anywhere in this build.

This milestone also closes the loop on two design documents that preceded it: the Platform Cohesion Review's finding that History records creation far more reliably than ending, and the Community Domain Reconsideration's six-month-test conclusion that a Contact's detail view should read as its own filtered History rather than a static fact sheet. Both are real, live, and verified below — not just referenced.

## 2. What was implemented

### Contacts — two first-class kinds, never collapsed
`Contact.kind: "individual" | "organization"`, exactly per the Reconsideration's own correction of v1. An Organization contact carries an embedded, lightweight list of points of contact (name, role, email, phone) — never a separate linked Record, per the Reconsideration's explicit scoping note that the substance of the relationship belongs to the organization, not to whichever person currently answers the phone. Basic information, contact details (email/phone), addresses (a repeatable list), and notes are all real fields on every Contact regardless of kind.

### Relationships — the three accepted Directions, nothing else
`Direction: "receiving" | "supporting" | "supplying"` — a closed, universal enum, exactly per the Community Domain Reconsideration's own evidence-tested rejection of a fourth "Partner" direction. Relationship `Type` is free text with datalist suggestions (Customer/Patient/Student/Devotee/Beneficiary/Congregation Member for Receiving; Donor/Volunteer for Supporting; Vendor/Supplier/Contractor for Supplying) — never a hardcoded enum, the same institution-neutrality discipline Finance's `Expense.category` already established. A single Contact may hold more than one concurrent Relationship, confirmed live. Every Relationship carries `lastActivityAt` — a real, honest timestamp updated on creation and on genuine edits, the deliberate, non-artificial basis for the one Attention nudge that needs a notion of staleness; never a manufactured "relationship health score," which the Reconsideration explicitly rejected.

### Contact profile
Every field the founder listed is real: basic information, contact details, addresses, notes, Relationship Type and Direction (shown per relationship, since a Contact may hold several), Status, a Documents section reusing Finance's exact `DocumentRef` placeholder pattern, a Related Records placeholder (a single calm sentence — Finance, Work, and Projects will be able to point here once they exist to point from), and a real Timeline (§6 below). Kept calm and compact throughout — one detail drawer, no tabs, since Contact is the one entity this domain has (Relationships live embedded on it, the same way Position/Affiliation/Capability attach to a Membership).

### Institution-aware terminology
No institution-type branch exists anywhere in Community's code. The nav destination (`/customers`) already resolves its label per institution type through the existing `os/institution/terminology.ts` mechanism — confirmed live showing "Customers" for a company and "Community" for a temple, unchanged code, exactly as the platform already worked before this milestone touched it. Relationship Type suggestions (Devotee, Vendor, Donor, and so on) are offered as datalist options, never enforced — an institution can type anything.

## 3. New Areas of Responsibility

One new key, the minimum genuinely required, matching the founder's explicit instruction:

| Key | Label | What it governs |
|---|---|---|
| `community.manage` | Manage community relationships | Add and update contacts, add and end relationships, attach document references |

No approval-type Area was added — recording that a relationship exists is institutional memory, not a decision needing sign-off, the same reasoning that already gives Finance's Income no approval workflow. Confirmed live in `PositionSidePanel`'s responsibility list with zero code changes needed there — the fourth application in a row to prove Governance §11's growth model (Work added one key, Finance added three, Community adds one, and the UI never needed to know).

## 4. Attention contributions

Two real, non-artificial signals — the same restraint Finance's M7 build proved out, not a checklist of every example the brief offered:

- **No way to reach this contact** — an active-relationship Contact with no email, no phone, and (for an Organization) no points of contact at all. Verb: Add. Confirmed live, and confirmed to clear the moment a point of contact was added — no lingering false positive.
- **Relationship gone quiet** — an active Relationship whose `lastActivityAt` is 180+ days old. Verb: Review. Deliberately not a repeating nag with nothing to clear it: any genuine edit to the relationship resets the timestamp.

A Be Aware line ("Community — N contacts, X receiving / Y supporting / Z supplying") mirrors Finance's Money/Assets lines exactly.

## 5. History

Every meaningful action writes History, with create and end given equal weight — the explicit fix the Community Domain Reconsideration promised and the Platform Cohesion Review's own finding made necessary: Create, Edit, Relationship-added, Relationship-ended, and Archive are all recorded. Verified live: editing Bluepeak Office Supplies's details produced "Jordan Lee updated Bluepeak Office Supplies's details" in History immediately, closing exactly the creation/ending asymmetry the Cohesion Review found in every other application.

## 6. A real Timeline — the first one on the platform

`os/attention/types.ts`'s `HistoryEntry` gained an optional `subjectType`/`subjectId` pair, and `os/attention/history-store.ts` gained `listHistoryForSubject` — additive, backward-compatible, zero existing call sites touched. This is not a new mechanism; it is the first real realization of the Audit Engine Design's own frozen `subject_type`/`subject_id` shape, already used by Events, Documents, and Audit in the constitutional documents but never before implemented in this codebase. A Contact's detail drawer fetches its own filtered slice of History and renders it as a genuine narrated Timeline — exactly the Community Domain Reconsideration's six-month-test answer, built rather than merely designed.

People, Work, and Finance's existing `recordHistory()` call sites were deliberately left untouched — retrofitting three other applications' history was out of this milestone's scope. Named honestly in the Technical Debt Register: only Contacts have a real Timeline today, though the mechanism now exists for every application to adopt the same way.

## 7. Universal Record discipline

No `BaseRecord`, no inheritance, no shared table — exactly as instructed. `Contact` follows the discipline the Universal Record Model named without ever depending on a literal shared implementation: real Identity (`id`, institution-scoped), a real "now" (`status`, `relationships[].status`), real Provenance (`createdByPersonId`, `createdAt`), and automatic eligibility for every universal door — History (§6), Attention (§4), Documents (the `DocumentRef` pattern), and Permissions (resolved through Governance's existing Areas, never a parallel mechanism). Nothing new was built to make this true; Contact simply followed the same shape every other Record on the platform already does.

## 8. Tamizhi

Not implemented, per explicit instruction. The only Tamizhi-relevant surface this milestone touches is the one the Community Domain Reconsideration already named: Organization vs. Individual is a third case for the existing "never merge Contacts automatically" principle — no new rule was written, because none was needed.

## 9. UI

Built entirely on shared primitives — `Button`, `Badge`, `DataTable`, `EmptyState`, `Toast` — the same set Money and Work already use. No new primitive was hand-built. The one real, honestly-named exception: no shared `Input`/`Select`/`Textarea` exists anywhere on the platform yet (named in the Platform Cohesion Review before this milestone began), so `CommunityBoard.tsx` hand-rolls its own field styling exactly the way `MoneyBoard.tsx` and `WorkBoard.tsx` already do — a fourth file added to a debt pattern this milestone did not resolve, because resolving it was out of scope, not because it wasn't noticed.

## 10. Verification performed

1. **Typecheck** — `npx tsc --noEmit`: clean, exit 0.
2. **Lint** — `npx next lint`: two unescaped-apostrophe errors found and fixed; clean on the second pass.
3. **Production build** — clean `.next`, `npx next build`: compiled successfully, all 17 routes generated, `/customers` at 4.87 kB / 94.6 kB First Load JS.
4. **Live walkthrough — Company** ("Aurora Technologies"): created an Individual Receiving-direction contact and an Organization Supplying-direction contact with no contact details; confirmed the "no way to reach" nudge appeared correctly in Act Now; edited the Organization to add a point of contact and confirmed the nudge cleared and the edit was recorded to History; ended a Relationship and confirmed it; confirmed `community.manage` appears correctly in the Position responsibility panel with zero code changes needed.
5. **Live walkthrough — Temple**: nav confirmed showing "Community" (not "Customers"); a Supporting-direction Donor contact created with a phone number; confirmed no false-positive Attention nudge; confirmed Be Aware's Community line and History narration both correct.
6. **Live walkthrough — NGO**: confirmed the empty state renders correctly with institution-neutral copy.
7. **Console check** — zero console errors across all three institutions.
8. **Regression** — `/work` and `/money` confirmed rendering correctly, unaffected by this milestone's changes (both additive-only to shared files).
9. **Mobile** — confirmed the Community page and its interactive elements render correctly at 375px width; the Shell's mobile navigation itself is unchanged code, already verified in prior milestones.

## 11. Regression testing

- `os/attention/history-store.ts` and `os/attention/types.ts` changes are additive (`subjectType`/`subjectId` optional on every call) — confirmed every existing History entry across People, Work, and Finance still renders correctly with no subject reference.
- `engines/authority/types.ts`'s new `community.manage` key required no changes to `PositionSidePanel.tsx`, which already iterates the `PERMISSIONS` catalog generically — the same zero-UI-change proof Work and Finance already established, now confirmed a third time.
- Work and Money both confirmed rendering correctly with zero console errors after this milestone's changes.

## 12. Honest assessment of Community readiness

This is a real, working vertical slice, not a form collection wearing a CRM's clothes. A vendor genuinely can't hide behind a name with no way to reach it without Home noticing; an Organization is genuinely a first-class thing, not a person standing in for one; a Contact's own page genuinely tells its own story instead of showing a static form. It composes with Authority (one real Area, zero new mechanism), Attention (two honest signals, no manufactured ones), and History (a real Timeline, the first on the platform) exactly the way the constitutional documents specified.

What it is not yet: connected to anything else. Finance's `payee`/`payer` fields, Work's task descriptions, and Projects (unbuilt) all still have no real link to a Contact — the Related Records section is a placeholder sentence, honestly labeled as one. There is no real Type catalog (Relationship Type is free text with suggestions, not institution-configured data), no shared form-input primitive, and no History coverage for People/Work/Finance's own actions even though the mechanism now exists for them. Every one of these is named, not hidden, and every one has a clear seam already built to close it later — none of them require reopening anything this milestone touched.

M8 is ready to build on. It is not yet the connective tissue between applications the Community Domain Review ultimately imagines — that composition is real future work, correctly deferred rather than rushed.
