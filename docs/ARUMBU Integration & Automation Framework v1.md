Status: 🔵 Infrastructure design — no code, no schema, no implementation, no roadmap change. Extends the frozen Constitution and the non-constitutional ARUMBU Enterprise Foundation v1 without contradicting or reopening either. Does not touch Governance, Attention's tiering logic, Authority's resolution logic, Policy's lifecycle, or Tamizhi's behavioral philosophy — every one of those is treated here as correct and frozen; this document designs only the layer that lets the outside world reach them, and be reached by them, without any of them ever knowing an "integration" exists.

# ARUMBU Integration & Automation Framework v1

## Why this document is infrastructure, not a sixteenth application

Every institution on the founder's own list already lives partly outside ARUMBU — in an inbox, a Slack workspace, a bank's payment rail, a government portal, a barcode scanner on a warehouse floor. An institutional operating system that cannot reach those places, or be reached from them, fails the same test Product Philosophy already sets for everything else: it forces a human to be the integration layer, manually re-keying a decision ARUMBU already made into a system ARUMBU doesn't talk to. This document exists to close that gap the same way Enterprise Foundation closed the persistence and authentication gaps — by extending existing constitutional machinery outward, never by inventing new machinery to sit beside it.

---

## 1. What is an Integration? — a constitutional definition

**An Integration is not an application. It owns no institutional truth of its own, decides nothing, and remembers nothing beyond what is necessary to keep translating.** Tested directly against the Universal Record Model's own Question 1 (Identity, institution-scoping, a "now" that can change): a connection to Slack has no "now" of its own worth an institution asking about — the *fact* worth remembering is always on the institutional side (an Expense was approved; a Document is expiring), never on the connector's side. This is the same test that correctly excluded History/Audit entries and a live Report's rendered output from being Records (Universal Record Model Q2), applied here to reach the identical kind of conclusion: **an Integration is a bounded translation layer between a Record's own truth and an external system's own protocol, existing solely so that a Record's Attention Contract, History narration, or Governance-gated action can also reach — or be reached by — a system outside ARUMBU, without any application ever needing to know that system exists.**

This is a direct, load-bearing restatement of Product Philosophy's own central distinction: **the subsystem owns the truth, RDIOS owns attention** — extended here to a third clause the same document's own reasoning already implies but never had occasion to state: *and Integrations own neither.* A connector that starts accumulating its own state, its own decisions, or its own memory has stopped being an Integration and become an undeclared application — the single clearest tripwire this document names for testing any future connector's design.

---

## 2. Should Integrations be Applications, Engines, Infrastructure, or Providers?

**Infrastructure, implemented through Providers.** Tested against each candidate directly, in the same disproof-first method the Universal Record Model used for its own hardest questions:

- **Not an Application.** §1's own test already disqualifies this — an Application Layer citizen must have real institutional truth of its own to own (Product Foundation §4's own table: each application "answers exactly one question" about the institution itself). "What does Slack know?" is not a question an institution asks about itself.
- **Not a new Engine.** A Shared Engine Layer citizen is institution-agnostic *machinery that makes decisions or enforces rules* (Authority resolves; Search ranks; Tamizhi advises). A connector does neither — it moves data across a boundary and translates its shape. The one piece of genuinely engine-shaped machinery this document needs — matching an event to which connectors care about it — already has a home: it is dispatch logic living inside the Event Bus Enterprise Foundation §10.9 already named, not a new engine invented for this document.
- **Yes, Infrastructure, via Providers.** Every connector is a new implementation of one shared interface — exactly Enterprise Foundation §16.2's already-proven pattern (Search's adapters, `TamizhiProvider`), and exactly the vocabulary discipline the ARUMBU Constitutional Clarifications v1 already ratified: "Provider" is retired from unqualified use, and this document adds one new qualified sense — **Connector Provider** — following, not contradicting, that ruling. The framework that registers, dispatches to, and governs Connector Providers is itself Infrastructure, living beside Enterprise Foundation's own persistence, security, and observability sections, never inside the Constitution.

