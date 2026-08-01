Status: 🔵 Engineering handbook — design only, no code, no roadmap change, no constitutional amendment. The ARUMBU Constitution v1, the Design System & Interaction Standards v1, the Enterprise Foundation v1, and the Integration & Automation Framework v1 are all treated as permanently frozen or already-designed throughout. This document introduces nothing new to any of them — it exists to teach a team that has never seen this codebase how to build against what already exists so precisely that the result is indistinguishable from work the original team would have shipped.

# ARUMBU Extension Development Standard v1

## What "ARUMBU-native" means, in one sentence, before anything else

An application is ARUMBU-native when it introduces zero new mechanisms and one hundred percent new institutional content — every Record it owns, every screen it renders, and every decision it gates was built entirely out of pieces this handbook already names, arranged in a shape nobody has to be taught twice.

---

## Section 1 — Definition

**An ARUMBU Application** is an Application Layer citizen (Product Foundation §4) that answers exactly one real question about the institution, owns its own Record types, implements the Attention Contract, and follows the four-file discipline (§3). It never makes institution-agnostic decisions on behalf of another application, and it never reads another application's storage directly.

**Differentiated precisely, never redefined:**

- **A Shared Engine** (Authority, Search, Tamizhi — the living roster Constitutional Clarifications v1 already reconciled) makes institution-agnostic decisions, rankings, or advisory judgments independent of any one domain's content. An Application never becomes an Engine by growing more important; it fails the Shared Engine bar by definition, the same test every candidate in this entire series has been checked against and almost always failed.
- **An Extension** (Product Foundation §9) is an Application built outside ARUMBU's own core team, entering through the identical doors any core Application already uses — the Attention Contract, a Navigation manifest entry, the Search provider interface, the Shared Engine Layer as a consumer, its own tenant-scoped tables. Architecturally, an Extension and a core Application are the same thing; only who built it differs.
- **Infrastructure** (Enterprise Foundation) is what makes an Application durable, secure, and observable — persistence, authentication, secrets, deployment. It never owns institutional truth and is never where a Record lives conceptually.
- **A Connector** (Integration & Automation Framework) is a bounded translation layer between a Record's own truth and an external system's protocol. It owns nothing, decides nothing, and is never where an application's own logic lives.

**This document is exclusively about the first two.**

---

## Section 2 — Application Checklist

Every new application answers these questions, and only these questions, before a line of implementation begins:

