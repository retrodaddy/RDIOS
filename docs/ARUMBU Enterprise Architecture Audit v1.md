Status: 🟡 Architecture audit — design review only. No code written, no files modified, no roadmap changed. This document is an evaluation of everything built and everything frozen through M13 (Tamizhi Core), written by treating ARUMBU as a candidate for twenty years of production use by a Fortune 500-scale, multi-institution customer base. It is deliberately critical. Where a finding conflicts with a prior report's self-assessment, this document's judgment stands — that is its job.

# ARUMBU Enterprise Architecture Audit v1

## How to read this document

Every finding below is graded on evidence actually found in the constitutional documents (`docs/*.md`) and the live codebase (`os/`, `engines/`, `applications/`, `components/`, `app/(workspace)/`) as it stands after M13. Where evidence was not directly re-inspected in this pass and a claim rests on this engagement's accumulated build knowledge, that is stated. Nothing below recommends implementation — every "should" is a design judgment, not an instruction.

The honest, load-bearing fact underneath this entire audit: **ARUMBU has never yet run against a real database, a second concurrent user, or a hostile input.** Every milestone from M1 through M13 was built, verified, and accepted against an in-memory, single-process, single-browser-session mock layer. That single fact conditions almost every dimension below, and it is stated once here rather than repeated fifteen times.

---

## 1. Architecture

**Verdict: The five-layer discipline is real and has held for thirteen milestones — genuinely rare, and the single strongest finding in this audit.**

The Product Foundation's layering (Data → Shared Engine → Application → Operating System → Institution Configuration) is not aspirational prose that implementation quietly ignored. It is visible in the folder structure today: `engines/` (Authority, Search, Tamizhi), `applications/` (people, work, finance, community, projects, documents, reports), `os/` (identity, attention, navigation, preferences, institution). Every application follows an identical four-file discipline (`types.ts` → `provider.ts` → `mock-provider.ts` → `actions.ts`), and that discipline was never once broken to save time on a milestone under deadline pressure — a genuinely uncommon outcome for a solo, fast-moving build.

**Where accidental complexity has crept in, precisely:**

- **The mock-provider layer is now eleven independent `globalThis` singletons**, each hand-rolling the identical "survive Next.js dev-mode hot-reload" guard (`if (!g.__rdiosXStore) g.__rdiosXStore = {...}`). This was named as debt at six domains in the Universal Record Model document (§10) and has grown to eleven without a shared helper ever being extracted. This is not cosmetic — it is the single clearest piece of evidence in the whole codebase that the "same small decision, re-derived per domain" failure mode the Universal Record Model warned about is not hypothetical; it is already happening, visibly, in production-shaped code.
- **No shared Drawer, Input, Select, Textarea, or Field primitive exists** despite the Visual Design System explicitly declaring cards, drawers, and forms as reusable, non-negotiable shared vocabulary. Seven-plus board components (`WorkBoard`, `MoneyBoard`, `CommunityBoard`, `ProjectBoard`, `DocumentsBoard`, `ReportsBoard`, `OrganizationCanvas`) each independently implement their own drawer markup, their own form-field wrapper, and — as the M12 bug class proved — their own `useState`-initializer pattern for deep-linked selection. This is architecture debt wearing a UI-consistency costume; it will compound every future application, not shrink.
- **The reference-mutation bug class** (mock providers mutating and returning the same object reference, silently poisoning "before" reads) was found and fixed twice in two unrelated domains (Work, Projects) across two different milestones (M6-era, M9). It was never root-caused to the shared mock-provider pattern itself and fixed once, centrally — each fix was local. This is a structural risk sitting in all eleven store files simultaneously, currently undetected in at least nine of them because no one has yet written code that happens to trigger it there.
- **Coupling that should not exist yet quietly does**: `applications/projects` reaches into Work, Finance, and Community's own types (`projectId` fields added directly to `WorkItemBase`, `FinanceTransactionBase`, `Asset`, `Contact`) rather than through a generic relationship mechanism. The Universal Record Model (Q4) explicitly blesses this pattern for "high-frequency, structurally important, well-understood connections" — so this is a *named, accepted* exception, not an oversight — but it means Projects is not, in fact, cleanly separable from three other applications the way the Product Foundation's own headless test (§6) requires every application to be. This has not yet been tested: no one has tried running Work, Finance, or Community with Projects "switched off."

