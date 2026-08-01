Status: 🔵 Infrastructure design review — no code, no schema, no implementation. Extends the frozen Constitution (Product Philosophy, Product Foundation, Platform Integration Strategy, Governance & Responsibility Model, Institutional Policy Model, Universal Record Model) without contradicting or reopening any of it. Written directly against the findings in `ARUMBU Enterprise Architecture Audit v1.md` and the current state recorded in `RDIOS Master Roadmap v1.md`. Does not redesign Governance, Attention, Authority's resolution logic, or Tamizhi's behavioral philosophy — all four are treated here as correct and frozen; this document designs only the infrastructure they will eventually run on.

# ARUMBU Enterprise Foundation v1

## Why this document exists, and what it is not

The Audit found one thing over and over, in every one of its fifteen dimensions: **ARUMBU's design is sound; ARUMBU's implementation is a single-process, in-memory prototype.** Every gap the Audit named — no persistence, no real authentication, no structurally-enforced tenant isolation, no Policy Engine, no scale testing — is a gap in *infrastructure*, never a gap in the domain model, the governance model, or the philosophy underneath either. This document is the infrastructure answer to that finding, and nothing else.

This is not a redesign. Every section below opens by naming the exact frozen document it extends and states, explicitly, what it does not touch. Where this document is silent on something (a new domain, a new application, a change to how Attention tiers work, a change to how Authority resolves permissions, a change to what Tamizhi is allowed to say), that silence is deliberate — those questions are already answered, correctly, elsewhere, and reopening them is not this document's job.

**The one sentence this whole document has to remain true to:** infrastructure exists to make the Constitution *durable, safe, and fast at scale* — never to change what the Constitution says.

---

## 1. Minimum Enterprise Capabilities — the bar, named once, checked against every institution type

The founder's own list — Schools, Colleges, Hospitals, Manufacturers, NGOs, Temples, Trusts, Governments, Large Enterprises — spans radically different domains but, per the Product Foundation's own reasoning, wants the identical *platform* underneath radically different *content*. Testing each capability below against all nine institution types rather than against one produces the same answer every time: no institution on this list would place real operations, real people's data, or real financial records onto software that fails any of the eight items below. These are the floor, not a wishlist:

1. **Data survives a restart.** Not optional for any institution on the list — a hospital's patient roster or a government department's case files cannot live in a process that forgets them on redeploy. (§4)
2. **A real person's identity is verified before they can act.** Every institution on the list has legal, safety, or fiduciary reasons this cannot be a placeholder. (§2)
3. **One institution's data is structurally unreachable from another institution's session.** Non-negotiable the moment a second real institution's data exists on shared infrastructure. (§5)
4. **What happened, happened permanently, and cannot be quietly altered.** A trust's donation ledger, a government department's approval trail, a hospital's treatment record — all fail without this. (§6)
5. **The system stays legible and fast as records grow into the thousands and then millions.** A university's decade of enrollment records, a manufacturer's parts and work-order history. (§8, §10)
6. **The system can be observed, debugged, and recovered when something goes wrong**, by people other than whoever built it. (§13, §14)
7. **Secrets, uploads, and inputs are handled safely by default**, not by the discipline of whoever wrote a given screen. (§11)
8. **A decision can be measured against a written institutional rule, not only against who was allowed to make it.** Every regulated institution on the list (hospital, government, bank-adjacent trust) treats this as table stakes, not an enhancement. (§7)

Every remaining section of this document exists to satisfy exactly these eight, in the order an institution would actually discover they matter — starting with the two that block everything else.

---

## 2. Authentication