1. **What Record(s) does it introduce?** Tested against the Universal Record Model's own three necessary properties — Identity, institution-scoping, a "now" that can change. Anything that fails this test isn't a Record and doesn't belong in `types.ts`.
2. **What Areas of Responsibility exist?** Registered into Governance's existing model as nouns, never verb-object pairs — "Procurement," never "purchases.approve."
3. **How does History work?** Every mutating action calls `recordHistory` with the correct `subjectType`/`subjectId`, narrated once, in the Assistant Voice, exactly as every prior application already does.
4. **How does Search work?** One adapter function, reading only this application's own provider, contributing `SearchResult`-shaped entries, filtered by Authority before ranking.
5. **How does Attention work?** The Attention Contract (`getActNow`, `getBeAware`, `getHistory`) is implemented, even if it correctly returns nothing most of the time.
6. **How does Operational Intelligence work?** A Signal Provider is registered wherever this domain has a real resource, delay, risk, or shortage worth computing — never invented ad hoc inside the application itself.
7. **How does Reports consume it?** Named explicitly — either as raw material for an existing Report category's Analytics, or confirmed as genuinely out of scope for this application.
8. **How does Timeline work?** Automatic, the moment `subjectType`/`subjectId` is correctly used in step 3 — no separate implementation.
9. **How do Related Records work?** Named, typed cross-reference fields for high-frequency connections (per the Universal Record Model's own Q4 resolution); the generic long-tail relationship mechanism for everything else.
10. **How does Terminology work?** Every noun this application introduces routes through Institution Configuration Layer lookup — never a hardcoded English word rendered directly.
11. **How does Governance apply?** Every mutating action checks `ctx.permissions.has(...)` against an Area named in step 2, with no exceptions.
12. **What should Tamizhi be allowed to observe?** Named explicitly, using only the already-permitted doors — Search, History, Attention, Authority, Reports, and now Operational Signals — never a new, bespoke access path.

**Nothing else belongs on this checklist.** A question not on this list is either already answered by something frozen, or it's the wrong question for an Application to be asking.

---

## Section 3 — Folder Structure

The identical four-file discipline every application in this platform already uses, described here as a template, not a new invention:

```
applications/<domain>/
  types.ts            # Record shapes, tested against the Universal Record Model checklist
  provider.ts          # the interface — the only contract other layers depend on
  mock-provider.ts      # a real, swappable implementation; never touched by application logic directly
  actions.ts             # "use server" functions — every mutation, every permission check, every History call

engines/search/
  index.ts               # this domain's adapter function lives here, alongside every other domain's

engines/operational-intelligence/    (once this engine exists)
  index.ts               # this domain's Signal Provider lives here

applications/reports/
  analytics.ts            # this domain's contribution to Analytics, where relevant

app/(workspace)/<domain>/
  page.tsx                 # the landing/list experience
  components/               # this domain's own UI, built from the platform's shared primitives (Design System)
```

**No new layer is ever invented.** If a new application seems to need a folder that doesn't map onto this tree, that is the signal to stop and re-run the Constitution Check (§5) before writing anything, not a signal to add a folder.

---

## Section 4 — Universal Behaviors: what's inherited, and when opting out is legitimate

| Behavior | Inherited automatically once... | May an application opt out? |
|---|---|---|
| **Search** | ...its adapter is registered (§3). | No — every Record type is Search-eligible by the Universal Record Model's own universal-doors list. |
| **History** | ...`recordHistory` is called with the right subject. | No — every Record type is a valid History subject by construction. |
| **Timeline** | ...History is correctly wired (it's the same mechanism, read filtered). | No — automatic, never separately implemented. |
| **Comments** | ...the shared Comments mechanism (Discussion & Collaboration Model) attaches via `subjectType`/`subjectId`. | No — the platform's own "one door, not application-specific" finding forbids a bespoke alternative. |
| **Related Records** | ...typed cross-reference fields or the generic relationship mechanism are used. | No — every Record is relationship-eligible; the specific relationships used vary, the capability never does. |
| **Authority** | ...Areas are registered and every action checks them. | No — never optional; this is the platform's own non-negotiable floor. |
| **Attention** | ...the Contract is implemented. | **Partially** — an application may legitimately contribute nothing to Act Now or Be Aware most or all of the time (the Universal Record Model's own Q6 finding: "not every Record contributes... real, present, true, tied to an actual decision, or it says nothing at all"), but it must still *implement* the Contract, returning empty, rather than skip implementing it. |
| **Operational Intelligence** | ...a Signal Provider is registered. | **Yes, legitimately**, if the domain genuinely has no resource, delay, risk, or shortage worth computing — a purely reference/informational application (a Knowledge Base extension of Documents, for instance) may have nothing meaningful to contribute here. |
| **Reports** | ...its data is named as raw material for a category. | **Yes, legitimately**, for the same reason as Operational Intelligence — not every domain has retrospective, institution-level value on its own. |
| **Terminology** | ...every noun routes through configuration. | No — never optional, the single most consistently-enforced rule across this entire corpus. |

---

## Section 5 — Application Lifecycle and its required gates

Directly extending the Master Roadmap's own six-step Verification Policy and seven-point Definition of Done, generalized for a team that has never seen this codebase before:

1. **Idea.** Stated in one sentence: what real institutional question does this answer?
2. **Discovery.** Checked against every application already built — does something existing already answer this question under a different name? (Every discovery investigation in this corpus exists as a worked example of exactly this discipline.)
3. **Constitution Check — the hard gate.** Walked through Section 2's own checklist in full. If anything appears to require a new Record shape the Universal Record Model's test rejects, a new Engine that fails the Shared Engine bar, or a new permission concept Governance doesn't already provide, **stop here.** Do not proceed to design on the assumption a new primitive will be approved.
4. **Design.** The Section 2 checklist, answered in full, reviewed before implementation begins.
5. **Implementation.** Follows Section 3's folder structure exactly; follows the Design System & Interaction Standards' one hundred consistency rules without exception.
6. **Verification.** Typecheck, lint, build, and a real, live walkthrough — the identical discipline every milestone in this platform's own history has been held to.
7. **Cross-domain verification — the second hard gate.** Every existing application is confirmed to still work, completely unmodified, with the new application installed. If installing the new application requires touching Home, Search, Governance, or any other application's code, the layering has failed and the new application is not ready, regardless of how well it works in isolation (Product Foundation §9's own extension test, applied literally here).
8. **Regression.** The full suite of already-shipped applications is walked through live, not merely typechecked.
9. **Documentation.** A written report, in the same honest, self-critical shape every prior milestone report in this corpus already models — what was built, how it was verified, and, explicitly, where it fell short.
10. **Release, gated by certification (§9).** Nothing ships as "ARUMBU Native" without passing that checklist first.

---

## Section 6 — Integration Rules: how applications communicate

**Never direct table access. Only providers. Only actions. Only Search. Only Attention. Only Operational Intelligence. Only Reports. Only History. Only Connectors.** Each explained precisely, not merely asserted:

- **Only providers, for reads within a domain's own boundary** — because the provider interface is the seam that lets persistence be swapped without touching a single line of business logic (Enterprise Foundation §4.1); reading storage directly welds an application to a specific implementation forever.
- **Only actions, for writes** — because `actions.ts` is the single place a permission check is guaranteed to run; any write path that bypasses it is a write path with no guaranteed Authority gate, a structural security hole.
- **Only Search, for cross-domain discovery** — because Search already resolves institution scope and Authority before ranking, exactly the safety guarantee a hand-rolled cross-domain query would have to reinvent, imperfectly, every time.
- **Only Attention, for cross-domain composition of what needs a decision** — because "RDIOS owns attention, the subsystem owns the truth" is the platform's own founding distinction; an application reaching into another application's data to compute its own notion of urgency violates that distinction directly.
- **Only Operational Intelligence, for cross-domain signals** — because a Signal's entire value is being deterministic and reproducible; a bespoke, ad hoc calculation inside one application can silently diverge from how every other application computes the identical kind of fact.
- **Only Reports, for retrospective, institution-level understanding** — because Reports' own frozen-snapshot discipline is what keeps "what did leadership see on this date" honestly answerable months later; a live query pretending to be a report loses that guarantee.
- **Only History, for what happened** — because it is the one append-only, tamper-resistant memory this platform guarantees; nothing else is allowed to claim that guarantee for itself.
- **Only Connectors, for anything outside ARUMBU** — because the Integration & Automation Framework's own discipline (Integrations own no truth) is what keeps a future institution able to swap Slack for Teams without touching a single application's own code.

**The single sentence underneath every one of these eight rules:** an application that reaches around any of these doors has taken a dependency the Product Foundation's own headless test was written to catch — and per that document's own words, "the layering has failed somewhere," regardless of how convenient the shortcut felt at the time.

---

## Section 7 — Performance Rules (expectations, not implementation)

- **Large datasets** paginate or virtualize by default — no application ships a list assumed to stay small forever.
- **Search** adapters are written to be incremental-indexing-ready from day one (Enterprise Foundation §8) — never a full-scan-per-request pattern, even in an early version, since that pattern is exactly what the platform's own architecture audit already named as its clearest, most concrete scalability defect.
- **Timeline** renders newest-first, progressively — an application's own Timeline never blocks its initial paint waiting for full history to load.
- **Tables** follow the Design System's own rules unmodified — remembered sort/filter, skeleton loading matching real row shape, no exceptions for being new.
- **Reports** contributions stay cheap to regenerate and honor the frozen-snapshot discipline — no application's own data feeds a Report in a way that makes regeneration expensive or non-deterministic.
- **Background jobs** use the shared queue infrastructure (Enterprise Foundation §10.7/§10.8) — never a bespoke scheduler built inside one application.
- **Caching** is always correctness-driven (a permission-version marker, per Enterprise Foundation §3.8), never time-based alone where correctness matters.
- **Offline behavior** follows the Design System's own rule directly — a clear, honest "you're offline" state, never a silent stale view presented as current.

---

## Section 8 — Extension Rules for the named verticals

| Vertical | Inherits automatically | Implements itself | Must never replace |
|---|---|---|---|
| **Manufacturing / Warehouse** | Authority, Attention, History, Search, Governance, Terminology, the Asset Registry, the Measurement & Resource Model's own Resource/Resource Transaction pattern | Its own Production-Order-shaped Records (a Project, per the Operational Flow investigation's own finding), its own Structure-Engine-defined custom fields (GSM, yield ratios), its own Signal Providers | Finance's own transaction spine; Authority's resolution logic; Project's own coordination role |
| **Laboratory / Pharmacy** | The same core set, plus Documents' own expiry-tracking pattern for regulated stock | Its own Resource Transactions for consumables (reagents, medicine units), its own domain-specific Custom Fields | People's own identity model (never invents a parallel "staff" concept) |
| **Fleet** | The core set, plus Institutional Presence's own Contributor pattern (on-road/at-depot) | Its own Asset entries for vehicles (discrete, per the Universal Record Model's own discrete-vs-fungible test), its own fuel Resource Transactions | The Asset Registry itself; Presence's own ownership discipline (a Fleet extension contributes signals, never declares Presence on Tamizhi's behalf) |
| **Library** | The core set, plus Documents' own relationship mechanism | Its own catalog Record type, its own lending-lifecycle Approval flow (via Work's existing Approval type) | Documents' own "a Document is not a file" model — a catalog item that is genuinely a Document should be one, not a parallel concept |
| **Legal** | The core set, plus Comments' own promotion-to-Evidence mechanism (Discussion & Collaboration Model) | Its own Case-shaped Project, its own Document types (contracts, filings) | Governance's Approval Chain — a legal sign-off is an ordinary, governed Approval, never a bespoke legal-only decision mechanism |
| **Retail POS** | The core set, plus Finance's shared transaction spine, plus Measurement's Resource pattern for SKU stock | Its own Customer-Order-shaped Project (per the Architecture Phase 2 document's own retail finding), its own point-of-sale UI | Finance's own ledger discipline; Community's own Contact model for customers |
| **Construction** | The core set, plus Project's own (future) nesting extension | Its own Site/Building/Floor/Work-Package hierarchy once nesting exists, its own material Resource Transactions | Project's own coordination mechanism itself — a Construction extension nests inside it, never rebuilds it |
| **Agriculture** | The core set, plus the same nesting and Resource machinery | Its own Season/Field-Operation hierarchy, its own yield Signal Providers | The Measurement & Resource Model's own transformation discipline |
| **Hospital EMR** | The core set, plus Institutional Presence's Contributor pattern for on-call status | Its own Patient-Case-shaped Project, its own clinical Custom Fields, its own strict Policy-governed Presence visibility (per that investigation's own privacy findings) | People's own identity model for clinicians; Governance's Areas for clinical authority |
| **Government Licensing** | The core set, plus Governance's own quorum Approval Chain worked example | Its own Citizen-File-shaped Project, its own Policy-exception tracking | Governance's Escalation mechanism; Authority's own Area resolution |

