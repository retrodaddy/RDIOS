Status: 🟢 Complete — implementation only, no constitutional documents, no architecture review, no philosophy. Built exactly within the frozen architecture, following the identical discipline every prior application (People, Work, Finance, Community, Projects) already established.

---

## What this milestone was

The founder's own framing: Documents is ARUMBU's institutional memory — not cloud storage, not a file manager, not Dropbox. A Document represents institutional knowledge; a file is only one possible attachment to that knowledge, never the thing itself. Every design decision was tested against the founder's own question — would this still make sense if the institution only had five extremely important documents? — and simplified until the answer was yes. No file explorer was built.

## Core Model, as built

`applications/documents/types.ts` — a `Document` carries exactly what the brief named: Title, Type, Description, Status, Owner, Created By, Created Date, Modified Date, Document Number (optional), plus Attachments, Versions, and Relationships. Tags were explicitly named "future" in the brief and are not built.

- **`type` is free text with the brief's own 22-item list as datalist suggestions** — Policy, Meeting Minutes, Purchase Order, Invoice, Contract, Blueprint, Legal Notice, Certificate, Drawing, Manual, Photograph, Video, Audio, Research, Report, Presentation, Spreadsheet, Letter, Memo, Standard Operating Procedure, Checklist, Training Material — not a hardcoded enum. This is the same reasoning Project's `stage`, Expense's `category`, and Relationship's `type` already established: a fixed list here would be exactly the kind of assumption the platform's own prior domain reviews have repeatedly rejected.
- **Attachments are mocked exactly like every prior milestone's `DocumentRef`** — a filename and a kind (PDF/Image/Video/Audio/Spreadsheet/Presentation/Text/CAD/Other) a person records, not a real upload. No storage provider was built, per the brief's own explicit instruction.
- **Status and Approval Status are two separate fields**, the same separation Finance's `status`/`payment_status`/`approvalStatus` design already established for a different reason: a Document's existence (draft/active/archived) is a different concern from whether anyone needs to decide it (none/pending/approved/rejected).

One new Area of Responsibility, `documents.manage`, gates every mutation — the sixth independent confirmation that Governance & Responsibility Model v1's growth model (§11) needs zero new mechanism per application, only a new catalog entry.

## Versioning — deliberately simple, exactly as asked

`Document.versions` is a strictly append-only array. The brief's own words — "No Git. No branching. No merge conflicts" — were taken literally: there is no separate "current version" pointer that can move independently of the array; the last entry is always current. **Restoring an old version never rewrites or deletes anything** — it appends a fresh version carrying that old version's attachment and notes, and records which version it was restored from (`restoredFromVersionNumber`), so both the version list and the Timeline can say "restored from version 1" honestly instead of looking like an ordinary new edit.

This was live-verified end to end: Version 1 created at document creation, Version 2 added with a new attachment and notes, then Version 1 restored — producing a new Version 3, current, correctly labeled "Restored from version 1," with Versions 1 and 2 both still present and still individually restorable. Nothing was destroyed at any step.

## Relationships — real references, reusing the Universal Record Model

A Document may reference a Person, Project, Money (Finance Transaction), Community (Contact), Work (Work Item), or Asset — the brief's own list minus Policies, which is itself future work not yet built anywhere on the platform. This reuses the Universal Record Model's own polymorphic `subjectType`/`subjectId` shape unchanged, and is **one-directional**: the Document names what it relates to; the referenced record carries no matching field pointing back. This was a deliberate choice to build the feature with zero changes to any other application's schema — Person, Project, Transaction, Contact, WorkItem, and Asset were none of them touched to make this work, honoring "Do not reopen previous milestones" to the letter.

The UI is one generic type+item picker (choose a relationship type, choose an existing record of that type, Link) rather than six separate bespoke widgets — live-verified by linking the document to a Person and confirming it appeared immediately, correctly labeled, with History narrating "linked ... to Retro Rodad."

**Related Records**, per the brief's explicit "reuse the existing Related Records section, no redesign," stays the exact calm, one-sentence, non-interactive placeholder every prior milestone's pattern already established — naming what isn't real yet (Policies, Search), never redesigned into something more interactive.

## A minimal, real approval workflow