**Extends:** Product Foundation §3 (Identity is not tenant membership), §5 (Identity as the OS Layer precondition every other piece depends on); Platform Integration Strategy §3 (RDIOS's own sovereign Identity; SSO as portable identity, never shared backend). **Does not touch:** how permissions are resolved once identity is established (§3, Authority, is untouched here) or the `people` / `institution_memberships` schema separation, both already correctly frozen.

### 2.1 The credential layer

Authentication is a **pluggable credential-verification layer sitting in front of the existing, correct Identity resolution chain** (`person → active memberships → institution → permissions`, per `os/identity/session.ts`'s already-proven order). Nothing about that chain changes; what changes is *how* a request arrives with a verified person, replacing today's placeholder ("a cookie exists, therefore trust it") with a real credential check.

- **Email + Password.** The baseline every institution understands without training. Passwords are never stored — only a salted hash, using a real, current hashing algorithm (this document names the requirement, not the specific library, per "no implementation"). Password *policy* (minimum length, rotation, complexity) is itself Institution Configuration Layer data, not a hardcoded rule — a bank-adjacent Trust and a five-person Temple legitimately want different postures here, and per Platform Integration Strategy §7's own test ("if two institution types would reasonably want this to behave differently, it's configuration"), this is configuration, not platform code.
- **Google Login / Microsoft Login.** Federated identity providers, consumed exactly the way §2.5 (SSO) describes below — a thin, optional, *accepted* login path, never a required gate. A person's ARUMBU identity (`people` row) is never created *by* Google or Microsoft; it is only ever *authenticated through* them, matched to an existing or newly-provisioned `people` row by verified email. This preserves the Product Foundation's own separation: identity is not the same thing as tenant membership, and it is also not the same thing as whichever door a person happened to walk in through today.
- **OTP (one-time password, delivered out-of-band — email or SMS).** Two independent uses, kept conceptually distinct: (a) a standalone login method for institutions that prefer not to manage passwords at all (common in schools, NGOs, and temples with low technical staff capacity), and (b) the delivery mechanism for a step of 2FA (§2.4). The same primitive, two different roles — never two different implementations.
- **TOTP (time-based one-time password, authenticator-app driven).** The higher-assurance 2FA factor for institutions that need it — hospitals, governments, trusts. Enrollment produces a secret the person's authenticator app holds; ARUMBU never needs network access to verify a TOTP code, which matters directly for §2.10 (Offline Recovery) and for institutions with unreliable connectivity.
- **2FA, as a per-institution *policy*, not a per-person toggle.** Whether 2FA is required, optional, or required only for specific Areas of Responsibility (a Finance-Area holder always needs 2FA; a general Member never does) is exactly the kind of institution-specific rule the Institutional Policy Model already names a home for (§7 below) — 2FA enforcement is a Business Rule *compiled from* a Security Policy, not a hardcoded platform switch.

### 2.2 Session lifecycle

A session is a Record in the Universal Record Model's own sense — it has identity, institution-scoping (a session is always scoped to one active membership, per the existing `institutionCookieName` pattern), and a "now" (active, expired, revoked). Its lifecycle:

- **Created** at successful authentication, carrying: person, the specific membership/institution it was established for, an issued-at time, an expiry, and a device fingerprint (§2.3).
- **Refreshed** on continued activity, up to a maximum absolute lifetime — a sliding window that still cannot be extended forever, so a stolen-but-unused session eventually dies on its own even if never explicitly revoked.
- **Invalidated** explicitly by: the person signing out, an administrator revoking it (§3.7), a password change (invalidates every other session belonging to that person, a standard and expected security behavior), or a permission-relevant change to the membership itself (§3.8).
- **Never silently extended past its absolute maximum**, regardless of activity — the same "authority that does not expire on its own becomes authority nobody remembers to revoke" principle Governance §3 already states for Delegation, applied here to sessions rather than authority grants. This is not a new principle; it is the identical one, at a different altitude.

### 2.3 Remember device

A separate, longer-lived, narrower credential from the session itself — a device trust token that reduces *friction* (skip 2FA on a recognized device) without ever reducing the underlying authentication requirement to zero. Device trust is itself an institution-configurable policy (some institutions, per their own Security Policy, may disallow device-trust entirely for high-sensitivity Areas) and is always revocable independently of any specific session — a person can end trust for a lost laptop without touching their other active sessions.

### 2.4 Recovery, lockout, password reset

- **Lockout** is a rate-limited response to repeated failed attempts (mechanism detailed in §11.9), never an indefinite ban — it always names its own cooldown, and it is itself written to History as an institutional-safety-relevant fact ("Sam's account was temporarily locked after repeated failed sign-in attempts"), because a pattern of lockouts across an institution is exactly the kind of signal Tamizhi (§9) or a security-conscious admin should eventually be able to notice.
- **Password reset** is a time-boxed, single-use credential delivered out-of-band (email, matching the OTP mechanism above) — never a "security question" flow, which is a well-established weaker pattern. A password reset invalidates every existing session for that person, per §2.2's own rule.
- **Recovery from total lockout** (lost device, lost email access, lost authenticator) is the hardest real case and the one every institution on the founder's list will eventually hit. The correct answer follows directly from Governance's own Escalation mechanism (§7): recovery is not a magic "forgot everything" form — it is a **human-mediated Escalation**, where a person with no working credential requests recovery, and a Position holding a pre-named "Identity Recovery" Area of Responsibility (institution-configured, per §1's own capability list) verifies them out-of-band and issues a new enrollment. This reuses Governance unchanged rather than inventing a parallel identity-recovery mechanism — recovery is simply Escalation applied to authentication instead of to a stuck decision.

### 2.5 SSO, precisely as already scoped

Platform Integration Strategy §3 already settled the shape: **portable identity, never shared backend.** This document adds nothing to that decision — Google/Microsoft login (§2.1) and any future enterprise SSO (SAML/OIDC for a Large Enterprise customer with its own identity provider) are all instances of the same pattern: an external identity provider authenticates the *person*, ARUMBU's own Identity layer remains sovereign over *what that authentication is allowed to do here*, and no product's core data or session state ever lives with the external provider.

### 2.6 Invitation flow

Unchanged in shape from what already exists and is live-verified (invite → pending membership → accept → active membership) — this document names only the enterprise-scale extension: **bulk invitation**, for a school onboarding a thousand students or a manufacturer onboarding an entire shift at once, is the same single-invitation mechanism invoked many times, never a separate bulk-specific pathway — consistent with Governance's own discipline of one primitive applied at different scale rather than parallel mechanisms per scale.

### 2.7 Founder bootstrap / first administrator

Already correctly designed in Product Foundation §2 ("Day 0... the creator's own account as the first Position holder") and does not change. The one enterprise-scale addition: for an institution onboarded by a *platform operator* on the institution's behalf (a common enterprise sales-assisted onboarding pattern) rather than by the founder self-serving through the product, the bootstrap flow must still terminate in exactly the same state — one real, verified person holding the first admin-equivalent seat — never a platform-operator-held "backdoor" account. Per Product Foundation §2's own frozen language, there is no privileged path; a sales-assisted onboarding is the identical Day-0 flow, performed *with* the founder rather than automated *for* them, never a different mechanism.

### 2.8 Emergency governance access — distinct from account recovery

Where §2.4's recovery restores a specific *person's* ability to authenticate, this is the narrower, rarer case Governance §9 already names: an institution-wide crisis where the normal chain of who can authorize what is itself part of the problem (every Position holder with "Institutional Safety" authority is unreachable). This is not a new authentication mechanism — it is Governance §9's Emergency Governance activation path, which already requires a pre-declared, pre-named Area and an automatic expiry; this document's only contribution is naming that the *authentication* side of activating it must itself be held to a higher assurance bar (TOTP or equivalent, never a plain password) precisely because of how consequential activating it is.

### 2.9 Offline recovery

Real for institutions with unreliable connectivity — a rural school, a temple in a low-connectivity area, a manufacturer's factory floor. TOTP is deliberately the anchor here (§2.1) because it needs no network round-trip to verify a code once enrolled — an institution that has enrolled its key Positions in TOTP retains a working, real authentication path even during a connectivity outage, whereas email/SMS OTP structurally cannot. This is a real design constraint this document names explicitly so it isn't accidentally lost when the credential layer is eventually built: **TOTP support is not optional "nice to have" 2FA — for a meaningful slice of the founder's own target institution list, it is the only authentication method that keeps working when the network doesn't.**

---

## 3. Authorization

**Extends:** Governance & Responsibility Model v1 in full — every mechanism below is Governance's existing philosophy, given its infrastructure shape. **Does not touch:** the resolution logic itself (Areas of Responsibility, held by Positions, resolved fresh from the org graph) — that stays exactly as frozen. This section answers *how the resolver stays fast, current, and revocable at scale*, never *what it resolves*.

### 3.1 Role assignment

Not a new concept — "Role" here means exactly what Governance already means by holding a Position that carries Areas of Responsibility. What this section adds is the *administrative surface*: an institution needs a real, auditable act of assigning a Position (and therefore its Areas) to a person, already built (Appointment), and an equally real act of assigning which Areas a *given* Position carries in the first place — today implicit in Position creation, worth naming explicitly as its own auditable act at enterprise scale, since a large institution will change what a Position is responsible for far more often than it changes who holds it.

### 3.2 Inherited authority

Governance never described authority as flowing down an org tree automatically, and this document does not introduce that — Areas are held explicitly by a Position, never implied by reporting-line position alone. What legitimately needs naming is **escalation's own upward widening (Governance §7)**, which is the one place authority does move without an explicit new grant — restated here only to confirm the infrastructure (§3.5) that makes it fast doesn't accidentally turn it into something broader, like blanket managerial override.

### 3.3 Temporary delegation, time-limited authority

Governance §3 and §4 already fully specify Delegation and Temporary Authority (`AppointmentType`). This document's only addition: both need a **scheduled expiry mechanism** — a real background process (§10.9) that ends a Delegation or a `acting`/`temporary` Appointment automatically at its declared end time, rather than relying on it being noticed on next read. Per Governance §3's own non-negotiable rule ("authority that does not expire on its own becomes authority nobody remembers to revoke"), this is not an optional convenience job — it is the literal infrastructure that makes Governance's own stated guarantee true rather than aspirational.

### 3.4 Emergency authority

Infrastructure-identical to §3.3 — Governance §9's Emergency Governance is itself a time-boxed widening with a mandatory automatic end. The same scheduled-expiry mechanism (§10.9) serves both; this is not a second system.

### 3.5 Cross-institution authority

A genuinely new infrastructure question Governance did not need to answer, because Governance is written entirely inside one institution's boundary — and the Product Foundation already names the real case it must eventually cover: "a person can hold membership in more than one institution... without RDIOS inventing a special case." The correct extension: **authority is always resolved per-institution, independently, from that institution's own org graph — never unioned across institutions.** A consultant who is Finance Area holder at Institution A and an ordinary Member at Institution B has two completely separate, independently-resolved permission sets; nothing about holding authority in one institution ever grants or implies anything in another. This is not a new principle so much as the Tenant Architecture's own isolation boundary (Product Foundation §3), restated at the authority-resolution layer rather than only the data layer.

### 3.6 Revocation

Ending a Position holding, a Delegation, or a Temporary Appointment must **immediately** invalidate the specific authority it granted — Governance already requires this implicitly (§8, Transfer: "the person's holding of every Position they occupied" ends outright on offboarding). The infrastructure requirement this document adds: revocation cannot wait for the next natural permission-refresh cycle (§3.9) if the revoked authority is high-stakes — an offboarding, in particular, needs to be able to force an *immediate* recomputation, not rely on caching's normal staleness window.

### 3.7 Session invalidation

Directly linked to §3.6: when a person's authority changes in a way that matters (an Area is removed, a Position ends, an offboarding occurs), their **active sessions must be forced to re-resolve permissions on their next request**, not continue operating on a stale, cached permission set until the session naturally expires. This is the concrete mechanism that makes §3.6's "immediately" claim true rather than aspirational — a permission-version marker on the institution or the person, checked cheaply on each request, that invalidates any cached permission set computed before it changed.

### 3.8 Permission caching and refresh

The current implementation already resolves permissions fresh, per request (`resolvePermissions`, wrapped correctly in React's `cache()` for one request's lifetime, per the audit's own confirmed finding). At real scale, resolving the full org graph on every single request becomes expensive; caching is necessary but must never become a correctness risk. The resolution:

- Cache a person's resolved permission set **per institution**, keyed to a **permission-version marker** for that institution (incremented on any Position/Area/holding/Delegation change).
- A request compares its cached permission set's version against the institution's current version; a mismatch forces a fresh resolve. This gives cache-speed on the common case (nothing changed) and correctness on the case that actually matters (something did) — never a fixed time-to-live gamble that could leave a revoked permission live for an arbitrary window.
- This directly satisfies §3.6 and §3.7 without inventing a second mechanism: the same version-marker check *is* the session-invalidation-on-authority-change mechanism, just phrased once, reused twice.

---

## 4. Persistence

**Extends:** Product Foundation §3 (Tenant Architecture — one schema, every table institution-scoped) and §7 (naming the Audit engine's own append-only discipline as precedent). **Does not touch:** any application's `types.ts` shape — every domain's typed record stays exactly as designed; only *where that data lives* changes.

### 4.1 How providers evolve

The four-file discipline (`types.ts` → `provider.ts` → `mock-provider.ts` → `actions.ts`) already anticipated this moment correctly, whether or not it was built with today's audit in mind: **`provider.ts` is the interface every application already programs against; `mock-provider.ts` is one implementation of it.** The migration path is not a rewrite — it is writing a second implementation of the exact same interface, backed by real persistence, and switching which implementation `actions.ts` imports. No application's business logic, permission checks, or History-narration calls change at all, because none of them talk to the store directly — they talk to the provider interface, which is precisely the seam this document credits the original four-file discipline for having already built, accidentally-on-purpose, in service of a different immediate goal (keeping demo data simple).

### 4.2 What never changes

- Every `types.ts` record shape. The Universal Record Model's discipline (Identity, institution-scoping, a "now") was already designed data-model-first, independent of storage — this is exactly why it survives the transition untouched.
- Every `provider.ts` interface signature. This is the actual contract a real backing store must satisfy; it does not get to dictate new shapes back up into application code.
- Every permission check, History narration call, and Attention Contract implementation — none of them know or care whether the provider underneath is in-memory or real.

### 4.3 What changes

- The `mock-provider.ts` implementation of each interface is replaced by a real implementation reading/writing durable storage — a genuinely new file per domain, not an edit to the mock (the mock stays, valuable for tests and local development, per §16.5).
- `globalThis`-singleton state disappears entirely, replaced by real queries scoped by `institution_id` on every single table, with no exceptions — including lookup/reference tables that feel "global," exactly as the Product Foundation's Tenant Architecture already specifies for the eventual real schema.
- Institution isolation moves from "every mock function remembers to filter correctly" (the Audit's own named critical gap) to a structural guarantee enforced at the data layer itself (§5.2) — the single most important change this section makes.

### 4.4 Migrations

Schema migrations follow the discipline the Product Foundation already implies by naming `supabase/migrations/` as a first-class folder, starting at 0001, every table tenant-scoped from its first migration — this document adds only the operating principle: **migrations are additive and forward-only in the common case** (new tables, new nullable columns, new indexes), and any migration that could destructively affect existing institutional data (a column drop, a type narrowing) requires an explicit, reviewed, two-step pattern (add the new shape, backfill, verify, only then remove the old shape) — never a single migration that could silently lose or corrupt an institution's real memory, which the Product Philosophy already names as the one thing this platform exists to protect.

### 4.5 Can providers be swapped?

Yes, by design, per §4.1 — the provider interface is the actual product boundary, and this document treats "can a specific institution's data live somewhere other than the default shared store" as a legitimate future question (a Large Enterprise or Government customer may have real data-residency requirements that demand a dedicated or regionally-pinned backing store) without needing to answer it now. Because the interface, not the implementation, is what every application depends on, a per-institution or per-region provider implementation is architecturally possible without touching a single application.

### 4.6 Can institutions migrate databases?

Yes, and it should be understood as the same category of operation the Platform Integration Strategy already named for RDE's own historical data import (§2 of that document): "a one-time migration, not a standing integration." An institution moving from shared infrastructure to a dedicated store (or vice versa) is a deliberate, bounded, tooling-assisted export-then-import through the same provider interface every application already uses — never a special, parallel data path that bypasses the normal read/write contract.

### 4.7 Backups

Backups are a property of the persistence layer, not of any application — every table, being tenant-scoped from its first migration, means a backup is trivially institution-filterable, which matters directly for restoring a single institution's history without touching every other tenant's data (a real requirement the moment two institutions share infrastructure). Point-in-time recovery and backup cadence are covered in full in §14; this section names only the *architectural precondition* that makes institution-scoped backup and restore possible at all: one schema, every table `institution_id`-scoped, no exceptions.

---

## 5. Institution Isolation

**Extends:** Product Foundation §3 (Tenant Architecture, three-layer isolation enforcement already named there) and Platform Integration Strategy §6 ("No application reads another application's tables directly, ever"). **Does not touch:** which applications exist or what they read from each other — this section is purely about the *mechanism* that guarantees isolation holds even when a mistake is made in application code.

### 5.1 Institution boundaries, restated as infrastructure

The Product Foundation already names the correct three-layer defense (§3): row-level security as the real boundary, a tenant-resolution helper as a precondition to every other check, and a data-access wrapper that cannot compile against an unscoped query. Today, only the *middle* layer is real (`getIdentityContext()` resolves institution before permissions, verified directly in code) — the other two are currently unenforced, which the Audit correctly named as the platform's most consequential open risk. This document's only job here is to confirm that finding and state precisely what closes it: **isolation must be enforced at the data-access layer itself, structurally, so that a bug in application code cannot leak a row across tenants no matter what that code does.** No amount of correct application-level discipline is a substitute for this — discipline scales the way §5's own audit-finding names: badly, the moment a second engineer who wasn't present for this reasoning starts writing queries.

### 5.2 Cross-tenant protection

Two independent layers, deliberately redundant, matching the Product Foundation's own "never trust just one" instruction:

1. **Row-level enforcement** — every read and write is filtered by the requesting session's resolved institution, at the data layer, not the application layer. A query that omits an institution scope should be structurally impossible to execute successfully, not merely a convention a reviewer has to remember to check for.
2. **Application-layer scoping** — every provider function still takes `institutionId` explicitly (already true today) as defense-in-depth, not as the *only* defense it currently is.

### 5.3 Shared infrastructure, shared Search, shared AI, shared analytics

Per Product Foundation §3, one schema serves every institution — genuinely shared compute and shared code, never shared data visibility. This applies identically to every cross-cutting engine:

- **Search** (§8): the index itself may be shared infrastructure (one search cluster serving every institution, for cost and operational simplicity), but every query executed against it must carry the requester's institution scope as a mandatory filter applied *before* ranking, never as a post-filter on already-returned cross-tenant results — a subtle but critical distinction, since a post-filter still means unscoped data briefly existed in a response path.
- **Tamizhi** (§9): providers are shared infrastructure (the same OpenAI/Claude/Gemini account may legitimately serve every institution), but `TamizhiContext`'s existing, deliberate starvation to `{institutionId}` (already correctly designed in M13) is the enforcement mechanism — a provider structurally cannot read what it was never given, which is a stronger guarantee than "the provider promises not to."
- **Analytics/Reports**: institution-scoped by construction already (every snapshot computation takes `institutionId`); the only addition at enterprise scale is naming that any *platform-level* analytics (aggregate usage across institutions, for the platform operator's own business purposes) is a structurally distinct system, per Platform Integration Strategy §5's own table ("Platform-level Analytics... never exposed to a tenant institution"), and must never share a query path with anything a tenant institution can reach.

### 5.4 Data leakage prevention, as a standing discipline

Three concrete, checkable rules, each closing a specific leakage vector named implicitly across the documents above:

- No error message, log line, or stack trace visible to a person ever includes another institution's data or identifiers.
- No shared cache key (§8.6 for Search, §9.9 for Tamizhi) is ever constructed without the institution id as part of the key — a cache is exactly the kind of "shared infrastructure" where a missing scope silently becomes a leakage vector, since the cache doesn't know it's supposed to forget between tenants.
- Every export (§6.7, §14) is generated inside a single institution's own resolved context, never as a platform-level bulk operation that happens to be filtered afterward.

---

## 6. Audit Integrity

**Extends:** Audit Engine Design v1 in full — the shape (`subject_type`/`subject_id`, append-only, synchronous, two-layer read permission) is already correctly frozen. **Does not touch:** what makes an event audit-worthy, who narrates a summary, or the History read-surface concept — this section answers only how that already-correct design becomes durable and provably untampered.

### 6.1 Immutable history, for real

The Audit Engine Design already specifies no update policy on the audit table, and "corrections are new records, never edits." Today this is true only because nothing in application code happens to call an update — it is a convention, not a guarantee, exactly like §5's isolation finding. The infrastructure fix is identical in shape: **the storage layer itself must refuse update and delete operations on the audit table**, structurally, so immutability is a property of the data layer, not of every engineer's discipline forever.

### 6.2 Tamper detection — hash chaining

Named explicitly in the Audit Engine Design as "a real, legitimate future extension point... explicitly not designed in this pass." This document is where that pass happens, since institutional-grade trust for hospitals, governments, and regulated trusts genuinely requires it. The design: each audit record, at write time, includes a hash of its own content plus the hash of the immediately preceding record for that institution — a hash chain, not a blockchain (no distributed consensus is needed; a single tenant-scoped, append-only chain is sufficient and dramatically simpler). Any alteration to a past record, however small, breaks the chain from that point forward, and the break is detectable by anyone re-walking the chain — which is exactly the verification capability §6.8 names.

### 6.3 Cryptographic integrity, precisely scoped

The hash chain (§6.2) proves *nothing was altered after being written*. It does not, by itself, prove *who* wrote a given record was really who they claimed to be at that moment — that assurance already exists, correctly, through §2's authentication layer (`actor_person_id` is only ever set from a verified session). The two guarantees are complementary, not the same claim, and naming the distinction precisely matters for institutions (governments, banks-adjacent trusts) that will ask specifically which guarantee they're getting.

### 6.4 Legal audit / evidence chain

For institutions where an audit trail may need to stand up in a legal or regulatory proceeding (hospitals, governments, financial trusts), the hash chain (§6.2) is the technical foundation of an evidence chain, but the full requirement is broader: every record's provenance (§2.7 in the Universal Record Model — who or what created it) plus its position in the hash chain plus, where applicable, a digital signature (§6.5) together constitute a defensible claim that "this record existed, unaltered, at this time, created by this verified actor." This document names the requirement and its constituent pieces; the specific legal-admissibility bar varies by jurisdiction and institution type and is explicitly out of scope for an architecture document to adjudicate.

### 6.5 Digital signatures

An optional, per-institution-configurable strengthening (again, per Platform Integration Strategy §7's own test — a five-person Temple has no need for this; a Government department very plausibly does): a critical audit record (a formal Approval, a Policy activation, an Emergency Governance activation) can additionally carry a cryptographic signature from the deciding person's own key, giving that specific record a stronger, individually-verifiable provenance claim beyond "the session was authenticated." Named as a real, bounded extension of the audit record shape — never a requirement on every record, which would be exactly the kind of universal-property-that-isn't-actually-universal the Universal Record Model already warned against for Versioning (§3 of that document).

### 6.6 Export

An institution must always be able to export its own audit trail — a direct expression of the Product Philosophy's own "the institution's memory belongs to the institution" thread. Export respects the existing two-layer read permission (Audit Engine Design §"Who can read it") exactly — an export is a read, not a new privilege, and is itself an auditable act.

### 6.7 Verification

The hash chain (§6.2) makes independent verification possible without trusting ARUMBU's own runtime: given an exported chain and the institution's own record of its chain's most recent hash, anyone — an external auditor, a regulator, the institution itself — can re-walk the chain and confirm no record was altered, without needing privileged access to ARUMBU's live systems at all. This is the concrete capability that turns "we promise the history is real" into "here is how you check."

---

## 7. Policy Engine

**Extends:** Institutional Policy Model v1 in full — every concept below (Policy, lifecycle, hierarchy, exception path, Business Rules as compiled residue) is already correctly designed there. **Does not touch:** any of it. This section exists solely because the Audit found the Constitution's own named gap ("Policy... has no home yet") still genuinely unbuilt, and answers only the infrastructure question the Policy Model itself left open: *what does it take to make this real.*

### 7.1 Policy lifecycle, as infrastructure

The Institutional Policy Model's own §3 (Created → Reviewed → Approved → Superseded → Archived) is the complete lifecycle; nothing here adds a state. What this document adds is the infrastructure each state needs to be real rather than aspirational:

- **Created** needs a real Policy record type — Identity, institution-scoping, prose content, an authoring Position, a category (Purchasing, Travel, Leave, Asset Usage, Conflict of Interest, Institution-defined categories beyond the seeded set), exactly as already specified.
- **Reviewed** needs the scheduled-job infrastructure named in §3.3/§3.4/§10.9 — a policy's own stated review cadence becomes a real Act Now item on its review date only if something is actually watching dates and generating that Attention contribution, which is the identical scheduled-recurrence mechanism Delegation-expiry and Escalation-timing already need. One piece of infrastructure, three consumers.
- **Approved** needs nothing new — it consumes the Approval Chain mechanism already frozen in Governance §5, exactly as the Policy Model already specifies.
- **Superseded / Archived** need only the append-only discipline already correct for every Record type per the Audit Engine's own "corrections are new records, never edits" principle, applied to Policy the same way it's applied to everything else.

### 7.2 Activation

A Policy's *approval* (§7.1) and its *activation* (the moment it starts actually governing decisions) are worth distinguishing precisely, since the Policy Model's own hierarchy section (§7) already implies a gap between them for Emergency Policy specifically ("activated only by the same pre-named Area"). For an ordinary (non-emergency) Policy, approval and activation are the same moment by default — a Policy Chain's final approval is what makes it live. For an Emergency Policy, activation is a distinct, later event, gated by the pre-named Area exactly as Governance §9 already requires, and always paired with the automatic-expiry mechanism (§3.4) that returns the standing Policy to force.

### 7.3 Versioning

Already correctly named in the Universal Record Model (§3) as the one Record type that legitimately needs it, and already specified by the Policy Model's own "Superseded" state (§7.1 above). The infrastructure requirement: every version of a Policy remains permanently readable, and every decision an application ever measured against a Policy should be traceable to *which version* was in force at the moment of that decision — otherwise "what was our Travel Policy in 2019" (a question the Policy Model explicitly names as one the institution must always be able to answer) becomes unanswerable the moment a Policy has been superseded twice.

### 7.4 Approval

No new mechanism — Governance §5's Approval Chain, applied to Policy records exactly as the Policy Model already specifies (§3): "a policy's approval chain is configured per policy type." Named here only to confirm the infrastructure requirement is nothing more than "Policy must be a valid subject type for an Approval Chain," which the Universal Record Model's own checklist already demands of every Record type.

### 7.5 Retirement

Same as Archived (§7.1) — an institution's decision that a Policy no longer applies, permanent, append-only, never deleted.

### 7.6 Exception handling

The Policy Model's §9 already specifies the exception path in full — a named Area of Responsibility may explicitly approve a deviation, with a recorded reason, itself an ordinary, auditable, governed decision. The infrastructure requirement: an Exception is its own Record (Identity, institution-scoped, referencing the Policy it deviates from and the specific decision it applies to), not a free-text note buried inside the decision it exempts — because the Policy Model's own closing insight (§9, §6) is that *a pattern of exceptions* is itself a meaningful institutional signal (worth Tamizhi noticing, per §6 of that document — "this is the fourth exception request against the Travel Policy this quarter"), and a pattern can only be detected in something structured enough to query, never in scattered free text.

### 7.7 Policy inheritance

The Policy Model's §7 hierarchy ("narrow freely, downward; never contradict, upward") is the complete rule; the infrastructure requirement is a **conflict-detection check** run whenever a subordinate Policy is created or a superior Policy is edited — comparing the subordinate's stated constraints against the superior's, and surfacing any detected loosening or contradiction as an Act Now item for whoever holds the Area responsible for reconciling it, exactly as the Policy Model already specifies ("never something software resolves silently by picking a side"). This is checking, not deciding — the software's only job is to notice a conflict exists and hand it to a human, never to resolve which Policy wins.

### 7.8 Business Rules generation

The Policy Model's own central architectural claim (§1, §"Where this leaves the current architecture"): "a Business Rule is the compiled, machine-readable residue of a Policy — never the Policy itself." The infrastructure requirement this implies: every Business Rule an application actually reads (an approval threshold, a required-quotes count) must be **derived from, and traceable back to, a specific Policy version** — never authored independently as a bare number with no Policy behind it, which the Policy Model explicitly names as "exactly the 'hidden inside code' failure mode this whole document exists to prevent, just moved one layer up." Concretely: a Business Rule record carries a reference to the Policy (and Policy version) it was extracted from; an application reads the Business Rule for speed, but an auditor, or Tamizhi, can always walk back from the Rule to the Policy that justifies it.

---

## 8. Search Evolution

**Extends:** the existing `engines/search/` provider-registry pattern (Platform Integration Strategy, already correctly designed as "a more capable provider registers the same way every other one does"). **Does not touch:** the ranking philosophy itself ("deliberately simple... nothing AI-driven, nothing semantic, nothing vector-based" — M12's own frozen instruction) or the ten-application search scope.

### 8.1 The core problem, named precisely

The Audit's own direct code inspection found the actual defect: `searchInstitution` and `browseInstitution` both rebuild a full result set from every domain's full live read, in-process, on every single call — a full scan dressed as an index. This is the one finding in this entire document with the least ambiguity about what "done" looks like: a real index, built once, updated incrementally, queried in sublinear time.

### 8.2 Indexes

A persisted, institution-scoped index — one row per searchable Record, carrying exactly the fields `SearchResult` already defines (icon, title, type, description, status, lastUpdatedAt, href, keywords) plus whatever the backing store needs for fast text and filter matching. The adapters that build this today (`indexPeople`, `indexWork`, etc.) do not disappear — their job changes from "compute this on every request" to "compute this once, when the underlying Record changes."

### 8.3 Incremental indexing

Driven by the same Events mechanism the Audit Engine already listens to (Product Foundation §7: "every domain write emits an event... anything downstream reacts to it"). Search becomes a second listener on the identical event stream Audit already subscribes to — a Record's creation or update emits an event; Search's indexer reacts by upserting exactly that one Record's index entry, never rebuilding anything else. This reuses the Events engine unchanged rather than inventing a parallel indexing-trigger mechanism.

### 8.4 Background indexing

For the cases incremental indexing alone doesn't cover — a bulk import (§4.6, an institution migrating data in), a schema-shape change to what's indexed, or recovering from a detected drift between the index and the source of truth — a background reindex job (§10.9's scheduled-worker infrastructure) that rebuilds one institution's index from scratch, off the request path, without blocking or degrading live search for anyone.

### 8.5 Permissions filtering

Today's isolation is institution-scope only; at enterprise scale, some institutions will want narrower visibility (a Department-scoped search result set for a Department-scoped role). This is not a new principle — the Audit Engine Design's own two-layer read permission (subject-level respect, plus an oversight grant for broader visibility) is the exact shape to reuse here: a search result is only ever returned to a person who could already read that record through its own normal permission check, applied as a filter *before* ranking (§5.3's own leakage-prevention rule), never as a courtesy post-filter.

### 8.6 Ranking

Unchanged from M12's frozen design (exact-match, starts-with, contains, keyword, description, recency-as-tiebreaker) — "nothing AI-driven, nothing semantic, nothing vector-based" stays exactly as instructed. The only enterprise addition worth naming: at large record counts, ranking must run *against the index*, not against a freshly materialized full result set, or the ranking step itself becomes the new bottleneck even after §8.1-§8.4 fix retrieval.

### 8.7 Caching

A search result page for an identical query, by an identical person, in an identical institution, within a short window, is a legitimate cache candidate — keyed on (institution id, person id or resolved permission-version, query, filters), respecting §5.4's rule that no shared cache key ever omits institution scope. Cache lifetime should be short and permission-version-aware (§3.8) rather than time-based alone, so a person's search results never lag behind a permission change they'd expect to see reflected immediately.

### 8.8 Scaling to millions of records

Follows directly from §8.1-§8.4: once retrieval is index-backed and incremental, and ranking runs against the index rather than a materialized list, the scaling question becomes a property of the chosen index technology's own horizontal-scaling story, not of anything specific to ARUMBU's design — the architecture no longer forces an in-process full scan regardless of how the underlying index is deployed.

---

## 9. Tamizhi Infrastructure

**Extends:** `engines/tamizhi/` exactly as M13 built it — `TamizhiProvider`, `TamizhiContext`, the store, the accept/dismiss/defer actions. **Does not touch, at all:** Institution Intelligence Principles v1 (when Tamizhi speaks, stays silent, recommends, asks, refuses), the Recommendation model's shape, or any of Tamizhi's behavioral philosophy — this section is infrastructure underneath an already-correct, already-frozen behavioral contract, exactly as the task instructs.

### 9.1 Provider abstraction, confirmed and extended

M13's `TamizhiProvider` interface is already correctly shaped for this — `name` plus `generateRecommendations(context)`, nothing more. This document's contribution is naming the **provider registry** explicitly as a first-class piece of infrastructure (mirroring Search's own provider-registry pattern, per Platform Integration Strategy §4's own observation that Search and Tamizhi both "register the same way every other provider already does"): an institution selects, or is assigned, an active provider by name; the platform never hardcodes which one runs.

### 9.2 OpenAI / Claude / Gemini / Local models

Each is a separate, real implementation of the same `TamizhiProvider` interface `rule-engine-v1` already proves out. This document names the one infrastructure requirement each of them shares, precisely because M13's `rule-engine-v1` is the only implementation that has ever existed and therefore never had to prove it: **every provider receives only `TamizhiContext` (`{institutionId}`) and whatever it chooses to read through Search and Reports/Analytics — never a raw database handle, never another application's mock-provider or real provider directly.** This was true by construction for the rule engine because it never needed more; a model-backed provider that "just needs a little more context" is exactly the pressure point named in the Audit (§3) as untested, and this document's answer is that the interface does not widen to relieve that pressure — a provider that needs data outside Search/Reports/Attention/Authority/History gets that data by those doors being extended (a legitimate future Search or Reports capability), never by Tamizhi being granted a side channel.

### 9.3 Offline mode

Already structurally guaranteed by Institution Intelligence Principles §8 ("every screen... continues to work correctly with Tamizhi entirely disconnected") and verified by construction in M13 (zero upstream imports from `engines/tamizhi/`). The infrastructure requirement this document adds: when no provider is reachable (network failure, provider outage, or an institution that has deliberately configured no active provider), `ensureRecommendationsGenerated` must fail *silently and cheaply* — no error surfaced to a person, no retry storm, simply zero new Recommendations that cycle, exactly the same "silence is the correct, ordinary outcome" posture Institution Intelligence Principles §2 already requires of Tamizhi generally, now also required of its own infrastructure failure mode.

### 9.4 Provider failover

A genuinely new infrastructure question the Constitution didn't need to answer at M13's single-provider scale. The correct shape, consistent with §9.1's registry: an institution may configure a primary and one or more fallback providers; if the primary fails or times out, the registry tries the next, silently, up to a bounded number of attempts, then falls back to §9.3's offline behavior rather than blocking. Failover is invisible to every downstream consumer (Home's `TamizhiObservations`, the accept/dismiss/defer actions) because they only ever see the resulting Recommendation, never which provider produced it — exactly Platform Integration Strategy §4's own stated goal ("the platform should never know which provider produced a recommendation").

### 9.5 Rate limiting

Two distinct concerns, both real: protecting the platform's own cost exposure to a paid model provider, and protecting a single institution from either accidentally or maliciously triggering excessive generation. Rate limits apply per-institution (never platform-wide, which would let one busy institution starve every other tenant — a direct extension of §5's isolation principle to compute, not just data) and are a Business Rule an institution's plan/tier can configure, not a hardcoded platform constant.

### 9.6 Caching

A Recommendation, once generated for a given `ruleKey`/provider/evidence combination, should not be regenerated on every single Home page load — the existing dedupe (`hasRecommendationForRule`) already prevents *duplicate* Recommendations, but does not, by itself, prevent redundant *generation calls* to a paid provider for a Recommendation that would just be deduped away anyway. Caching here means checking dedupe *before* calling the provider, not just before persisting the result — a small, important reordering that directly controls real cost at scale.

### 9.7 Prompt governance

For any real model-backed provider (§9.2), the exact instructions sent to that model are themselves worth institutional-grade discipline: version-controlled, reviewable, and — critically, per Institution Intelligence Principles' own closing test — auditable against "would a sharp, well-liked colleague have said exactly that." A prompt template is infrastructure the platform owns and controls, never something an institution or a provider implementation quietly varies unaccountably; this is the mechanism that keeps every future model-backed provider actually honoring Institution Intelligence Principles rather than merely being trusted to.

### 9.8 Conversation memory

Named explicitly here to rule it out, not to design it: Institution Intelligence Principles and the Product Philosophy both already forbid Tamizhi from becoming a conversational interface ("no chat window... no conversation interface"). There is, deliberately, no conversation to remember. What *does* need a memory-shaped answer is narrower and already covered: a Recommendation's own Evidence (already in the M13 model) is the complete context a provider needs to justify itself, and the dedupe key (§9.6) is what prevents re-litigating the same evidence repeatedly — neither of these is "conversation memory" in the sense the term usually means, and this document deliberately does not build a session-spanning context window for Tamizhi, because the Constitution gives it nothing to remember across sessions in the first place.

### 9.9 Recommendation dedupe, at infrastructure scale

The Master Roadmap's own Technical Debt Register already names the real limitation precisely: dedupe is per-`ruleKey`, not per-occurrence, so a genuinely new, unrelated stuck approval matching the same rule as a previously-dismissed one won't generate a fresh Recommendation. The infrastructure fix, consistent with the Roadmap's own suggestion: dedupe keys should be derived from a hash of the **specific evidence records** a Recommendation cites, not merely the rule that produced it — two Recommendations from the same rule with genuinely different evidence are different Recommendations and should both be able to exist; two Recommendations from the same rule with identical evidence are the same Recommendation and should dedupe. This is a refinement of the existing mechanism, not a new one, and it also directly reduces §9.5/§9.6's cost exposure by avoiding wasted regeneration of Recommendations that would dedupe anyway.

---

## 10. Scalability

**Extends:** the Product Foundation's own layering, which the Audit confirmed is the *right shape* to eventually scale — this section names what closes the gap between right shape and proven behavior. **Does not touch:** any application's logic.

### 10.1–10.4: 10 / 100 / 1,000 / 100,000 users

The honest scaling story is a single curve with two real discontinuities, not four independent tiers:

- **10–100 users, one institution or a handful**: the current architecture, even persisted (§4) but still single-process, is genuinely adequate. This is not a meaningful scaling challenge.
- **The first real discontinuity, somewhere before 1,000 users or a few dozen institutions**: the in-memory, single-process model (§4.3) becomes structurally disqualifying, independent of code quality — this is the persistence migration (§4), not a performance tuning exercise, and it is the single highest-leverage item in this entire document because nothing past it is reachable without it.
- **The second real discontinuity, at 100,000 users / thousands of institutions**: horizontal scaling (§10.6) and background-worker offloading (§10.9) become required, not optional — a single server process, however well-optimized, cannot serve this tier regardless of how good its data layer is.

### 10.5: 10 million records

Directly answered by §8 (Search) and §4 (Persistence) together — an indexed, incrementally-updated Search plus a real, indexed persistence layer scoped correctly per tenant is what makes 10 million records a normal operating condition rather than a crisis. History's own unbounded growth (named in the Audit as a specific, concrete risk) needs the identical treatment: indexed queries, pagination on every list-returning read path, and a named retention/archival policy (raw records never deleted, per the Audit Engine's own append-only guarantee, but older records may move to cheaper, still-queryable cold storage — an operational decision, not an architectural compromise of immutability).

### 10.6: Multiple regions, multiple servers, horizontal scaling

Follows directly from §4.5's own finding: because every application depends on the provider *interface*, not a specific process holding state in memory, running multiple stateless application server instances behind a load balancer, all reading the same durable, shared store, requires no application-layer change at all — this is the concrete payoff of having kept the four-file discipline honest. Multi-region specifically becomes a data-residency and latency question (which region's copy of an institution's data is authoritative, and how replication/failover between regions works) rather than an application-architecture question — named as a real future requirement for the Government/Large-Enterprise end of the founder's own list, not designed in full here, since it depends on choices (which backing store, which regions) this document deliberately leaves unmade.

### 10.7 Background workers

A new, named piece of infrastructure this document introduces because at least four other sections in this document depend on it existing: scheduled Delegation/Escalation/Emergency-authority expiry (§3.3), scheduled Policy review surfacing (§7.1), background Search reindexing (§8.4), and rate-limit-respecting Tamizhi generation (§9.5). One worker infrastructure, several consumers — consistent with this document's own repeated pattern of naming shared infrastructure once rather than per-feature.

### 10.8 Queues

The mechanism background workers actually run against — a durable job queue that survives a worker restart (unlike today's in-memory everything), with retry and backoff for transient failures (a provider timeout, a momentary store unavailability) and dead-lettering for jobs that fail repeatedly, so a stuck job degrades loudly (visible to an operator via §13) rather than silently disappearing.

### 10.9 Event bus

The mechanism Search's incremental indexing (§8.3) and the Audit Engine's synchronous write guarantee (already frozen) both depend on — every domain write already emits an event, per the Product Foundation's own §7 description of the Events engine; this document's only addition is naming that at horizontal scale (§10.6), "every domain write emits an event" needs a real, durable event transport between the write and its listeners (Audit, Search, Notifications) rather than an in-process function call, so that a listener's own downtime never causes a domain write to lose events it was supposed to react to.

---

## 11. Security

**Extends:** the Authentication (§2) and Authorization (§3) sections above, plus Product Foundation §3's own isolation requirements. **Does not touch:** anything about what any application does — this section is purely about protecting the platform from misuse regardless of what any application intends.

### 11.1 Encryption

Data at rest: every durable store (§4) encrypted at rest by default, no institution opt-out — this is infrastructure-level, never configuration, consistent with Institutional Policy Model's own distinction between what an institution may configure and what the platform guarantees unconditionally. Data in transit: every connection, from a browser to the platform and from the platform to any backing store or provider, encrypted, no exceptions, no legacy fallback.

### 11.2 Secrets

Provider API keys (§9.2), signing keys (§6.5), and any credential the platform itself holds live in a dedicated secrets store, never in application code, environment files committed to a repository, or database columns readable by ordinary application queries — a distinct trust boundary from every institution's own data.

### 11.3 Key rotation

Every credential named in §11.2 has a defined rotation cadence and a documented rotation procedure that does not require downtime — a key that cannot be rotated without an outage will, in practice, never be rotated, which defeats the point of having a rotation policy at all.

### 11.4 Uploads

Every domain that accepts an attachment (Documents, per the M10 build; Finance's receipts, per the Phase 1 finance plan already executed on the RDE side) treats an upload as untrusted input by default: validated against an explicit allow-list of file types and a size ceiling before acceptance, never inferred loosely from a filename or a client-supplied content-type header alone.

### 11.5 Virus scanning

Every upload is scanned before it becomes retrievable by any other person in the institution — a real, named requirement for any institution handling documents from external parties (a hospital's outside referral, a government department's citizen-submitted form, a manufacturer's vendor invoice), not merely a hygiene nicety.

### 11.6 Signed URLs

Consistent with the Finance Phase 1 plan's own already-correct precedent (a private bucket, short-TTL signed URLs minted on read, never a stored permanent link) — this document generalizes that pattern as the platform-wide standard for every attachment across every domain, not a Finance-specific choice.

### 11.7 CSRF / XSS / SQL Injection

Named explicitly because the audit brief asks for them by name, even though each is substantially a property of *how* the eventual real implementation is built rather than something this architecture document can design away in the abstract: server-rendered forms and mutating actions require anti-CSRF protection on every state-changing request; any user-supplied content ever rendered back to a screen (a Contact's name, a Document's description, a Comment) is escaped by default, never trusted as raw markup; every real data-layer implementation (§4) must use parameterized queries exclusively, with no code path that ever concatenates user input directly into a query string. These are baseline engineering discipline, named here as non-negotiable requirements of the eventual real implementation, not as something requiring further architectural design.

### 11.8 Rate limits

Applied at multiple layers, each protecting something different: per-account (§11.9, brute-force prevention), per-institution (§9.5, cost and fairness for Tamizhi and Search), and per-IP or per-device at the authentication boundary specifically (protecting against distributed credential-stuffing attempts that don't cleanly map to any one account).

### 11.9 Brute-force prevention

Directly implemented by §2.4's lockout mechanism plus rate limiting on the authentication endpoint specifically — a failed-attempt counter, a cooldown that grows with repeated failures, and (for TOTP specifically) a check that rejects rapid-fire guesses even within a code's own valid time window.

### 11.10 Device trust

Already specified in §2.3 — named again here only to confirm it is understood as a security control (reduces friction without reducing the underlying requirement to zero) rather than a convenience feature with no security posture of its own.

### 11.11 Security audit

A recurring, not one-time, practice — a real penetration test and dependency-vulnerability scan performed before any institution in a regulated vertical (hospital, government, financial trust) is onboarded, and on a defined recurring cadence afterward, with findings tracked the same disciplined way this platform already tracks its own Technical Debt Register (named, categorized, never silently dropped).

---

## 12. Performance

**Extends:** nothing new architecturally — every item below is standard practice this document names as a requirement, consistent with the already-correct `cache()`-wrapped identity resolution the Audit specifically credited as evidence the team already does this well when it notices the need.

- **Cold start**: the application server's own startup time, and — separately — a new institution's *first* page load, which per the Institution Setup Experience's own "you're the only one here" framing should feel deliberate and calm rather than slow.
- **Caching**: covered per-subsystem above (§3.8 permissions, §8.7 search, §9.6 Tamizhi) — named here only to confirm the platform-wide rule these all share: every cache is scoped by institution and invalidated by a real correctness signal (a version marker), never by time alone where correctness matters.
- **Optimistic updates**: for common, low-risk mutations (marking a Recommendation dismissed, a small form edit), the UI may reflect the change immediately, reconciling silently if the server disagrees — never used for anything the Visual Design System already reserves a Dialog for (irreversible actions), where waiting for real confirmation is the correct, calmer choice.
- **Background refresh**: data that's cheap to recompute and often slightly stale (a Be Aware widget's count) can refresh silently behind the scenes rather than blocking a page load on a fully fresh read every time.
- **Realtime updates / notifications**: named as a real future capability (a second person's action appearing on your screen without a manual refresh) that rides directly on the event bus (§10.9) already designed for Search and Audit — a third listener on the same stream, not a new mechanism.
- **Lazy loading, Server Components, streaming**: standard modern rendering discipline for a Next.js-based platform at real scale — named as an implementation requirement of whichever routes carry the most data (Search results, large tables, History) rather than architecturally designed in more detail here, since this is squarely an implementation concern once persistence (§4) exists to make it meaningful.

---

## 13. Observability

**New infrastructure, entirely** — nothing in the Constitution names this because nothing built so far has needed it; a single-developer, single-process prototype is its own observability. At enterprise scale it is not optional.

- **Logging**: structured, institution-scoped where relevant (never institution-*revealing* in a way that violates §5.4's leakage rules), covering every mutating action and every Authority decision.
- **Metrics**: request latency, error rates, queue depth (§10.8), search and Tamizhi latency, permission-cache hit rate (§3.8) — the concrete numbers that turn "we believe this scales" into something measured.
- **Tracing**: a single request's path across the layers named in the Product Foundation (Identity → Authority → Application → Attention composition) traceable end-to-end, which matters specifically because Home's own `Promise.all` composition (already live, already correctly parallel) becomes genuinely hard to reason about at scale without trace visibility into which of its several concurrent calls is slow.
- **Alerts**: on the things that matter most given everything above — queue backlog, elevated authentication failure rate (a brute-force signal, §11.9), audit-write failure (a violation of the Audit Engine's own synchronous-write guarantee), provider failover exhaustion (§9.4).
- **Health checks**: a real, honest liveness/readiness signal per service, consumed by whatever deploys and scales the platform (§15).
- **Error reporting**: every unhandled error captured with enough (institution-safe) context to diagnose without needing to reproduce it live.
- **Performance dashboards**: the human-facing view over the metrics above — this is the platform operator's own equivalent of Home: what deserves attention right now, applied to the platform's own health rather than an institution's.

---

## 14. Disaster Recovery

**Extends:** §4's persistence design and §6's audit-integrity design directly.

- **Backup**: automated, regular, institution-filterable (§4.7) backups of every durable store.
- **Restore**: a tested, not merely assumed, ability to restore from backup — a backup that has never been restored is a hypothesis, not a guarantee.
- **Point-in-time recovery**: the ability to restore a store to its exact state at a specific past moment, which the append-only audit trail (§6) makes independently verifiable — after any restore, the audit chain (§6.2) itself proves whether the restored state is genuinely consistent with the institution's own recorded history.
- **Multi-region**: named in §10.6 as a real future requirement for specific institution types, not designed in full here.
- **Disaster mode**: a defined, honest degraded-service posture (read-only, or a subset of applications available) rather than a full outage, for the specific window during a real incident — consistent with the Product Philosophy's own "calm should matter" principle, extended to what the platform itself does under genuine stress, not only what an institution sees on an ordinary day.
- **Offline mode**: distinct from §2.9's authentication-specific offline recovery — this is the broader question of what, if anything, a person can still do when the platform's backend is genuinely unreachable. Named honestly as a real, unresolved product question (a native or PWA-shaped client with local caching is one plausible future answer) rather than assumed solved by this document.

---

## 15. Deployment Architecture

- **Development / Testing / Staging / Production**: four genuinely separate environments, each with its own data (never production data copied into a lower environment without deliberate, audited anonymization) and its own credentials (§11.2) — never shared secrets across environment boundaries.
- **CI/CD**: every change passes the same verification discipline the Master Roadmap's own §5/§9 already requires of every milestone (typecheck, lint, build, and — newly, at this scale — automated tests, §16.5) before it can reach staging, and staging before production, with no manual bypass for a change under deadline pressure.
- **Environment separation**: reinforced by §5's own isolation discipline — an environment boundary is conceptually the same kind of boundary as a tenant boundary, and deserves the same "never trust just one layer" defense.
- **Secrets**: per §11.2, environment-scoped, never shared across the boundary named above.
- **Feature flags**: the mechanism that lets a genuinely new capability (a new Tamizhi provider, a new Search ranking tweak) roll out to one institution, or a small cohort, before every institution — directly useful for the Master Roadmap's own stated discipline of building one working slice at a time, now extended to *rollout*, not just build order.
- **Rollbacks**: any deployed change must be revertible without requiring a destructive data migration to already have run — the same "additive, forward-only, two-step for anything destructive" discipline §4.4 already names for schema migrations, extended to code deploys generally.

---

## 16. Developer Architecture

**Extends:** Product Foundation §9 (Extension Architecture) directly — every item below is that section's own already-frozen mechanism, given enterprise-scale shape.

### 16.1 Plugin / extension model

Already fully specified in Product Foundation §9: implement the Attention Contract, register a Navigation manifest entry, implement the Search provider interface, consume the Shared Engine Layer, own tenant-scoped tables. This document adds nothing new here — it is already correctly designed, and the only infrastructure this document names as a precondition is that §4's persistence layer must exist for a real extension's own tables to have somewhere durable to live.

### 16.2 Provider model

Already proven twice over — Search's adapter pattern and Tamizhi's `TamizhiProvider` — and this document's own §8/§9 extend both without changing the pattern itself. The one addition: a **provider registry as a real, first-class piece of infrastructure** (named explicitly in §9.1), rather than the implicit "there's currently only one, so there's nothing to register" state both engines are in today.

### 16.3 API versioning

Directly named by Platform Integration Strategy §5's own table: "Public API... not a new product — the existing Application Layer, exposed over HTTP instead of a page." The infrastructure requirement this implies: because the Application Layer's provider interfaces (§4.1) are the real contract, a Public API versions *that* contract, not a separate one invented for HTTP specifically — an API version bump corresponds to a genuine breaking change in a provider interface's own shape, keeping "one backend, the API is a client of the same interfaces every screen already calls" (Platform Integration Strategy's own words) true in practice, not just in the diagram.

### 16.4 SDK

A thin, generated or hand-maintained client library over the Public API (§16.3) — explicitly named as belonging to the Developer Platform, per Platform Integration Strategy §5's own table ("exists to serve people building *for* ARUMBU, not people using one"), not something this document designs further.

### 16.5 Automation

Already named in Platform Integration Strategy §5's table as "not a new engine — a rule that reacts to Events and creates or assigns Work Items." Directly enabled by §10.9's event bus once it exists; no new mechanism required beyond what that section already names.

### 16.6 Testing strategy

The one genuinely new discipline this document introduces, because nothing built so far has needed it at this rigor: every provider interface (§4.1) should have a **shared contract test suite** — one set of behavioral tests written once against the interface, run against *every* implementation of it (the mock, the real persisted version, any future swapped-in regional variant). This is the single testing investment with the highest leverage specifically because of how disciplined the four-file pattern already is: a contract test suite written once catches an entire class of "the real provider quietly behaves differently from the mock it replaced" bugs before they reach any institution, across every domain, for the cost of writing it once per interface rather than once per implementation.

---

## 17. Production Readiness Checklist

☐ **Authentication** — Complete
&nbsp;&nbsp;☐ Email + password ☐ Google login ☐ Microsoft login ☐ OTP ☐ TOTP ☐ 2FA (policy-driven) ☐ Session lifecycle (create/refresh/invalidate) ☐ Remember device ☐ Lockout + rate limiting ☐ Password reset ☐ Human-mediated recovery (Escalation-based) ☐ Invitation flow at bulk scale ☐ Founder bootstrap (sales-assisted path verified identical to self-serve) ☐ Emergency governance access (high-assurance) ☐ Offline (TOTP) recovery path

☐ **Authorization** — Complete
&nbsp;&nbsp;☐ Role/Area assignment surface ☐ Escalation infrastructure (scheduled) ☐ Delegation expiry (scheduled) ☐ Temporary/Emergency authority expiry (scheduled) ☐ Cross-institution isolation of resolved authority ☐ Immediate revocation on offboarding ☐ Session invalidation on authority change ☐ Permission-version-based caching and refresh

☐ **Persistence** — Complete
&nbsp;&nbsp;☐ Real backing store provisioned ☐ Every provider interface has a real (non-mock) implementation ☐ Every table institution-scoped from its first migration ☐ Migration discipline (additive, two-step destructive) ☐ Provider-swap capability verified ☐ Institution data-migration tooling ☐ Automated, institution-filterable backups

☐ **Institution Isolation** — Complete
&nbsp;&nbsp;☐ Row-level enforcement at the data layer (not just application-layer filtering) ☐ Data-access wrapper that cannot compile unscoped ☐ Search isolation verified pre-ranking ☐ Tamizhi context isolation verified (structural, not promised) ☐ Platform-level analytics structurally separated from tenant-visible surfaces ☐ No shared cache key without institution scope ☐ No cross-tenant data in logs/errors

☐ **Audit Integrity** — Complete
&nbsp;&nbsp;☐ Storage-level immutability (update/delete refused, not just unused) ☐ Hash-chained tamper detection ☐ Digital signatures on critical record types (configurable) ☐ Institution-initiated export ☐ Independent, offline chain verification tooling

☐ **Policy Engine** — Complete
&nbsp;&nbsp;☐ Policy as a real Record type (not just Business Rules) ☐ Scheduled review-date surfacing ☐ Approval Chain applied to Policy ☐ Versioning with full history ☐ Exception path as a structured, queryable Record ☐ Hierarchy conflict detection ☐ Business Rules traceable back to source Policy version

☐ **Search** — Complete
&nbsp;&nbsp;☐ Real, persisted index (no full-scan-per-request) ☐ Incremental indexing via Events ☐ Background reindexing ☐ Permission-filtered before ranking ☐ Ranking unchanged (ordinal, non-AI) but index-backed ☐ Permission-version-aware caching ☐ Verified at millions-of-records scale

☐ **Tamizhi Infrastructure** — Complete
&nbsp;&nbsp;☐ Provider registry (beyond a single hardcoded implementation) ☐ At least one real model-backed provider implementing the unchanged interface ☐ Offline/no-provider silent degradation ☐ Failover across configured providers ☐ Per-institution rate limiting ☐ Generation-avoiding cache (dedupe-before-call) ☐ Versioned, reviewable prompt templates ☐ Evidence-based, per-occurrence dedupe

☐ **Scalability** — Complete
&nbsp;&nbsp;☐ Stateless application servers behind a load balancer ☐ Background worker infrastructure ☐ Durable job queue with retry/dead-letter ☐ Event bus (durable, not in-process) ☐ Verified at 100,000-user / 10-million-record scale ☐ Multi-region strategy named (if applicable to target customers)

☐ **Security** — Complete
&nbsp;&nbsp;☐ Encryption at rest and in transit, no opt-out ☐ Dedicated secrets store ☐ Documented, zero-downtime key rotation ☐ Upload validation (type + size allow-list) ☐ Virus scanning before retrievability ☐ Signed URLs, short TTL, no permanent links ☐ CSRF protection on all mutating requests ☐ Output escaping by default ☐ Parameterized queries exclusively ☐ Multi-layer rate limiting ☐ Brute-force lockout ☐ Device trust as a real, revocable control ☐ Recurring third-party security audit

☐ **Performance** — Complete
&nbsp;&nbsp;☐ Cold-start budget measured and met ☐ Correctness-driven (not time-only) caching everywhere it matters ☐ Optimistic updates on low-risk mutations only ☐ Background refresh for stale-tolerant widgets ☐ Realtime updates via event bus ☐ Server Components / streaming applied to heaviest routes

☐ **Observability** — Complete
&nbsp;&nbsp;☐ Structured, leakage-safe logging ☐ Core metrics (latency, errors, queue depth, cache hit rate) ☐ End-to-end request tracing ☐ Alerting on the named critical signals ☐ Real health checks per service ☐ Error reporting with safe context ☐ Operator-facing performance dashboards

☐ **Disaster Recovery** — Complete
&nbsp;&nbsp;☐ Automated, tested backups ☐ Tested (not assumed) restore procedure ☐ Point-in-time recovery, chain-verified afterward ☐ Documented disaster-mode degraded posture ☐ Offline-mode question explicitly answered (even if "not yet supported")

☐ **Deployment Architecture** — Complete
&nbsp;&nbsp;☐ Four genuinely separate environments ☐ CI/CD gate matching the Roadmap's own Definition of Done ☐ No shared secrets across environment boundaries ☐ Feature flags for gradual/per-institution rollout ☐ Revertible deploys with no forced destructive migration

☐ **Developer Architecture** — Complete
&nbsp;&nbsp;☐ Extension Architecture unchanged, verified against a real (non-hypothetical) third-party extension ☐ Provider registry generalized beyond Search/Tamizhi ☐ Public API versioned against provider-interface contracts ☐ SDK (Developer Platform scope) ☐ Automation wired to the real event bus ☐ Shared contract test suite per provider interface

---

## Final Question

**"When every item in this document is implemented, is ARUMBU realistically capable of serving a Fortune 500 company?"**

**Yes — with one honest qualifier stated precisely, not smoothed over.**

Everything a Fortune 500 evaluation actually probes for — real persistence, real authentication with enterprise SSO, structurally enforced multi-tenant isolation, a tamper-evident and legally defensible audit trail, a real Policy Engine that lets institutional rules govern decisions rather than only who may make them, search and intelligence infrastructure that survive millions of records, horizontal scalability across regions, and the full observability/security/disaster-recovery/deployment discipline any serious enterprise procurement process requires — is addressed above, in every case as an extension of an already-correct constitutional decision, never as a new one invented to patch a gap. This document does not ask the Constitution to change; it asks the infrastructure beneath it to finally match what the Constitution already assumed would eventually be there.

**The qualifier:** this document, fully implemented, makes ARUMBU *capable*. It does not, by itself, make ARUMBU *proven* — and a Fortune 500 procurement process tests proof, not capability. Three things remain true even after every checklist item above is checked, and they are not infrastructure gaps this document can close, because they are not architecture questions at all:

1. **Nothing in this document has ever been exercised against a real, adversarial, or even merely large dataset.** "Capable of scaling to 10 million records" and "has scaled to 10 million records, measured" are different claims, and only the second one survives a serious enterprise technical evaluation.
2. **Compliance certifications a Fortune 500 buyer will actually require** (SOC 2, ISO 27001, and industry-specific regimes — HIPAA for a hospital, a government's own sovereign-data requirements) are earned through sustained operational practice and formal audit, not architectural design — this document creates the conditions under which they become achievable; it does not itself constitute them.
3. **A Fortune 500 institution is, correctly, the single hardest customer on the founder's own nine-institution list** — larger than any of the others by orders of magnitude, with the least tolerance for the unproven. Every other institution type named in §1 becomes realistically servable well before this one does, and that ordering is itself useful: the honest, defensible sequence is Startup → NGO/Trust/Temple → School/College → Manufacturer → Hospital/Government → Fortune 500 Enterprise, roughly in order of how much of *this* document each one's own risk tolerance actually demands be true first.

**So: yes, this document is the correct and complete architectural answer to the question asked** — every gap the Audit found has a named, constitutionally-consistent infrastructure design here, and nothing above requires reopening Governance, Attention, Authority, or Tamizhi's philosophy to achieve. What remains after full implementation is not a design gap; it is the ordinary, unavoidable distance between "correctly designed and built" and "operationally proven at the scale and scrutiny a Fortune 500 buyer applies" — a distance no architecture document, however complete, can close on paper alone.