**The one rule every row shares, stated once rather than ten times:** an extension inherits every Shared Engine and every Universal Record door for free, implements only its own genuinely new Record shapes and domain content, and never rebuilds — under a new name, inside its own folder — a mechanism this handbook already names.

---

## Section 9 — Certification: the "ARUMBU Native" checklist

Every item below is objectively testable — by static analysis, by direct inspection, or by a scripted live walkthrough, never by opinion.

☐ Every Record type passes the Universal Record Model's three-property test (Identity, institution-scoping, a "now").
☐ `provider.ts` exists, and `mock-provider.ts` is its only current implementation — nothing in `actions.ts` imports storage directly.
☐ Every `actions.ts` export that mutates data contains a `ctx.permissions.has(...)` check before the mutation.
☐ Every mutating action calls `recordHistory` with a real `subjectType`/`subjectId`.
☐ A Search adapter is registered and returns results correctly filtered by Authority before ranking.
☐ The Attention Contract (`getActNow`/`getBeAware`/`getHistory`) is implemented, even where it correctly returns empty.
☐ Zero hardcoded institution-type branches exist anywhere in the code (a static grep for `institutionType ===` or equivalent returns nothing).
☐ Zero hardcoded English nouns render where an Institution Configuration terminology lookup should — every label is traced to a lookup, not a literal string.
☐ Zero direct cross-application table or store reads are found by static analysis.
☐ Every drawer, dialog, table, and form follows the Design System & Interaction Standards' one hundred consistency rules — spot-checked against at least ten of them live.
☐ Every destructive action opens a Dialog naming its exact consequence; every reversible action opens a drawer.
☐ Keyboard navigation reaches every action without a mouse.
☐ Every theme meets WCAG AA contrast, independently checked.
☐ No `globalThis` singleton is duplicated without the platform's own standard guard — or, once real persistence exists, no application implements its own bespoke storage layer outside the provider pattern.
☐ Cross-domain verification (§5, step 7) is documented, showing every pre-existing application unmodified and working.
☐ A written milestone report exists, following the corpus's own established honest-self-assessment shape.
☐ Zero new Shared Engines were introduced without passing the Authority/Search/Tamizhi bar explicitly, in writing.
☐ Zero new Applications were introduced that a Universal Record Model check would have collapsed into an existing one.
☐ Every Signal, where the domain contributes any, carries no `confidence` field and states its own comparison basis explicitly.
☐ Every Recommendation, where Tamizhi is consumed, cites real Evidence with a real `href` — never a bare assertion.
☐ A stranger who has only ever used People can operate this application's core flow without being told how.