---

## 3. Connector Model — the universal architecture

Every connector implements one interface, `ConnectorProvider`, deliberately as thin as `TamizhiProvider` — the same discipline that kept Tamizhi's own seam honest applies here for the identical reason: a narrow interface is what makes a hundredth connector cost the same to add as a second one (§13).

- **Capabilities** — a declarative manifest, not code an application ever inspects directly: which event types the connector can *emit* (inbound — "a WhatsApp message was received"), which event types it can *consume* (outbound — "notify this channel"), which discrete **actions** it exposes (§ below), and — critically, for §10 — whether each action is `mutating: true` (sends, creates, posts — has a real external-world effect) or `mutating: false` (drafts, previews, reads).
- **Authentication** — never implemented by the connector itself; it declares which credential shape it needs (§4) and the framework supplies it from the one shared secrets infrastructure Enterprise Foundation §11.2 already specifies.
- **Events** — both directions ride the same Event Bus Enterprise Foundation §10.9 already named for Search and Audit; a connector is simply a third and fourth kind of listener/publisher on that bus, never a bespoke pipe.
- **Actions** — a bounded, declared verb list, each one mapped to a real Governance Area exactly the way every application's own actions already are (Governance §11: "a new application registers two things... which of its own actions belong to which Areas"). A connector registers into Governance's existing Areas; it never invents a parallel permission concept, and this is the whole of what "without inventing new governance" requires.
- **Health** — a liveness/readiness signal, feeding Enterprise Foundation §13's own Observability design directly; connectors are one more service type that design already anticipated, not a new observability concern.
- **Permissions** — resolved identically to every other gated action in the platform: `ctx.permissions.has(...)` against the Area the connector's action is registered under. A connector calling "send email as Finance" is authorized exactly the way a person clicking "Send" in a Finance screen would be — through Authority, unchanged, never a separate integration-specific check.

**What this section deliberately does not add:** a new record type, a new Attention tier, a new History mechanism, or a new permission model. Every one of the six required properties above is satisfied by pointing at something the Constitution or Enterprise Foundation already built.

---

## 4. Authentication — the connector's own credential, distinct from a person's

Enterprise Foundation §2 designs how a *person* authenticates into ARUMBU. This section designs how a *connector* authenticates outward, to an external system — a different direction entirely, sharing only the underlying secrets infrastructure.

- **OAuth** — the default for consumer and enterprise SaaS (Google Workspace, Microsoft 365, Slack, Zoom). A per-institution grant; tokens live in the dedicated secrets store (Enterprise Foundation §11.2), refreshed automatically before expiry, never held in application code or a database column ordinary queries can read.
- **API Keys / Service Accounts** — for systems without a real OAuth flow (many payment gateways, some ERPs, government APIs). Same secrets store, a different credential shape, declared explicitly in the connector's capabilities manifest so the framework knows which UI to present when an institution connects it.
- **Certificates** — for the smaller set of systems (some banking and government rails) that require mutual-TLS or signed-request certificates. Same store, same rotation discipline, a third credential shape.
- **Webhooks (inbound)** — the external system calling ARUMBU, never trusted at face value: every inbound payload is verified against a signature/secret registered at connector setup (§11) before it is mapped to anything the platform acts on.
- **Rotation** — reuses Enterprise Foundation §11.3 verbatim: a defined cadence, no forced downtime, per credential.
- **Revocation** — reuses Enterprise Foundation §3.6/§3.7 verbatim: revoking a connector's credential is immediate, not eventually-consistent, and forces any in-flight or cached authorization built on it to re-check. An institution disconnecting Slack must mean Slack is disconnected the moment they click it, not on the next background refresh cycle.

---

## 5. Event Flow — one composition, many translations

The worked example, resolved precisely: **Expense Approved → Policy → Connector → Email → Microsoft Teams → WhatsApp**, without duplicating business logic anywhere along that chain.

