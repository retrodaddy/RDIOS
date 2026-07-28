Status: 🟢 Frozen v1 — per RDIOS Architecture Freeze Declaration v1. Presumed correct until implementation surfaces a genuinely new domain requirement; extended, not reopened. RDE (`G:\WEBSITES - RETRO DADDY\Retro Daddy Website`) is referenced throughout as the proven first implementation; nothing here modifies it, imports it, or depends on it at runtime.

# RDIOS Product Foundation v1

**RDIOS — the RD Institutional Operating System.** A multi-tenant platform, not a company's internal tool. RDE is its first reference implementation, not its foundation to build directly on top of.

**The one sentence every section below has to remain true to:**

> **The subsystem owns the truth. RDIOS owns attention.**
> Applications answer "tell me everything." The Operating System answers "what deserves my attention right now."

---

## 1. Overall Product Architecture

Five layers, strictly ordered — nothing in a lower-numbered layer may depend on a higher-numbered one:

1. **Data layer** — one Supabase project, one schema, every table tenant-scoped from its first migration. No per-institution database, no per-institution schema. One platform.
2. **Shared Engine Layer** — Work, Authorization, Notifications, Documents, Workflow, Events, Assignment, Audit. Institution-agnostic machinery. Knows nothing about "People" or "Money" as concepts — only about tasks, permissions, events, attachments, state machines.
3. **Application Layer** — People, Work, Money, Projects, Customers, Documents, Reports, Settings. Each owns its own tables, consumes the Shared Engine Layer, and is independently correct and usable on its own.
4. **Operating System Layer** — Home, Attention Engine, Search, Notifications (the person-facing feed, not to be confused with the engine below it), Assistant voice, History, Calendar, Command Palette, Identity, Navigation. Reads across every application; writes to none of their domains.
5. **Institution Configuration Layer** — terminology, departments, permission catalogs, business rules, branding, workflow templates, org templates. Data, not code — the layer that makes one codebase feel native to a temple and a hospital without forking anything.

An application must be able to work correctly with the Operating System Layer switched off — usable headlessly, as records plus decisions, through its own routes alone. If an application can't pass that test, it has taken a dependency it shouldn't have.

---

## 2. Institution Lifecycle

**Day 0 — Institution created.** A new `institutions` row: name, institution type (Company / Hospital / School / NGO / Temple / Manufacturing / Government / Trust / Church / Mosque / Other), size estimate. Creating it seeds: a starter terminology profile matched to type, a starter permission catalog, a starter Organization Template, and the creator's own account as the first Position holder — an admin-equivalent seat, whose actual title comes from the terminology profile (Founder, Director, Head, Principal — never hardcoded).

**Day 0–1 — First admin onboarding.** The creator lands directly on Home, empty, calm — "You're the only one here" is the correct, honest state, not an error.

**Week 1 — Organization setup.** The Organizational Builder (§ below), seeded from the institution's starter template if one exists for its type. Positions get created, reporting lines drawn, people invited.

**Week 1–2 — Application activation.** Not every application matters to every institution — a temple has no obvious use for a Customers pipeline; a manufacturing company may not need Projects the way a services company does. Applications are enabled per institution, not force-fed; an inactive application simply doesn't appear in Navigation or contribute to Attention.

**Ongoing — steady state.** Home becomes the daily surface. Applications get visited for context, not for daily work — the entire premise this whole design phase has been building toward.

**Offboarding (named now, designed later, not urgent).** An institution can be archived. Its data stays fully isolated and exportable; nothing about removing one tenant should ever be able to touch another. Not a Day 0 build priority, but a Day 0 design constraint — tenant isolation has to be real from the first migration for this to be possible at all later.

---

## 3. Tenant Architecture

**One schema. Every table carries `institution_id uuid not null references institutions(id)`. No exceptions, including lookup/reference tables that feel "global."**

**Identity is not the same thing as tenant membership.** This is a real departure from RDE, worth stating plainly rather than quietly inheriting: RDE has exactly one implicit tenant, so `profiles` conflates "who is this person" with "what can they do here." RDIOS separates them —

- `people` — a global identity (email, name), belongs to no institution by itself.
- `institution_memberships` — one row per (person, institution): their role, their Position(s), their status, all scoped to that one institution.

A person can hold membership in more than one institution (a consultant serving two clients, a trustee sitting on two boards) without RDIOS inventing a special case — this is the correct model even if the first version only ever exercises one membership per person.