**An application that cannot check every box above is not ARUMBU Native yet — regardless of how well it otherwise works.**

---

## Section 10 — Fifty Common Failure Modes

**Architecture & Layering**
1. Duplicating authority logic instead of registering new Areas — violates Governance's single-resolver guarantee. *Fix: call the existing resolver.*
2. Inventing a second Timeline or activity feed — violates "History is the Audit Engine, read." *Fix: use `subjectType`/`subjectId` against the existing surface.*
3. Hardcoding English nouns instead of routing through terminology — violates the platform's own institution-first discipline. *Fix: every noun through a lookup.*
4. Branching on institution type in code — violates "a bug report, not a shipped feature." *Fix: express the variation as configuration.*
5. Building a second search mechanism — violates the single provider-registry pattern. *Fix: implement the adapter interface.*
6. Adding a second notification inbox — violates "no second inbox, ever." *Fix: route through Attention and toast.*
7. Bypassing the provider interface for a "quick" direct read — violates the swappable-persistence seam. *Fix: always go through `provider.ts`.*
8. Building application-specific Comments — violates the "one door" finding. *Fix: attach via the shared mechanism.*
9. Hand-rolling "what needs attention" logic inside a dashboard — violates "RDIOS owns attention." *Fix: implement the Contract properly.*
10. Hand-rolling a shortage calculation instead of registering an Operational Intelligence Signal Provider — violates the OIE's reuse mandate. *Fix: register the Provider.*