1. **Expense Approved** happens exactly once, inside Finance's own `approveExpenseAction` — already Policy- and Governance-gated per the Institutional Policy Model and the Enterprise Architecture Audit's own confirmed permission-check pattern. Nothing about this document touches that action.
2. That action emits one domain event, carrying `subjectType`/`subjectId` (the Expense), exactly the polymorphic shape the Audit Engine Design already uses for everything else.
3. The event reaches the Event Bus (Enterprise Foundation §10.9).
4. **The message is composed exactly once, centrally, in the Assistant Voice** — by the same discipline Experience Principles §4 already requires ("summaries render once, at write time, never recomputed on read"). This composed **Notification Intent** — a plain sentence plus the record reference, not raw business data — is what every registered connector receives, never the Expense's own internal fields.
5. Each connector registered to that event type (Email, Teams, WhatsApp) receives the identical Notification Intent and does exactly one job: **translate it into its own protocol's shape** — an email with a subject line, a Teams card, a WhatsApp text. No connector re-derives *what happened* or *why it matters*; that judgment was already made once, upstream, by Finance and Policy.

**This is the entire mechanism that prevents duplicated business logic**: a connector is structurally incapable of deciding what to say, because it is never given the raw Record to interpret — only the already-composed sentence. The same discipline that keeps Search's ranking "nothing AI-driven, nothing semantic" (M12's own frozen instruction) keeps a connector's translation "nothing business-logic-driven" — it receives a finished thought and changes only its packaging.

---

## 6. Automation — IF/THEN without bypassing Governance

Not a new concept — Platform Integration Strategy §5 already names it exactly: **"Automation... not a new engine — a rule that reacts to Events and creates or assigns Work Items, built entirely from machinery already frozen."** This document gives that already-frozen concept its concrete connector-facing shape.

**An Automation Rule is a Record**, tested and confirmed against the Universal Record Model's own three necessary properties: Identity, institution-scoping, and a "now" (active / paused / retired) that can change. It consists of exactly two parts — a **Trigger** (an event type plus an optional filter — "Document.expiring," "Expense.approved," "Project.blocked") and an **Action** (one bounded, declared verb from a connector's own capability manifest, or a domain action's own entry point — "notify Finance," "create accounting entry," "schedule a meeting").

**Automation never bypasses Governance, by construction, not by discipline alone:**

- An Automation Rule must itself pass through an Approval Chain before it can activate — reusing Governance §5 unchanged, exactly the way a Policy already requires approval before it governs anything (Institutional Policy Model §3). An institution cannot have a live automation nobody with real standing ever agreed to.
- At runtime, an Automation Rule acts **using the Area of Responsibility of whoever authored and got it approved** — never a bare system privilege, never impersonating a specific person. History narrates it honestly: *"Automation Rule 'Notify Finance on document expiry' notified Priya"* — never *"Priya was notified"* with the automated origin hidden, and never *"the system notified Priya"* with no accountable Area behind it.
- If the authoring person's own standing in that Area is later revoked, the rule's authority is revoked with it — the identical cascading-revocation semantics Enterprise Foundation §3.6 already specifies for a person, applied here to a rule acting on a person's behalf.

**Applied to the three worked examples:**

- *Document expires → notify Finance*: a Trigger on Documents' own expiry fact (already real, per Reports' own `documents-expiring` observation) firing an Action that is a connector's declared `notify` capability — no new logic, the fact already existed.
- *Expense approved → create accounting entry*: the Action calls the Accounting connector's own declared `createJournalEntry` capability, passing the Expense's already-approved, already-true data — the connector never re-derives GL codes or re-checks whether the expense should have been approved; Finance's own domain logic remains the only source of truth for what the expense *is*.
- *Project blocked → schedule a meeting*: the Action calls a Calendar connector's `createEvent` capability; the resulting meeting is a real event in the external calendar, and the fact that it was scheduled is narrated back to the Project's own Timeline (Universal Record Model Q9) — never a fact that exists only outside ARUMBU where the institution's own memory can't see it.

---

## 7. Scheduling

Extends, does not reinvent, Enterprise Foundation §10.7/§10.8 (Background Workers, durable Queue):

