Status: 🟢 Frozen v1. Not a new design document — the formal act of closing the design phase, in the same spirit as RDE's own Workforce Architecture Freeze Determination. Governs everything that follows: Build, Test, Verify, Polish, Ship.

# RDIOS Architecture Freeze Declaration v1

## The last lens, folded in rather than opened up

Nouns store. Verbs move. People, Work, Money, Projects, Customers, Documents are storage — correct, necessary, and inert on their own. What actually runs an institution is the sequence of decisions someone makes: **Approve, Assign, Reject, Review, Delegate, Comment, Mention, Escalate, Complete, Transfer, Suspend, Restore, Offboard, Invite.**

This does not open a new design question — it names something already built into every layer approved so far, and it's worth saying precisely where:

- **The Attention Contract (Foundation §4/§5) is verb-shaped by construction.** `getActNow` doesn't return nouns — it returns things with a verb attached: *this* can be Approved, *that* can be Completed. An Act Now item without an available verb isn't Act Now; it's Be Aware.
- **RDE already proved a real set of these verbs, live-verified, ready to generalize directly**: Approve, Reject, Complete, Assign, Invite, Offboard, Comment. These carry into RDIOS's Work and People engines with the same confidence as the nouns they act on.
- **A real set remains genuinely unbuilt anywhere yet**: Delegate, Escalate, Transfer, Suspend, Restore, Review. Naming this honestly rather than claiming false completeness — these are real, expected verbs the Work Engine, Audit Engine, and People Domain will need to support, and every one of them rides machinery already frozen (Work Engine, Events, Audit) rather than requiring new architecture to add. They are implementation work waiting for their moment, not an open design question.

Verbs are the correct organizing idea for how Home, the Attention Engine, and every application's contract should be built from here forward — not a new layer, a lens on the layers already approved.

## What is now frozen

- **RDIOS Product Foundation v1** — the five-layer architecture, the Attention Contract, the Operating System / Application / Shared Engine / Institution Configuration separation.
- **RDIOS People Domain Review v1** — Person / Membership / Position / Affiliation / Capability, and the rule that employment is emergent, never a field.
- **RDIOS Audit Engine Design v1** — built on Events, synchronous, append-only, two-layer read permission.
- **RDIOS Experience Principles v1** — Act Now / Be Aware / History, the Assistant Voice, the Interruption Rule.
- **Every RDE engine named reusable in the Foundation's §1–2** (Work, Authorization's mechanism, Notifications' mechanism, Documents, Workforce's Position/Affiliation/Capability split) — frozen there already, carried forward as precedent here, not reopened.
- **RDIOS Institution Setup Experience v2** — Purpose as the true beginning (prior to Invite and Organization-shape), the two practical early Act Now decisions, and Progress answered by Purpose + History rather than a metric. v1 and its Reconsideration are preserved as history, superseded.

Per the same constitutional principle RDE's own Engineering Constitution v2 established: **a Frozen Architecture is presumed correct until a genuinely new domain requirement proves otherwise. Implementation extends it. Implementation does not reopen it.**

## What changes starting now

No more architecture documents. No more reviews. No more philosophical exploration. Every session from here forward runs: **Build. Test. Verify. Polish. Ship.**

The one legitimate reason to reopen any part of this is implementation surfacing a real flaw — not a stylistic preference, not a "we could also consider," an actual structural problem discovered by building against it. When that happens, it gets named specifically, scoped to exactly the part that's wrong, and resolved the same way every reversal in RDE's own history was handled — directly, honestly, without pretending the frozen version was never wrong.

## The first real build decision, waiting on you

Everything above is design. The first line of code has a genuine dependency order underneath it: nothing in RDIOS — no application, no engine, no OS layer piece — can exist before **Identity and Tenant** does, since every table, every RLS policy, and every request depends on `institution_id` resolving correctly first. That means the honest first build slice is small and unglamorous: the `institutions` table, `people`, `institution_memberships`, and the tenant-resolution helper — no UI worth looking at yet, just the ground everything else stands on.

Two things I need from you before I touch anything real: **do you already have a Supabase project provisioned for RDIOS**, or should I create one — and should I start exactly there (Identity/Tenant foundation), or is there a different first slice you'd rather see working first?