**Data & Records**
11. Skipping the Universal Record Model check for a new Record type — leads to a Record that can't pass Question 1. *Fix: run the checklist first.*
12. Building a second, parallel financial ledger — violates the one shared transaction spine. *Fix: reference Finance's own types.*
13. Storing a mutable "current stock" field instead of an append-only Resource Transaction ledger — violates "remaining is always computed." *Fix: use the Resource Transaction pattern.*
14. Modeling a discrete item as a Custom Field instead of an Asset — violates the discrete-vs-fungible distinction. *Fix: use the Asset Registry.*
15. Adding an "owner" field instead of resolving responsibility through Governance — violates the explicit rejection of universal Ownership. *Fix: resolve via Authority.*
16. Writing "see Order 145" as free text instead of a real link — violates "every cross-reference is a clickable link." *Fix: use a typed reference field.*
17. Building a bespoke tagging system — violates the rejection of universal Tags. *Fix: reuse the domain's own Type field.*
18. Hardcoding an enum for what should be institution-configured free text — violates the platform's established discipline. *Fix: free text with configured suggestions.*
19. Inventing a new foreign-key shape instead of the `subjectType`/`subjectId` convention — violates the Audit Engine's polymorphic pattern. *Fix: reuse the convention exactly.*
20. Building a nested-collection concept instead of referencing Project — violates the Operational Flow investigation's own finding. *Fix: extend or reference Project.*