- **One-time / delayed** — a job enqueued for a specific future time, in the same durable queue every other background job already uses.
- **Recurring / cron** — a job carrying a repeat interval or cron expression, re-enqueuing itself on each completion; no separate scheduler infrastructure invented.
- **Event-triggered** — not scheduling in the calendar sense at all; this is §5/§6's Event Bus dispatch, named here only to distinguish it clearly from the four genuinely time-based cases above.
- **Retry** — exponential backoff with a bounded attempt count, then dead-lettering, exactly as Enterprise Foundation §10.8 already specifies for every background job — a connector call that fails is just one more job in that same queue, not a special case.

---

## 8. External Commands — can the outside world create institutional Records?

**Yes — through the same entry point a person would use, never a separate one.** This is the single most important structural decision in this document, because it is the literal mechanism that satisfies the task's own closing requirement: every future application (Spreadsheet, Calendar, Forms, Inventory, Procurement, HR) becomes integration-capable automatically, without inventing its own external-command handling, *because there is only ever one command handling path to inherit.*

Concretely: an inbound command (a webhook, an email parsed into a Task, a WhatsApp message logged as a Community interaction) is never routed to a bespoke "external create" function. It is first resolved to a real **acting context** — who or what is this command attributed to? This resolves to either a real Membership holding a real Position (a "Service Account" Position an institution can configure exactly the way any other Position is configured, per People Domain Review's own institution-configurable Position types) or an already-approved Automation Rule acting under its author's Area (§6). Once that acting context resolves, the command calls **the exact same `actions.ts` function a human-triggered UI action would call** — `createExpenseAction`, `createTaskAction`, `createDocumentAction` — subject to the identical permission check every other caller of that function already passes through.

**If no real acting context can be resolved, the command is refused** — the identical refusal discipline Institution Intelligence Principles §6 already requires of Tamizhi ("whenever an action would require it to guess at authority it hasn't actually been granted... the honest answer is 'I don't know'"), reused here for a structurally different caller facing the identical problem. An external system is never granted the benefit of the doubt an unauthenticated person wouldn't get either.

This is why no future application needs to invent its own version of this mechanism: **the moment a domain implements its actions.ts entry points at all — which every application already must, per the four-file discipline — it is automatically externally-command-capable**, with zero additional work, because the Integration Framework never talks to anything but that one already-existing seam.

---

## 9. Failure Model

**The governing rule, stated once, applying to every case below: an integration's failure is always downstream of institutional truth, never upstream of it.** An Expense is approved the moment Finance's own action says so — whether the Teams message announcing it succeeds, fails, or never fires has no bearing on whether the Expense is actually approved. A connector failing must never roll back, delay, or cast doubt on a real institutional decision; this is the direct consequence of §1's own definition (Integrations own no truth) applied to the failure case specifically.

- **Email fails / Slack unavailable / API timeout** — retried per §7's own backoff, then dead-lettered. **History records the failure as a real, honest fact**, narrated in the Assistant Voice on the *originating Record's* own Timeline, not buried in an operator-only log: *"The Teams notification for this approval could not be delivered."* `subjectType`/`subjectId` point back to the Expense, per the Audit Engine's own polymorphic pattern — a person reading that Expense's history sees the failure in context, exactly where they'd look for it.
- **Payment rejected** — not a connector failure at all, but a real, true fact about the external world the connector is honestly reporting. Narrated to the underlying Finance record's own Timeline as an ordinary event, and — because a rejected payment genuinely blocks a real pending decision — correctly eligible for Act Now (Experience Principles §1's own promotion test: a real decision, with a real verb — "Retry," "Choose another method").
- **Calendar offline** — same failure-handling shape as email/Slack; the meeting-scheduling Automation from §6 simply retries per §7, and if it exhausts retries, the Project's own History records that the attempt failed, honestly, rather than silently disappearing.

