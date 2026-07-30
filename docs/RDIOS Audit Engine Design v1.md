> **ARUMBU is the product name introduced after this document was written.** Everything below was written under, and refers throughout to, the internal engineering name "RDIOS." That reasoning is preserved exactly as frozen — nothing in this document has been altered or renamed. "RDIOS" remains the correct internal/engineering term for the underlying platform this document describes; "ARUMBU" is what that platform is now called on every customer-facing screen.

Status: 🟢 Frozen v1 — per RDIOS Architecture Freeze Declaration v1. Resolves the one honest gap the Product Foundation v1 (§7) named explicitly: RDE has the *instinct* for audit scattered across several places, never one unified engine. This document designs that engine properly, as a first-class citizen of the Shared Engine Layer.

# RDIOS Audit Engine Design v1

## Why this needs to be its own engine, not a byproduct

RDE gets close to an audit trail three separate ways — append-only Position Holder history, append-only Founder Ledger entries, and Events as an implicit record of what happened — but none of them were designed *as* an audit trail, so none of them can answer "show me everything that happened to this institution" in one place. That single question is exactly what the Operating System Layer's History tier needs to answer, and it needs one real engine underneath it, not three coincidentally-similar patterns.

## Relationship to the Events engine — the distinction that matters

Events and Audit look similar and are not the same thing, and conflating them would be a real design mistake.

**Events** are the *decoupling mechanism* — a domain write fires an event, and anything downstream (a notification, a ledger posting) reacts to it without the original write needing to know who's listening. Events are infrastructure, not institutional memory. Not every event deserves to be remembered forever, and some — a notification being marked read, a search being run — are not memory at all.

**Audit** is the *permanent institutional record* — human-readable, queryable, tenant-scoped, meant to answer "what happened, who did it, when" for as long as the institution exists. It is memory, not plumbing.

**The design decision: Audit is built on Events, not instrumented separately.** An application never writes to both an event stream and an audit log — it emits one event, exactly as RDE's convention already works, and the Audit Engine is a second listener on that same stream (alongside Notifications, which is the first). This keeps "the subsystem owns the truth" intact: a subsystem announces what happened once; what the platform does with that announcement — route it for attention, or remember it forever — is the platform's decision, not the subsystem's.

## What makes an event audit-worthy — and what doesn't

Not everything is memory. A raw table changelog is not History — it's noise, and the Experience Principles' §6 ("calm is a feature") applies here as much as it applies to Home.

Each event type carries an `auditable` classification, decided at two levels:

- **Built-in event types the Shared Engine Layer ships with** — approvals, appointments, offboarding, financial postings, Position and Affiliation changes — are audit-worthy by default, and this is a guarantee the platform protects, not a setting an institution can turn off. An institution should never be able to make its own approval trail disappear; that's a compliance-relevant property of the engine, not configuration.
- **Institution-specific event types**, added through the Institution Configuration Layer for their own custom modules or workflows, declare their own `auditable` flag when registered — a genuine configuration point, scoped only to what the institution itself introduces.

Read/view events are never audit-worthy, by design — looking at a record is not an institutional act worth remembering forever.

## What an audit record actually contains

One table, tenant-scoped, append-only, no update policy at all — the same discipline RDE already proved correct for Position Holder history and Ledger entries, applied here as the default rather than something each engine has to rediscover:

- `institution_id` — tenant scope, non-negotiable.
- `subject_type` / `subject_id` — the same polymorphic pattern already proven twice in RDE (Events, Documents) rather than a third, slightly different one.
- `actor_person_id` — nullable, for system-triggered records (an automatic escalation, a scheduled process) that have no human actor.
- `action` — a controlled vocabulary per subject type ("approved," "appointed," "completed," "offboarded"), not free text — so History can be filtered and searched meaningfully, not just full-text-matched.
- `summary` — a human-readable sentence, rendered once, at write time, through the same Assistant Voice phrasing layer the rest of the Operating System uses. Deliberately **not** computed on read from a raw diff — if the phrasing rules change later, old records must still read exactly as they did when they happened. History does not get to reinterpret the past.
- `detail` — an optional `jsonb` before/after payload, for the cases where the summary sentence isn't enough and someone genuinely needs the raw values (a financial figure, a permission set). Present, but secondary to the summary — the summary is what most people read; the detail is what an investigation reads.
- `created_at` — when it happened, immutable.

## Write guarantee: synchronous, not eventually-consistent

The Audit Engine's projection from Events happens in the same transaction as the domain write and the event it responds to — a database trigger, not a background job. RDE's own `emit_event()` convention already proves this pattern works reliably at the scale this platform operates at. An audit engine that can silently lose a record because a queue backed up or a worker died has failed at the one thing it exists to do. This is a place where async convenience is explicitly rejected in favor of a hard guarantee.

## Corrections are new records, never edits

If a mistake needs correcting, the correction is a new audit record referencing the one it corrects — never an update to the original. An audit trail that can be edited after the fact isn't a trail; it's a draft. This is the same principle already governing Ledger entries in RDE, applied here as a platform-wide rule rather than a per-engine choice.

## Who can read it

Audit access is not a single blanket permission. Two layers apply together, mirroring the pattern Documents already proved works (`DOCUMENT_SUBJECT_PERMISSIONS` — each subject type decides its own read rule, rather than one global rule pretending to fit everything):

1. **Subject-level**: you can only see the audit trail of something you could already read as a record — someone with `WORK_ITEM_READ` sees Work Item audit history; they don't automatically see Finance's.
2. **Institution-level oversight**: a dedicated audit-read grant (leadership, compliance, or a Position explicitly given it) sees across every subject type at once — the actual "what happened in this institution" view that powers History as a real destination, not just a per-record tab.

Neither layer alone is sufficient — subject-level access without the oversight grant sees only fragments; the oversight grant without subject-level respect would leak things a person's ordinary permissions would never show them. Both apply together, always.

## What History (Operating System Layer) actually is, now concretely

History is a read surface over `audit_records` — filtered by subject, actor, action, and time, respecting the two-layer permission rule above, searchable the same way Search already works elsewhere on the platform. Nothing about History is a separate data store; it is the Audit Engine, read.

## Named, not built: tamper-evidence

For institutions with real compliance weight — hospitals, government offices, anything financially regulated — an audit trail that's merely append-only in application logic isn't always enough; some require cryptographic proof that nothing was altered after the fact (hash-chaining each record to the one before it). This is a real, legitimate future extension point, explicitly not designed in this pass — building it now, before any institution has actually asked for that guarantee, would be exactly the premature-abstraction mistake this engagement has caught and reversed itself on before. Named here so it isn't rediscovered as a surprise later; not built now.

## What this settles, concretely, for implementation later

- One `audit_records` table, tenant-scoped, append-only, no update policy — same shape as RDE's proven append-only tables.
- The Audit Engine subscribes to Events; applications never write to it directly.
- Built-in audit-worthy event types are a platform guarantee; institution-specific ones are configuration.
- Summaries render once, at write time, through the Assistant Voice — never recomputed on read.
- Two-layer read permission: subject-level respect, plus an explicit oversight grant for cross-subject visibility.
- Tamper-evidence is named as a future extension, deliberately not designed now.

## What remains open

- The exact `action` vocabulary per subject type needs to be enumerated once each application's own domain model is finalized — this document defines the shape, not the full list.
- Whether the oversight grant is a single permission or itself configurable per-institution (some institutions may want department-scoped oversight rather than institution-wide) is a real question better resolved once the Permissions layer (Foundation §8) gets its own detailed design pass.