**Governance & Security**
21. Naming a specific person in an Approval Chain instead of an Area — violates Governance §5 directly. *Fix: name the Area.*
22. Omitting a Separation-of-Duties option for a genuinely sensitive decision — violates Governance §6's own discipline. *Fix: implement the configurable check.*
23. Building a Delegation-like grant with no automatic expiry — violates Governance §3's non-negotiable rule. *Fix: reuse the time-boxed pattern.*
24. Skipping a permission check on a new action — violates the platform-wide gating discipline. *Fix: add the check before every mutation.*
25. Trusting client-submitted totals without server-side recomputation — violates a discipline already proven necessary in this platform's own build history. *Fix: always recompute server-side.*
26. Building a cross-tenant read path "just this once" — violates the single most consequential guarantee this platform makes. *Fix: no exceptions, ever.*
27. Letting Tamizhi call a mutating action directly — violates Institution Intelligence Principles' core boundary. *Fix: Tamizhi only ever produces a Recommendation.*
28. Letting an Automation Rule skip an Approval Chain "for efficiency" — violates the Automation Framework's own guarantee. *Fix: automation calls the same governed action a human would.*
29. Storing a secret in code or an ordinary database column — violates Enterprise Foundation §11.2. *Fix: use the dedicated secrets store.*
30. Inventing a new Role/Permission enum instead of registering Areas — violates "no application invents its own approval logic." *Fix: register Areas, not roles.*

**UX & Consistency**
31. Building a bespoke drawer instead of the shared primitive — violates the Design System's consistency rules. *Fix: use the platform's shared components.*
32. Using a Dialog for routine data entry — violates the Interruption Rule. *Fix: use a drawer.*
33. Inventing a new keyboard shortcut scheme — violates "learned once, trusted everywhere." *Fix: reuse the platform's global shortcuts.*
34. Shipping a generic "no data" empty state — violates "name the one action that fills it." *Fix: write a real, specific empty state.*
35. Building a table with no remembered filters or sort — violates the shared table behavior. *Fix: implement it as specified.*
36. Using a pie chart or gauge outside the one sparing case — violates the Design System's own graph standards. *Fix: use a bar chart or sparkline.*
37. Showing a progress bar with no real denominator — violates the Master Roadmap's own refusal of invented metrics. *Fix: only show progress against a real target.*
38. Adding a mascot or celebratory animation — violates the Visual Design System's Motion "never" list. *Fix: let completion look like relief.*
39. Building a bespoke onboarding wizard with a progress bar — violates Institution Setup Experience v2's explicit rejection. *Fix: compose setup as ordinary Attention content.*
40. Deferring accessibility "until later" — violates the non-negotiable accessibility floor. *Fix: build it in from day one.*