**How Attention surfaces failures, without becoming noisy:** a single transient failure is never Be Aware-worthy — exactly the "calm is a feature" discipline Experience Principles §5 already requires. A **persistent** failure (a connector down for N consecutive attempts, or a credential that has expired) earns a genuine Be Aware item — *"The Slack connection needs reauthorizing"* — and only escalates to Act Now when a specific, currently-pending institutional decision is actually blocked by it (an Approval Chain's only notification path is broken), at which point it earns a real verb the same way anything else does. This is not a new tiering rule — it is Experience Principles §1 applied, unmodified, to a new kind of fact.

---

## 10. Tamizhi and Integrations — draft, never send

**Tamizhi never executes actions autonomously. This document adds exactly one new structural rule to make that already-frozen principle concretely true for connectors, rather than merely promised.**

Every connector action declared `mutating: true` (send an email, post a message, create a calendar event, submit a payment) is **structurally unreachable to every Tamizhi provider** — not a behavioral instruction a provider is trusted to honor, but an enforcement identical in kind to `TamizhiContext`'s own deliberate starvation to `{institutionId}` (Enterprise Foundation §9.2): a provider is simply never handed the capability to invoke a mutating connector action, the same way it is never handed a raw database handle.

What Tamizhi *may* do: invoke a connector's `mutating: false` capabilities — draft an email, produce a meeting-time proposal, generate a spreadsheet outline — through the identical restricted doors it already has (Institution Intelligence Principles' own "Search, History, Attention, Reports"), now including read/draft-only connector capabilities as one more instance of the same door, never a new one. The output is not an action taken; it is an artifact attached to an ordinary Recommendation (or a future Observation/Explanation output kind, per Enterprise Foundation §9's own honest accounting of which of Tamizhi's five output kinds are actually implemented) — **requiring the identical human Accept a Recommendation already requires today.** Accepting a drafted email is what triggers the real, `mutating: true` Send — attributed to the accepting person, narrated to History as their own action, exactly the pattern M13 already proved live ("Retro Rodad dismissed the recommendation," never "Tamizhi analyzed"). Nothing about Tamizhi's own model changes; this section only widens what a Recommendation's Evidence can point at.

---

## 11. Security

Reuses Enterprise Foundation §11 in full, applied specifically to connectors:

- **Permissions & scopes** — the OAuth scopes or API-key privileges a connector requests are declared in its own capabilities manifest and are reviewable by an institution before granting; least-privilege by default, never broader access than the connector's declared actions actually need.
- **Secrets & encryption** — Enterprise Foundation §11.1/§11.2, unchanged.
- **Rate limits** — per-connector, per-institution, protecting both platform cost exposure and cross-tenant fairness — the identical reasoning Enterprise Foundation §9.5 already applies to Tamizhi, extended here to every connector's own external API budget.
- **Replay protection** — every inbound webhook carries a nonce and timestamp, checked against a short window and a dedupe cache, so a captured payload cannot be resubmitted later to trigger the same action twice.
- **Webhook verification** — every inbound payload is checked against the connector's registered signing secret before it is trusted or mapped to an event; an unverified payload is discarded, not queued for later inspection.

---

## 12. Monitoring

Extends Enterprise Foundation §13 (Observability) directly, treating connectors as one more service type that design already anticipated:

- **Health** — per-connector liveness/readiness, feeding the same health-check infrastructure.
- **Logs** — every connector call, institution-scoped, leakage-safe per §5.4's own rule (no cross-tenant data in a shared log line).
- **Retries / dead-letter queues** — depth and age tracked as real metrics, alertable per §13's own named signal for queue backlog.
- **Connector status** — the live, human-facing view of health, feeding §9's own Be Aware surfacing.
- **Usage metrics** — calls per connector per institution, doubling as the input to §11's own rate limiting and as a real, honest fact an institution could eventually see about its own automation footprint (a future Reports category, named here only as a natural future extension, not designed in this pass).

---

## 13. Enterprise Scale — 100 connectors, 1,000 workflows, millions of events