**Isolation enforcement, three layers deep, never trusting just one:**
1. **RLS is the real boundary.** Every policy's first clause is tenant scoping, before any role or permission check ever runs. A permission check that passes but a tenant check that fails must never leak a row.
2. **A tenant-resolution helper, mirroring RDE's `requirePortalUser` pattern**, resolves *institution context* before it resolves role or permission — the Authorization resolver gains one new precondition ahead of everything it already does well.
3. **No hand-written cross-tenant query is structurally possible** — the Supabase client wrapper used everywhere requires an institution scope to compile against, the same discipline RDE already applies to permission gates (nothing reads data without going through a gate first).

---

## 4. Application Architecture

People, Work, Money, Projects, Customers, Documents, Reports, Settings. Each answers exactly one question (unchanged from the earlier Blueprint — that framing holds and graduates into RDIOS unmodified):

| Application | Answers |
|---|---|
| People | Who makes up this institution? |
| Work | What work exists? |
| Money | What is the financial state? |
| Customers | Who are we serving? |
| Projects | What are we delivering? |
| Documents | What institutional knowledge exists? |
| Reports | What should leadership understand? |
| Settings | How is this institution configured? |

Every application exposes two things, and only two things, to the rest of the platform:

1. **A record surface** — its own routes, its own "tell me everything" screens. Owned entirely by the application.
2. **An Attention Contract implementation** — a small, typed interface (`getActNow(institutionId, personId)`, `getBeAware(...)`, `getHistory(...)`) that the Operating System Layer calls without knowing anything about the application's internal schema.

This contract is the actual mechanism that keeps "the subsystem owns the truth, RDIOS owns attention" true in code, not just in prose — Home never reaches into `work_items` or `expenses` directly; it calls the contract every application already agreed to implement. This is also §9's entire extension mechanism, arrived at from a different direction — worth noticing that both requirements converge on the same interface.

---

## 5. Operating System Layer

Not applications. Never owns domain data of its own (aside from its own view-state — read receipts, saved searches, calendar preferences).