**Process & Documentation**
41. Skipping the Constitution Check gate out of confidence — violates the discipline this entire handbook exists to enforce. *Fix: always run it, especially when confident.*
42. Testing only in isolation, skipping cross-domain verification — violates the Architecture Freeze Declaration's own regression discipline. *Fix: verify every existing application still works, unmodified.*
43. Shipping without a written self-assessment report — violates the established milestone-report pattern. *Fix: write one, including what fell short.*
44. Declaring "done" without passing certification (§9) — violates the platform's own Definition of Done. *Fix: certify before release.*
45. Copying existing code without understanding why each piece exists — risks silently inheriting a known bug class. *Fix: understand the pattern, don't just paste it.*
46. Building a new engine "because this application is special" — almost always fails the Shared Engine bar tested repeatedly across this corpus. *Fix: check the bar first; it almost certainly fails.*
47. Treating this handbook as optional guidance rather than a certification gate — undermines its entire purpose. *Fix: treat it as a hard requirement.*
48. Building against a stale copy of the Constitution instead of the current frozen and living documents. *Fix: always build against the latest set.*
49. Assuming "our institution type is different" justifies new architecture instead of new configuration — violates the reusable-vs-configuration test. *Fix: apply that test explicitly first.*
50. Never running the "would a stranger who learned People understand this immediately" test — the summary failure every item above is one instance of. *Fix: run that test literally, before release.*

---

## Section 11 — Ten-Year Test: 100 applications, 1,000 developers, 50 extension companies, 20 countries

**Would every application still feel like ARUMBU? Only if certification (§9) is a real, enforced gate — not a document sitting in a folder that a busy team under deadline pressure quietly skips.** This is the identical honest finding the Design System & Interaction Standards already reached about itself, and it recurs here for the same underlying reason: a written standard, however precise, is not self-enforcing. **What's still missing is governance over engineering, not more engineering guidance**: a real certification process with an actual reviewing body (or, at real scale, an automated conformance suite running the objectively-testable items in §9 against every extension before it can be listed as "ARUMBU Native," the same gatekeeping role Platform Integration Strategy §5 already names for a future Marketplace). At twenty countries specifically, two further, narrow needs surface without requiring new architecture: localized terminology (already the Institution Configuration Layer's own job, simply exercised at greater breadth) and data-residency awareness (already named as a real future question in Enterprise Foundation §4.5, not newly discovered here). **This document, on its own, produces the same "constitution with no court" gap the Design System document already found — naming it here, a second time, in a different document, is itself the strongest evidence that a real enforcement mechanism, not another handbook, is what this platform will eventually need.**

---

## The Ten Laws of Native ARUMBU Development

1. **If it needs a new engine, it almost certainly doesn't** — check the Shared Engine bar first; it fails nearly every time.
2. **Every Record earns its place by passing the Universal Record Model's test — never by convenience.**
3. **Providers are the only door to data. Actions are the only door to a permission-checked write.**
4. **Terminology is never hardcoded — the institution's own word always wins.**
5. **History is the only memory. Nothing invents a second Timeline.**
6. **Tamizhi drafts and advises. It never sends, executes, or decides.**
7. **Governance is never reimplemented — Areas are registered, Authority is called, never rebuilt.**
8. **A person's unsaved work, permission, and privacy are never surprised, never assumed, never leaked.**
9. **Certification is not a suggestion — nothing ships "ARUMBU Native" without passing the checklist.**
10. **If a stranger who learned one ARUMBU application would be confused by yours, it isn't ARUMBU yet.**