**One structural question the architecture has not yet answered under real load:** every application composes reads via `Promise.all` at the page level (visible in `app/(workspace)/home/page.tsx`), which is correct pattern but currently resolves against in-memory objects with zero I/O latency. Nothing in the current implementation has ever been exercised against real network round-trips to a database, so claims of "architecturally sound" performance are currently unfalsifiable — see §9.

---

## 2. Domain Model

**Verdict: Individually strong, disciplined domain design. Two real cross-domain gaps, one of them significant.**

Each domain (People, Work, Finance, Community, Projects, Documents, Reports) was designed against the Universal Record Model's checklist (Identity, institution-scoping, a "now," History-eligibility, Attention-eligibility, Search-eligibility) and it shows — every one of the seven applications genuinely implements all five without exception, verified directly in `engines/search/index.ts`'s eight adapter functions, each reading a real provider rather than a stub.

**Real gaps, named honestly:**

- **Policy has no implementation anywhere.** The Institutional Policy Model v1 is fully designed, frozen, and explicitly names the exact gap it leaves open ("Policy... has no home yet. Only its narrow numeric shadow does"). M7 Finance named policy extension seams and never wired them. M13 Tamizhi explicitly cannot interpret policy because there is no Policy record for it to interpret. This means the single mechanism the constitution names as the difference between "who may decide" (Governance, built) and "what a correct decision looks like" (Policy, not built) is entirely absent from the live product. Every approval in the system today is gated only by *who*, never by *what* — there is no enforced purchasing threshold, no enforced leave policy, nothing an institution's actual rules could point at. For any institution the founder named as a target (hospital, government, bank) this is not a nice-to-have; it is very close to the whole reason those institutions would consider adopting institutional software at all.
- **Affiliation and Capability lack a `subjectType`/`subjectId` pair** consistent with every other Record's Timeline eligibility — flagged in the Technical Debt Register but not resolved. This means two of the People Domain's own five core concepts (Position, Affiliation, Capability, Membership, Person) cannot currently produce a filtered Timeline the way every other Record type can, a quiet violation of the Universal Record Model's own "every Record automatically eligible for History" guarantee.
- **`Project.stage`, `Document.type`, `Expense.category`, `Relationship.type` are free text with datalist suggestions**, deliberately, to avoid baking in institution-specific vocabulary as a hardcoded enum. This is philosophically correct per the Platform Integration Strategy's reusable-vs-configuration test — but it also means there is currently no real Type *catalog* concept anywhere in the platform: no per-institution list an admin actually manages, no validation, no way to prevent five near-duplicate stage names accumulating in a large institution's data over years. The free-text choice defers a real problem (vocabulary drift at scale) rather than solving it; it was the right call for six domains at demo scale, and it is an open, unresolved question at the "millions of records" scale the audit brief specifically asks about.
- **`ReportCategory` is the one closed enum in the entire domain layer**, justified narrowly by the M11 brief's own "no institution-specific reports, universal only" instruction. This is architecturally correct but worth naming as the one deliberate exception to an otherwise consistent free-text discipline — a future engineer unfamiliar with the M11 brief could easily "fix" this inconsistency in the wrong direction.

**Cross-domain violation check:** no application was found reading another application's mock-provider directly (verified by the M13 report's own grep-for-`mock-provider` claim on `engines/tamizhi/providers/rule-engine.ts`, and consistent with every other engine). This is a real, verified architectural discipline, not an assertion.

---

## 3. Shared Engines

**Verdict: Authority is genuinely reusable. Search is reusable in principle, unverified at scale. Tamizhi is reusable by construction but has almost nothing yet to be reused.**