The architecture stays simple for the same reason the Extension Architecture already stays simple at any number of future applications (Product Foundation §9's own test, reused unchanged: *"if adding [it] ever requires touching Home, Search, or another application's code, the layering has failed"*): every connector is one more implementation of the same narrow `ConnectorProvider` interface, and adding the hundredth costs exactly what adding the second did, because nothing about the framework special-cases any specific connector. A thousand Automation Rules scale the way a thousand Policies would (§6's own Record-shaped design) — each independently versioned, independently governed, sharing no mutable state with any other rule. Millions of events are already Enterprise Foundation §10.8/§10.9's problem to solve, not a new one this document introduces — the Integration Framework is simply one more consumer of infrastructure already sized for that volume.

---

## 14. Future — plugins, marketplace, third-party connectors, a public SDK

Already named, precisely, in Platform Integration Strategy §5's own table: **Marketplace and Developer Platform both belong beside ARUMBU, never inside it.** A third-party connector is nothing more than a new implementation of the `ConnectorProvider` interface this document defines — the identical story as a third-party Tamizhi provider (Enterprise Foundation §9) or a third-party module consuming the Extension Architecture (Product Foundation §9). The Public API Enterprise Foundation §16.3 already names ("not a new product — the existing Application Layer, exposed over HTTP") is exactly what a third-party connector, or an eventual public SDK, is built against — this document invents nothing new here; it simply confirms the Connector Provider interface becomes one more thing that already-planned Public API exposes a stable contract for.

---

## 15. Final Test

**Can ARUMBU integrate with Google Workspace, Microsoft 365, SAP, Oracle, Salesforce, Slack, Teams, and WhatsApp without changing any application?**

**Yes — provided the application already does what every application on this platform is already required to do: implement the Attention Contract, emit domain events, and satisfy the Universal Record Model's own checklist (Identity, institution-scoping, History-eligibility).** Confirmed directly against the Enterprise Architecture Audit's own findings: all seven built applications already satisfy this. The Integration Framework only ever touches three seams — the Event Bus (§5), Search's existing adapters (for read-context), and each domain's own `actions.ts` (§8) — none of which require a single application to change anything about itself.

**The one honest caveat, named precisely rather than smoothed over, per the task's own instruction:** the event-driven half of this design (§5, §6) depends on a real Events engine — and per the ARUMBU Constitutional Clarifications v1's own engine-terminology reconciliation, **Events is still a named, real, but entirely unbuilt Shared Engine Layer member.** Today, applications narrate directly to History rather than emitting through a genuine Events layer first. This document's event-driven integration path cannot fully exist until Events itself is built — a dependency this document shares, unmodified, with Enterprise Foundation §10.9's own already-stated precondition for Search's incremental indexing. **This is not a flaw in this design; it is the one real, load-bearing thing still missing beneath it, and it should be named exactly once, here, rather than discovered later as a surprise.** The command/action-invocation half of this design (§8 — external systems calling into ARUMBU) has no such dependency and is buildable today, on top of infrastructure that already exists.

---

## What this document does not decide

- **Which specific connectors get built first** — a Roadmap and prioritization question, deliberately out of scope for an architecture document, per the founder's own standing instruction not to update the Roadmap here.
- **The exact shape of the Notification Intent or Automation Rule record** — named at the level of "what properties it must have to satisfy the Universal Record Model's own checklist," not specified field-by-field, which remains implementation work for whenever this framework is actually built.
- **Anything about Governance, Attention's tiering, Authority's resolution logic, Policy's lifecycle, or Tamizhi's behavioral contract** — every one of them is consumed here exactly as frozen, extended in reach, never redesigned in substance.

## The closing test

Every one of the fifteen questions above was answered by pointing at something the Constitution or Enterprise Foundation already built — Governance's Areas, the Attention Contract, the Audit Engine's polymorphic subject pattern, Experience Principles' single-composition rule, Institution Intelligence Principles' refusal discipline, the Provider pattern already proven twice over. **Nothing in this document required inventing a new kind of authority, a new kind of memory, or a new kind of decision.** That is the actual proof this framework belongs in ARUMBU rather than beside it: it needed nothing the Constitution didn't already have a name for.