- **Home** — the OS itself, not a page. Composes Act Now / Be Aware / History from every active application's Attention Contract.
- **Attention Engine** — the actual filter defined in the RDIOS Experience Principles (§2, tiering) and the Attention Architecture before it — decides what crosses the threshold into Act Now versus Be Aware versus nothing at all. This is genuinely the platform's most important piece of new machinery — RDE never had one; it had a page (`app/(app)/home/page.tsx`) doing this ad hoc, calling each domain's reads directly. RDIOS formalizes what RDE proved worked.
- **Search** — already proven in RDE as a provider-registry pattern (`lib/search/providers/*`, each implementing a shared interface). Ports near-verbatim; each application's provider is really just another instance of the same registration mechanism the Attention Contract uses.
- **Notifications** (the person-facing feed) — sits atop the Notifications engine (§7), same tiering language (needs-action/fyi) RDE already proved, now driven by a per-institution taxonomy instead of a hardcoded one.
- **Assistant** — the Experience Principles' Assistant Voice made literal: a single phrasing layer every OS-level surface routes through, so "calm, plain, one thing at a time" is enforced by one shared component, not by every developer remembering the rule independently.
- **History** — the third tier, made into a real destination for the first time (RDE has no equivalent) — a unified, cross-application, searchable record of everything resolved. Powered by the new Audit engine (§7).
- **Calendar** — new, doesn't exist in RDE. Aggregates due dates and time-bound commitments across applications the same way Attention aggregates decisions.
- **Command Palette** — already proven in RDE (`CommandPalette.tsx`), ports directly; its "jump to a record" half is Search, its "jump to a destination" half is Navigation.
- **Identity** — tenant + person + session resolution, the precondition every other OS Layer piece and every Application depends on (§3).
- **Navigation** — no longer a static file (`lib/rdii/nav.ts`'s fixed nine destinations). Built dynamically per institution from whichever applications are active — a temple's Navigation genuinely does not list Customers.

---

## 6. Application Layer

The applications from §4, restated with the one architectural test that keeps this layer honest: **could this application be fully used, correctly, by someone who never once opens Home?** Record CRUD, its own permission checks, its own notifications firing, its own documents attaching — all real, all complete, entirely through its own routes. If yes, the layering is clean. If an application secretly needs Home to function (a decision that can *only* be made from Home, with no equivalent path inside the application's own screens), that's a design defect to catch before it ships, not after.

---

## 7. Shared Engine Layer

For each engine: why it worked, which assumption made it work, which part of that assumption is Retro-Daddy-only, and which part is universal. This is the discipline you asked for explicitly — applied honestly, including naming the one engine that doesn't really exist yet.

**Work Engine.** *Why it worked:* Task and Approval are genuinely universal shapes of "something a person must finish," and the workflow is template-driven rather than hardcoded per type — it never needed to know about any specific business process to run one. *RD-only assumption:* almost none. This is the one engine that ports nearly assumption-free. *Universal:* the whole thing, including the state-machine-via-template design, which is exactly the right shape for a platform that has to support arbitrary institutional processes it can't predict in advance.

**Authorization.** *Why it worked:* permissions are strings, resolved by unioning every provider's contribution (role-based, Position-based) into one `EffectiveAccessContext`, computed once per request. *RD-only assumption:* the specific permission catalog (`FINANCE_APPROVE`, `LEADS_WRITE`...) and the fixed `PortalRole` enum. *Universal, and the actually important idea:* authority comes from **Position**, not from a fixed role list — that's the correct design, proven this session when Position-granted permissions were live-verified working identically to role-granted ones. RDIOS keeps that idea exactly; only the catalog becomes per-institution configuration (§8).

**Notifications.** *Why it worked:* event-driven, two-tier (needs-action/fyi), destination-resolved, decoupled from the write that caused it. *RD-only:* the taxonomy entries (`lead.created`, `expense.submitted`). *Universal:* the tiering and routing mechanism itself.

**Documents.** *Why it worked:* one polymorphic `subject_type`/`subject_id` pair, one private bucket, signed URLs minted on read, never stored. *RD-only:* the four hardcoded subject types and the kind enum. *Universal:* essentially everything else — like Work, this one ports almost assumption-free.

**Workflow.** *Why it worked:* states and transitions live in a template row, not in application code — the engine interprets templates, it doesn't encode them. *RD-only:* the two seeded templates (`task.default`, `approval.default`) — these simply become the starter set; institutions add their own. *Universal:* the interpreter.

**Events.** *Why it worked:* every domain write emits an event; everything downstream (notifications, ledger postings) reacts to the event instead of being called directly by the write — real decoupling, proven every time a new consumer (a new notification route, a new trigger) got added without touching the original write path. *RD-only:* the specific event catalog. *Universal:* the emit-and-react pattern.

**Assignment.** *Why it worked:* a strategy interface (Manual, Round Robin today) that the Work Engine calls without knowing which strategy is in play. *RD-only:* nothing structural — just that only two strategies exist so far. *Universal:* the whole pattern; Load-Balanced and Skill-Based strategies are natural additions *because* the interface already expects more than one implementation.

**Audit.** *The honest gap.* RDE does not have one first-class Audit engine — it has the *idea* scattered correctly across several places (append-only Position Holder history, append-only Founder Ledger entries, Events themselves as an implicit trail) but never unified. RDIOS needs one real engine here: every meaningful state change writes one Audit record, tenant-scoped, and that single stream is what powers the Operating System Layer's History tier. This is a genuine generalization beyond what RDE has, not a port — named explicitly as new work, not disguised as reuse.

---

## 8. Institution Configuration Layer

Data, never code, always tenant-scoped:

- **Terminology** — a dictionary mapping generic labels to institution-specific words ("Department" → "Ward" for a hospital, "Faculty" for a school), loaded once per session, applied everywhere a label renders. This is the literal mechanism behind "don't hardcode Founder, CEO, Finance, Agency" — every one of those words becomes a terminology lookup, never a string in a component.
- **Departments** — a generic org-unit/scoping concept, distinct from Position (Position is an authority seat; Department is a grouping a Position can belong to) — worth stating as a real distinction now so it isn't conflated later.
- **Permissions** — the per-institution permission catalog, seeded from a starter set matched to institution type, extendable per institution without a code change.
- **Business Rules** — approval thresholds, currency, fiscal year, working hours — configuration values the Shared Engine Layer reads, never hardcodes.
- **Branding** — logo, color, tenant-level, cosmetic only.
- **Workflows** — per-institution customizable templates, riding directly on the Workflow engine's already-proven template-driven design.
- **Organization Templates** — starter org charts per institution type, the thing that makes a new hospital's first ten minutes in the Organizational Builder feel like configuration, not a blank canvas.

---

## 9. Extension Architecture

A future module — Inventory for a manufacturer, Admissions for a school — plugs in by:

1. Implementing the **Attention Contract** (§4/§5) so it can appear on Home.
2. Registering a **Navigation manifest entry** (label, icon, route, required permission) — Navigation composes itself from these, never edited by hand per module.
3. Implementing the **Search provider interface**, the same one every existing application already uses.
4. Consuming the **Shared Engine Layer** for anything generic it needs — its own approvals ride the Work Engine, its own attachments ride Documents, its own alerts ride Notifications — never reinventing what already exists.
5. Owning its own tenant-scoped tables under the same RLS and migration conventions as everything else.

No existing engine, application, or Operating System component is ever modified to accommodate a new module. This is the concrete test for whether the Shared Engine Layer was designed correctly: if adding Inventory ever requires touching Home, Search, or another application's code, the layering has failed somewhere upstream of Inventory.

---

## 10. Folder Structure

```
G:\RDIOS\
  app/                      # Next.js route tree — thin, page-level only
    (auth)/
    (onboarding)/              # institution creation + first-admin setup
    home/
    people/
    work/
    money/
    projects/
    customers/
    documents/
    reports/
    settings/
  os/                          # Operating System Layer — a peer of app/, not a subfolder of lib/
    attention/                    # the Attention Engine
    search/
    notifications/
    assistant/                     # the Assistant Voice phrasing layer
    history/
    calendar/
    command-palette/
    identity/                       # tenant + person + session resolution
    navigation/                      # composed per-institution, never a static file
  engines/                            # Shared Engine Layer
    work/
    authz/
    notifications/
    documents/
    workflow/
    events/
    assignment/
    audit/                              # new — doesn't exist as a unified thing in RDE
  applications/                          # Application Layer — business logic + data access, tenant-aware
    people/
    work/
    money/
    projects/
    customers/
    documents/
    reports/
  config/                                  # Institution Configuration Layer
    terminology/
    permissions/
    branding/
    org-templates/
    workflows/
  extensions/                                # future institution-specific modules land here
  components/
    os/                                         # Home/Act-Now/Be-Aware/History primitives, Assistant components
    org-builder/                                  # the flagship visual builder — designed next, not built
    ui/
  supabase/
    migrations/                                     # starts at 0001, every table tenant-scoped from the first
  docs/
    RDIOS Product Foundation v1.md                    # this document
```

`applications/` is split from `app/` deliberately — a real departure from RDE's flatter `lib/` + `app/` split. Applications need a stable module boundary that isn't tied to a URL route, because the Operating System Layer consumes them through their Attention Contract, never through their pages.

---

## The Organizational Builder — research and proposed experience (not built)

**What makes Miro, FigJam, Whimsical, and draw.io feel right, and why a form-based Positions page never will:** an infinite canvas instead of a fixed page; nodes that are directly manipulable objects, not rows referencing a form; connections drawn by dragging, not selected from a dropdown; zero modal interruption for the common case, detail surfaces that slide in beside the canvas rather than covering it; and — critically — the canvas *is* the source of truth on screen, so a person builds by looking at the shape of what they're building, not by reading a list and imagining the shape.

**The proposed interaction model:**

- **Infinite pan/zoom canvas**, not a page with scrolling.
- **Nodes are Position cards** — name, current holder (avatar + name, or a visibly distinct "Vacant" state), a compact permission summary. The card *is* the record, at a glance.
- **Edges are reporting lines**, drawn by dragging from one node's connector to another. Multiple incoming edges are structurally supported from day one — this directly resolves the single-parent-tree limitation flagged in the prior architecture review (RDE's `reports_to_position_id` is one FK; RDIOS's graph is many-to-many from the schema up, not retrofitted later).
- **Auto-layout**, one click, using a standard tree-layout algorithm — for anyone who'd rather describe relationships than arrange pixels. Manual placement always remains available and persists; auto-layout is an assist, never a forced reset.
- **Click a node → a side panel slides in**, canvas stays visible and interactive behind it — full Position detail (name, holder, reports-to, permissions, description, vacant/filled, quick actions: appoint, end, grant permission). The same "drawer over destination" principle already frozen in the RDIOS Experience Principles §5 — this flagship experience has to obey the same interruption rule as everything else, not get a special exemption for being visually ambitious.
- **Starter Organization Templates** (§8) pre-populate the canvas for a new institution matched to its type — a hospital opens to a real hospital-shaped starting chart, not a blank canvas and a blinking cursor.
- **Real-time multiplayer editing** — named as a genuine stretch goal (the pattern every reference tool above treats as table-stakes), explicitly not a v1 commitment.

This becomes one of RDIOS's flagship experiences precisely because it's the moment a new institution stops looking at software and starts looking at *itself* — the org chart is the one screen where the software should feel unmistakably built for building something, not for filling something in.

---

## What remains open, honestly

- The exact shape of `institution_memberships` (single-role-per-membership vs. multiple concurrent Positions per membership) needs one more pass once People and Work are being designed together — noted, not resolved here.
- Audit engine's precise schema is named as necessary but not designed — first real design work item once this Foundation is approved.
- The Attention Contract's exact function signatures are named conceptually here; the literal interface needs to be written before the first application implements it, so every application implements the same version.

Nothing implemented. Waiting for review.