**Authority (`engines/authority/`).** The strongest of the three. Position-based resolution, unioned across active holdings, computed fresh per request — this is real, live-verified across six-plus milestones of gating (People, Work, Finance, Documents, Projects, Reports all call `ctx.permissions.has(...)` through the identical pattern; a direct grep confirms `reports/actions.ts` alone has 3 permission checks, `finance/actions.ts` has 13, consistent with each domain's actual write-surface size). Nothing application-specific has leaked into the resolver itself.

**Search (`engines/search/`).** Structurally reusable — eight adapters, one rank function, one filter function, no per-application special cases in the ranking logic. But `buildIndex` (confirmed by direct inspection of `engines/search/index.ts`) composes results by calling every domain's full `list*` read on every single search request, in-process, with no caching layer and no incremental indexing of any kind. At mock scale (tens of records) this is invisible. At the audit's own stated target — millions of records, thousands of institutions — this is not a search engine, it is a full table scan dressed as one, and the architecture has no seam today for swapping in a real inverted index without touching every calling site's assumption that `searchInstitution` returns synchronously-composed, freshly-computed results. This is not a "someday" concern; it is the single most concrete, provable scalability defect in the entire platform, and unlike most findings in this document it does not require speculation to state — the code is the evidence.

**Tamizhi (`engines/tamizhi/`).** Correctly interface-first — `TamizhiProvider` is a real seam, `TamizhiContext` is deliberately starved down to `{institutionId}` so a provider cannot reach into raw data. But "reusable" cannot yet be meaningfully tested: there is exactly one implementation (`rule-engine.ts`, three rules), so no second provider has ever actually exercised the interface's boundaries. An interface designed for multiple implementations that has only ever had one is a hypothesis, not a proven abstraction — a real risk given how often an interface's first implementation quietly bakes in assumptions ("providers only ever need Search and Reports") that a second, more demanding implementation (a real LLM wanting broader context) will immediately strain against.

**A genuine and understated finding: none of the three engines has ever been exercised concurrently by two real users, or under any write contention at all.** Authority's "resolved fresh, every request" design is sound in theory; it has never been tested against two people modifying the same Position's holdings in overlapping requests against the in-memory store, which has no locking, no transactions, and no isolation guarantees whatsoever (see §7, §8).

---

## 4. Constitutional Compliance

**Verdict: Unusually high fidelity between what was frozen and what was built — with two areas of quiet, accumulating drift.**

Direct evidence checks performed for this audit:

- **"The subsystem owns the truth, RDIOS owns attention"** (Product Foundation, Product Philosophy) — holds. `os/attention/engine.ts`'s `composeActNow`/`composeBeAware`/`composeHistory` never write to any application's own store; every application's own actions.ts is where all real mutation happens. Verified structurally: Home's page component only ever calls `compose*` functions and never imports a mock-provider directly.
- **The Attention Contract as the only door into Home** — holds, with one now-permanent asterisk: Tamizhi's `composeTamizhiObservations` is a second, parallel composition function called directly from `home/page.tsx`, not routed through the same `getActNow`/`getBeAware` contract every application implements. M13's own report calls this "the same visual language as Attention," but structurally it is a second, bespoke integration point on the single screen the Product Foundation named as the one place that must never accumulate special cases. This is a small, deliberate deviation the M13 brief explicitly asked for ("Add one new section") — but it is a deviation from Product Foundation §4's stated mechanism, and it should be named as such rather than absorbed silently.
- **"No application reads another application's tables directly"** (Platform Integration Strategy §6) — holds for domain-to-domain reads. Does **not** fully hold for Search and Tamizhi, which read every application's mock-provider directly, by design — correctly justified as OS-layer/engine-layer capability rather than a peer application, but worth stating plainly since the rule as literally written doesn't carve out that exception; the exception exists in spirit (Foundation §5's OS Layer "reads across every application; writes to none") but was never named as an exception to §6 specifically.
- **"Configuration is always data. A `type === 'hospital'` branch anywhere in application code is a bug report"** (Platform Integration Strategy §6) — **holds, verified**: `os/institution/terminology.ts` and institution-type-aware copy were confirmed (via the M9-M13 build history) to route through a terminology lookup, not hardcoded conditionals, in every screen this audit's underlying build sessions touched.
- **Governance's same-actor exclusion** ("a creator can never decide their own submission") — implemented independently in at least two places (Work Approvals, Finance Expenses) per the Technical Debt Register's own admission that this logic was "reimplemented twice, independently, with no shared source keeping the two copies honest." This is a **direct, confirmed violation** of Governance §11's own instruction that "no application invents its own approval logic" — not because either implementation is wrong today, but because nothing stops the two copies from silently diverging the next time either one is touched, which is exactly the failure mode Governance was written to prevent, now demonstrably present in the one place it most needed not to be.
- **Institutional Policy Model** — as covered in §2, entirely unimplemented. This is not non-compliance (the document explicitly names itself as "the frozen answer waiting for the first application that needs real policy content"), but it means the constitution currently has one major frozen document with zero load-bearing code anywhere in the platform — worth flagging because a document that governs nothing yet built is easy to quietly forget exists.
- **Tamizhi's behavioral contract** (Institution Intelligence Principles) — verified in the strongest way available short of live multi-provider testing: M13's own report confirms History narrates the *person's* decision, never Tamizhi's own voice ("Retro Rodad dismissed the recommendation," never "Tamizhi analyzed..."), matching Institution Intelligence Principles' explicit example almost verbatim. This is a genuine, checkable compliance win.
- **Every Act Now item carries a real verb** (Architecture Freeze Declaration) — holds by construction in `os/attention/engine.ts`'s composed item shape, and Tamizhi's own Accept/Defer/Dismiss buttons are real verbs a person performs, consistent with Institution Intelligence Principles §3 ("the verb still belongs to a person").

**One deviation worth stating plainly because no prior report named it:** the Audit Engine Design's central architectural requirement — synchronous audit writes inside the same transaction as the domain write, via a database trigger — **cannot exist yet**, because there is no database. Every `recordHistory()` call today is a synchronous in-process function call against a `globalThis` array, which trivially satisfies "synchronous," but the actual guarantee the frozen document cares about (a write that cannot silently vanish because a queue backed up or a worker died) has never been tested, because there is no queue, no worker, and no persistence to lose. The pattern is *shaped* correctly; the guarantee it exists to provide is currently unverifiable and, more importantly, currently **false** — every `globalThis` store is wiped on every dev-server restart, meaning the audit trail's actual current durability is precisely zero.

---

## 5. Platform Consistency

**Verdict: Strong at the OS layer, uneven at the component layer.**

Terminology, navigation, the Act Now/Be Aware/History rhythm, the drawer-over-destination pattern, and the z-index tiering convention (`70`/`75`/`80`/`90`) are all genuinely consistent across all seven applications plus Search plus Tamizhi — confirmed by the fact that seven independently-built board components all converged on the identical drawer-based detail pattern without a shared component forcing them to.

Where it breaks: precisely because there is no shared component forcing them to. Each board's drawer, form field, and button markup is hand-copied rather than inherited, which means consistency today is a *discipline* (the author remembering the pattern each time) rather than a *guarantee* (a shared component making the wrong thing impossible to build). The M12 `useState`-initializer bug — the identical bug independently present in all seven boards simultaneously — is the concrete proof this distinction matters: a shared `useDeepLinkedSelection` hook would have made that bug structurally impossible to introduce even once, let alone seven times. Consistency-by-discipline degrades linearly with the number of future engineers touching the codebase who were not present for this engagement's own accumulated tribal knowledge of "the pattern."

---

## 6. UX

**Verdict: Coherent for a single admin persona exercised heavily; largely unverified for every other persona the founder named.**

Every milestone's own verification report is honest about this, and the pattern is worth stating in aggregate rather than milestone-by-milestone: **the overwhelming majority of live UX verification across all thirteen milestones was performed as a single founder-equivalent account with full permissions**, in a single institution, usually populated with a small number of records. Trustee quorum flows, a Volunteer's restricted view, a Doctor's institution-specific vocabulary, a Government officer's compliance-heavy workflow, a Student administrator's high-volume roster — none of these personas has been walked through live, even once, in this engagement. The Governance model's own quorum/delegation/escalation machinery (§5, §7) has never been exercised by more than one real account in the same institution at the same time.

This matters specifically because the founder's own audit brief names exactly these personas — the gap is not hypothetical, it is the literal list the brief asked to be checked against, and the honest answer is that it has not yet been checked.

---

## 7. Security

**Verdict: The permission model is sound in isolation. Almost everything else a Fortune 500 security review would ask about is either unbuilt or untested.**

- **Authentication**: dev-mode only — a session cookie set without password verification, by the engagement's own repeated, explicit design choice (not an oversight; named directly in the M9-era plan context and consistent throughout). There is no password, no OAuth, no MFA/2FA anywhere in the current implementation. This is appropriate for the phase the project is in and would be a severe finding in any other context; naming it plainly here because the audit brief explicitly asks about 2FA readiness — the honest answer is that the *seam* exists (Platform Integration Strategy §3 already designs the permanent shape: RDIOS's own sovereign Identity, SSO as an optional federated layer later) but zero of it is built, and the current dev-mode session is not a smaller version of that design, it is a placeholder that must be fully replaced, not extended.
- **Authorization**: genuinely the strongest area — Position-based, resolved fresh, gated consistently (verified counts above). The one real gap: Tamizhi's actions (accept/dismiss/defer) require only a valid session and institution match, with **no Area-of-Responsibility gate at all** — a deliberate M13 simplification, but it means literally any authenticated member of an institution can dismiss a recommendation intended for, say, whoever holds the Finance Area, with no record of whether they were the right person to decide that. This is a real, named gap, not a hypothetical one.
- **Data isolation / institution isolation**: `getIdentityContext()` resolves institution scope before permissions on every request (`os/identity/session.ts`, verified by direct read) — the *pattern* correctly mirrors the frozen Tenant Architecture's intent. But the actual enforcement mechanism the Product Foundation demands — RLS as the real boundary, a Supabase client wrapper that cannot compile without an institution scope — does not exist, because there is no database and no such wrapper. Today, institution isolation is enforced entirely by every mock-provider function remembering to filter by `institutionId` correctly, by convention, with no structural guarantee preventing a future function from forgetting to. This is the same "discipline vs. guarantee" gap named in §5, at much higher stakes.
- **Search and Tamizhi isolation**: both correctly institution-scoped by construction (every adapter takes `institutionId` as a required argument) — a real, verified positive.
- **Session model**: no session expiry, no revocation flow beyond ending a membership, no re-authentication for sensitive actions (approving a large expense, offboarding someone) — none of this has been designed, let alone built.
- **Invitation / offboarding**: offboarding's atomic classification (Close/Preserve/Archive/Transfer/Reassign/Delete/Leave-Untouched) is well-designed on paper (Governance §8) and partially exercised in People's own offboarding action — but has never been tested against a person holding Positions across multiple applications simultaneously with pending work in several of them at once.
- **Production readiness, generally**: no rate limiting, no input sanitization audit performed as part of this pass (worth a dedicated pass, not assumed clean), no dependency vulnerability scan performed as part of this document, no secrets-management story beyond "there are currently no real secrets because there is no real backend."

The honest summary: the *shape* of a secure system is present in the architecture documents and in the Authority engine specifically. The actual security posture of the running system today is that of a prototype, because it is one — every gap above is expected at this phase, not surprising, but the audit brief asks for brutal honesty, and the brutally honest statement is that **ARUMBU today has no real authentication, no real tenant-isolation enforcement mechanism, and no tested multi-user contention behavior of any kind.**

---

## 8. Scalability

**Verdict: Untested at every scale above "one developer's own test data." The architecture's stated intentions are sound; nothing has been measured.**

- **10 users**: almost certainly fine as-is, modulo the total absence of persistence.
- **100 users**: the in-memory `globalThis` store model breaks down structurally, not gradually — a single Node process holds all state for all institutions; there is no path to horizontal scaling without first replacing the entire mock-provider layer with a real, shared data store, which is a known, named, and currently unstarted migration, not a tuning exercise.
- **10,000 users / millions of records**: every finding in §3 about Search's full-scan-per-request design becomes disqualifying at this scale, not merely slow. `browseInstitution` and `searchInstitution` both materialize every matching record from every domain into memory on every call. Reports' snapshot computation (`computeSnapshot`) reads full domain lists per report generation with no pagination anywhere in the read path that was inspected. History's `listHistoryForSubject` and `listHistory` are unbounded array scans with no index, no pagination, and no retention/archival policy named anywhere in the Audit Engine Design beyond "tamper-evidence, named but not built" — growth-over-time was simply never addressed as a design question, and an append-only, un-pruned audit table across a twenty-year institution is not a hypothetical concern, it is the guaranteed eventual state of the one table every other read surface (Search, Reports, Home's own History section) depends on.
- **1,000,000 users / thousands of institutions**: the architecture's layering (tenant-scoped from the schema up, per the Product Foundation) is the right shape to eventually get here — but "the right shape" and "verified to work" are different claims, and only the first one is currently true.