The brief's own Attention example, "Document awaiting approval," requires a decidable state to exist — so a small `approvalStatus` field (none/pending/approved/rejected) was added, defaulting to `none` for the overwhelming majority of documents that need nobody's decision (a Photograph, a Manual). `submitDocumentForApprovalAction` and `decideDocumentApprovalAction` reuse the exact same-actor exclusion (Governance & Responsibility Model v1 §6) every other Approval-shaped decision on the platform already enforces — live-verified: submitting the Fire Safety Certificate for approval and then attempting to approve it as its own creator was correctly blocked with "You created this document — you can't also decide its approval," the identical wording pattern Work's Approval and Finance's Expense already use.

This is deliberately not a full Approval Chain (Work's own multi-step, Area-in-sequence mechanism) — one Area (`documents.manage`) decides, full stop. Named honestly in the Technical Debt Register as a real, bounded simplification, not something this milestone was asked to build in full.

## Attention — two real signals, one honestly deferred

- **Awaiting approval** — a document deliberately submitted, surfaced to holders of `documents.manage`, same-actor excluded. Live-verified: correctly appeared in Be Aware's "1 awaiting approval," and correctly did *not* appear in the document's own creator's Act Now — the same same-actor discipline extended from the decision itself into what Attention even bothers to surface, a detail worth naming since it would have been easy to surface the nudge to everyone including the one person who can't act on it.
- **Expiring / expired** — a single honest `expiresAt` field doubles as both the brief's "expired certificate" and "contract expiring" examples, since both are the same underlying fact (this stops being valid on a date) read two ways depending on the document's `type`. Live-verified: a Certificate with an expiry 11 days out correctly showed "Expires in 11 days" on Home's Act Now.
- **"Mandatory document missing"**, the brief's third named example, was **not built**. It requires an institution-configured "required documents" concept — nothing in the platform today lets an institution declare "every active employee needs a signed Contract on file" — and inventing that concept here, even in a small way, would have been new architecture, which this milestone was explicitly told not to introduce. Named honestly rather than faked with a hardcoded guess.

## Verification performed

1. **Typecheck** — `npx tsc --noEmit`: clean, exit 0.
2. **Lint** — `npx next lint`: clean, no warnings.
3. **Production build** — clean `.next`, `npx next build`: compiled successfully, all 17 routes generated, `/documents` at 5.46 kB.
4. **Founder walkthrough** — a School institution (Sri Meenakshi School): created a Certificate with a real expiry date, owner, document number, and first version; linked it to a Person; submitted it for approval and confirmed same-actor exclusion blocked its own approval; added a second version with notes; restored version 1, producing a correctly-labeled version 3; confirmed every step narrated correctly on the Timeline in order.
5. **Cross-institution** — the walkthrough itself ran on a School (not the Company/Temple/NGO combination prior milestones favored), confirming the nav correctly read "Students" instead of "Customers" and that Documents carried no institution-type-specific logic that broke under a type not previously exercised this deep into the platform's life.
6. **Mobile walkthrough** — confirmed no horizontal overflow on `/documents` at 375px width both with the list showing and with the detail drawer open (all sections — Identity, Approval, Versions, Relationships, Related records, Timeline — rendered without clipping).
7. **Regression** — Home, Work, Projects, and Money all confirmed rendering correctly with Documents' new Attention/Be Aware contributions present; zero console errors across the walkthrough.

## Honest assessment — where this fell short of the full ask

- **Multi-user walkthrough was not performed.** Only one real person (the founder) was available in the test institution. The same-actor exclusion was verified live — the founder correctly could not approve their own submission — but a *second* person correctly being able to decide it was not confirmed live this milestone, only inferred from the identical, already-proven pattern in Work and Finance.
- **The relationship-candidate lists (Projects, Money, Community, Work, Assets) were all empty in this milestone's own walkthrough institution**, since it was a fresh School with nothing else built yet. Only the Person relationship type was exercised live; the other five reuse the exact same code path (the generic `LinkedGroup`-equivalent picker), so this is inference from a shared, already-tested mechanism, not five independently confirmed live tests.
- Two dev-server hiccups during this milestone's own live verification (a create-drawer click and a version-add click both silently failed to register on the first attempt, before succeeding after a hard reload) were traced to the same Fast Refresh/HMR staleness class of issue Sprint 3 and M9 both hit — not a real product bug, confirmed by the fact that a fresh page load made every subsequent interaction work correctly. Worth naming since it is now the third milestone in a row this exact class of dev-environment flakiness has shown up during live verification; if it recurs on M11, it may be worth a real investigation rather than continuing to route around it.

None of the above blocks anything. ARUMBU now has a real institutional memory sitting correctly beside People, Work, Finance, Community, and Projects — reusing every existing mechanism (Timeline, Related Records, Authority, the Universal Record Model's reference shape) without inventing a single new one.