---

## 9. Performance

**Verdict: Cannot be meaningfully assessed yet — no real backend exists to generate real latency, and no load or profiling pass has ever been run.**

What can be said with confidence: `getIdentityContext()` is correctly wrapped in React's `cache()` to avoid the specific, previously-diagnosed N+1 pattern of re-resolving identity three times per request (root layout, workspace layout, page) — a genuine, verified, already-fixed performance bug (Sprint 2.5). This is good evidence the team notices and fixes real N+1 patterns when they appear. It is also the *only* such fix confirmed in this pass; Search's full-index-rebuild-per-request (§3, §8) is a second, larger N+1-shaped pattern that has not received the same treatment, likely because it has never been slow enough yet to notice — which is exactly how performance debt accumulates silently until a real dataset exposes it all at once.

Deep component trees, expensive rendering, and Timeline/History scalability were not independently profiled as part of this audit pass; naming this as unverified rather than guessing at a verdict, per the audit brief's own instruction.

---

## 10. Developer Experience

**Verdict: Genuinely excellent for a solo-and-AI-paired build; a real open question for the first outside engineer.**

The four-file-per-domain discipline, consistent naming (`applications/X/{types,provider,mock-provider,actions}.ts`), and the layered folder structure make "where does new functionality belong" a mechanically answerable question for anyone who has internalized the pattern — this is a genuine strength, and it's the direct reason thirteen milestones shipped without the architecture visibly buckling.

The risk is specifically for a new engineer who has *not* internalized the pattern by having built it: nothing in the repository currently documents the four-file discipline itself as a rule (it exists only as an observed convention across the actual files, plus scattered mentions in milestone reports) — a new engineer copying an existing domain as a template would likely reproduce it correctly by imitation, but nothing would stop them from accidentally deviating (e.g., putting a permission check in `provider.ts` instead of `actions.ts`) without a lint rule, a template generator, or a written contribution guide catching it. The Constitutional Index is an excellent map of the *design* documents; there is no equivalent map of the *code* conventions.

---

## 11. Product Philosophy — has ARUMBU drifted?

**Verdict: No meaningful drift through M13. The clearest early-warning sign of future drift is Reports/Analytics, not yet a problem but worth watching.**

The subsystem-owns-truth / RDIOS-owns-attention split has held with unusual discipline for thirteen milestones — Attention items across every domain remain genuinely tied to real, present decisions (the M7 Finance report's own rejection of a manufactured "large expense" nudge, explicitly because nothing real backed it, is the clearest evidence this discipline is a live practice, not a slogan). Tamizhi's three rules stay firmly advisory, and the "if Tamizhi vanished tonight" test was verified by actual construction (M13's own report: zero imports from `engines/tamizhi/` anywhere in M1–M12's code), not merely asserted.

**Where the seed of drift exists, named precisely so it can be watched rather than ignored:** Reports (M11) introduces the platform's first genuinely *retrospective*, dashboard-shaped surface — snapshots, filters, categories, charts. This is philosophically justified (§ the M11 brief's own "what happened, what deserves attention, keep them separate" framing, honored correctly) and is not, itself, drift. But Reports is also the single application in the platform most structurally similar to what a conventional "collection of business applications" would build first, and it is the application most likely to attract exactly the kind of institution-specific feature requests ("can we also get a report that does X for just our institution") that would, if accepted uncritically, be the actual mechanism by which ARUMBU's stated identity erodes. Nothing has drifted yet. The document names this now, per the audit brief's own instruction to say precisely where drift *would* begin, rather than waiting until it has.

---

## 12. Technical Debt Register (categorized)

**Critical**
- No real persistence layer; every `globalThis` store is wiped on process restart, meaning the audit trail — the platform's own stated core promise of permanent institutional memory — currently has zero actual durability.
- No real authentication; session model is a placeholder, not a smaller version of the permanent design.
- Institution isolation is enforced by convention (every provider function remembering to filter by `institutionId`) rather than by a structural guarantee (RLS, a compile-time-enforced scoped client) — a single missed filter in any future provider function is a cross-tenant data leak with no safety net to catch it.

**High**
- Search's full-index-rebuild-per-request architecture does not scale past mock-sized data; no caching, incremental indexing, or pagination exists anywhere in the read path.
- The reference-mutation bug class is a structural risk present in all eleven `globalThis` store files, confirmed fixed in only two.
- Institutional Policy Model has zero implementation; every approval in the system is gated by who, never by what.
- Same-actor-exclusion logic is duplicated, unshared, across at least two domains — a direct, confirmed violation of Governance §11's own explicit instruction.
- History/Audit has no retention, pagination, or archival design at all — an unbounded, permanently-growing, unindexed read surface every other engine (Search, Reports, Home) already depends on.

**Medium**
- No shared Drawer/Input/Select/Textarea/Field primitive; seven-plus board components hand-duplicate markup, already proven to independently reproduce the same bug (M12's `useState` initializer issue) simultaneously across all seven.
- Affiliation and Capability lack `subjectType`/`subjectId`, breaking Timeline-eligibility parity with every other Record type.
- Tamizhi's accept/dismiss/defer actions have no Area-of-Responsibility gate.
- Search's Type filter is wired in the engine but not exposed in the UI; ranking has no Authority-aware relevance weighting.
- Project/Document/Expense/Relationship "type" fields are free text with no institution-managed catalog, deferring rather than solving vocabulary drift at scale.

**Low**
- "Last Updated" is derived per-adapter in Search rather than from one consistent field across domains.
- Report category filters are not scoped per-category in the UI.
- Tamizhi implements only 1 of 5 named output kinds (Recommendation); Observation/Explanation/Summary/Question exist only as types.
- Only 3 rules exist in Tamizhi's rule engine; dedupe is per-rule, not per-occurrence.

**Nice to have**
- A written contribution guide / template generator for the four-file domain discipline, so it survives being handed to an engineer who didn't build it.
- A shared "describe this Record in one plain sentence" capability (named as open in the Universal Record Model, §"What remains open") to de-duplicate Search-result, Attention-card, and History-summary rendering.

**Never** (explicitly, per this audit's own judgment — not worth building even at scale)
- A generic, single-table relationship mechanism replacing all named fields (the Universal Record Model already correctly rejected this — named fields remain right for high-frequency, well-understood connections).
- Universal Tags across every Record (correctly rejected already — Type/Category mechanisms already serve this need per-domain, and a second parallel vocabulary would compete with, not complement, that discipline).

---

## 13. Production Readiness Score

Scored out of 10, each explained rather than left as a bare number, per the audit brief's own instruction.

| Area | Score | Why |
|---|---|---|
| **Architecture** | 8/10 | The five-layer discipline genuinely held for thirteen milestones with only named, justified exceptions. Loses points for the un-extracted `globalThis` pattern and the unresolved reference-mutation bug class sitting in all eleven stores. |
| **Product Design** | 8/10 | The constitutional documents are unusually rigorous and self-critical (multiple Reconsideration documents, explicit rejected-alternatives sections). Loses points because Policy — a document the constitution itself calls necessary — was never built, leaving a real gap between designed and delivered. |
| **UX** | 5/10 | Strong and calm for the one persona heavily exercised; genuinely unverified for every other persona the founder explicitly named as a target. Cannot score higher without evidence that does not yet exist. |
| **Performance** | 3/10 | Not because anything measured is slow — because nothing has been measured under real conditions. One confirmed N+1 fix (identity resolution) is the only performance evidence that exists; Search's architecture is a known, unaddressed risk. |
| **Scalability** | 2/10 | The in-memory store model is structurally incompatible with more than one server process, which is disqualifying before any other scalability question is even reached. |
| **Security** | 3/10 | Sound permission logic, no real authentication, no structurally-enforced tenant isolation, no session hardening, no security testing performed. Appropriate for this phase; not appropriate to call production-ready. |
| **Maintainability** | 7/10 | The domain discipline is real and consistent. Docked for duplicated UI markup and duplicated business logic (same-actor exclusion) that will diverge if not consolidated soon. |
| **Accessibility** | 5/10 (uncertain — flagged) | The Visual Design System sets a real, explicit WCAG AA bar and Sprint 2.5's own report claims a contrast-validation script was run. This audit did not independently re-verify accessibility live, per its own instruction to say when something is uncertain rather than guess; scored provisionally on the strength of the design document's rigor, not on independently confirmed evidence. |
| **Consistency** | 7/10 | OS-layer and terminology consistency is excellent and verified. Component-level consistency is discipline-based, not guarantee-based — see §5. |
| **Extensibility** | 7/10 | The Extension Architecture (Product Foundation §9), the Attention Contract, and the Search/Tamizhi provider-registry patterns are real, proven seams — Tamizhi's own provider interface is designed correctly even though only one implementation exists to prove it. Docked because that "only one implementation" fact means the seam's true flexibility is still a hypothesis. |
| **Developer Experience** | 7/10 | Excellent within this engagement's own continuity; real risk for a new engineer without a written convention guide. |
| **Documentation** | 9/10 | Genuinely exceptional — a frozen constitutional stack, a living roadmap, per-milestone reports with honest self-assessment sections, and a maintained Constitutional Index. Among the strongest artifacts in this entire audit. |
| **Overall Platform** | **5/10** | A very well-designed, well-disciplined *prototype* of an institutional operating system, with real architectural bones that would justify continued investment — currently several structural milestones away (real persistence, real auth, real tenant isolation, real multi-user testing, Policy) from anything a serious institution could actually run on. |

---

## 14. What Should NOT Change

Architectural decisions this audit recommends treating as sacred — not because they cannot be questioned in principle, but because reopening them now would cost far more than any plausible benefit, and each has already survived deliberate, documented attempts to disprove it:

1. **The subsystem-owns-truth / RDIOS-owns-attention split**, and the Attention Contract as its literal mechanism. This is the single idea every other frozen document depends on, and it has been tested honestly (the M7 rejected-nudge example) rather than merely asserted.
2. **Authority resolved fresh, per request, from Position holdings** — never cached as a static grant, never attached to a person independent of a seat. This is the one piece of the platform this audit found zero evidence of drift or compromise in, across every domain that consumes it.
3. **Governance's Areas of Responsibility as nouns, never verb-object permission keys.** The one-time correction already applied (Governance §"Where this leaves M5") shows the discipline is actively enforced, not just declared.
4. **The four-file domain discipline** (`types.ts` → `provider.ts` → `mock-provider.ts` → `actions.ts`). Unglamorous, but it is the actual reason thirteen milestones shipped at a consistent quality bar — replacing it with something more "sophisticated" without a proven reason would be change for its own sake.
5. **The provider-interface seam pattern** (Search's adapters, Tamizhi's `TamizhiProvider`) — even though only lightly tested by multiple implementations so far, the *shape* of the seam is correct and cheap to keep; the risk named in §3 is about proving it under a second real implementation, not about redesigning it preemptively.
6. **Free-text-with-suggestions over hardcoded enums for institution-specific vocabulary**, with `ReportCategory` as the one named, justified exception. Reversing this default would reintroduce exactly the "bug report disguised as configuration" failure the Platform Integration Strategy warns against.
7. **The Universal Record Model's refusal to force a literal shared table or class hierarchy.** Its own investigation already stress-tested this question honestly and concluded a checklist-not-a-table is correct; revisiting it without a genuinely new argument would be relitigating a question the platform already answered well.
8. **Tamizhi's structural inability to execute, own data, or bypass a human decision.** This is the one piece of the architecture where getting it wrong would be catastrophic rather than merely costly, and it has been verified by actual code construction (zero imports from `engines/tamizhi/` anywhere upstream), not just by policy.

---

## 15. Final Verdict

Per industry, evaluated against the platform as it exists today — not against its designed intent, which is materially further along than its implementation:

- **A startup**: Yes, deployable today, with eyes open about the persistence gap. A startup's tolerance for "we'll add a real database and real auth before this matters" is high, and the domain model would serve a small, fast-moving institution well immediately.
- **A school**: Not yet. The domain model and terminology system would fit well, but no persistence and no real authentication are disqualifying for an institution handling student and family data, regardless of how good the architecture underneath is.
- **A hospital**: No. Beyond persistence and authentication, the complete absence of Policy, the unverified multi-user/contention behavior, and the lack of any tamper-evidence in the audit trail (named, explicitly not built) are each independently disqualifying for a regulated, safety-critical institution.
- **A manufacturing company**: Not yet, for the same structural reasons as a school — the domain shape (Work, Assets, Finance) is closer to ready than most verticals, but the platform beneath it is not.
- **A charitable trust**: Not yet, though closer than most — smaller data volumes and lighter compliance load make the persistence and auth gaps somewhat more tolerable, but "somewhat more tolerable" is not "ready."
- **A government department**: No, and not close. Every gap named in Security (§7) is independently disqualifying for this vertical specifically, before Policy, scalability, or anything else is even considered.
- **A Fortune 500 enterprise**: No. The gap is not one or two missing features; it is the entire data and identity layer the rest of the architecture assumes will eventually exist. The architecture that has been designed would very plausibly support this scale once built — the software that has been built does not yet exist at the layer this question is actually asking about.

**The honest, single-sentence summary:** ARUMBU's design is trustworthy enough to keep building on without a rewrite; ARUMBU's implementation is a real, working, well-disciplined proof of that design, not yet a system any institution should run its actual operations on — and the distance between those two sentences is entirely the persistence, authentication, and tenant-isolation layer named repeatedly throughout this document, not the domain or governance model sitting on top of it.
