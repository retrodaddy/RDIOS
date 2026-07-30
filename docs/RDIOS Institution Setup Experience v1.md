> **ARUMBU is the product name introduced after this document was written.** Everything below was written under, and refers throughout to, the internal engineering name "RDIOS." That reasoning is preserved exactly as frozen — nothing in this document has been altered or renamed. "RDIOS" remains the correct internal/engineering term for the underlying platform this document describes; "ARUMBU" is what that platform is now called on every customer-facing screen.

Status: ⚪ Superseded by RDIOS Institution Setup Experience v2 — preserved unmodified as history, per the same versioning discipline as the Engineering Constitution. v2 folds in the Reconsideration's finding that Purpose (why the institution exists) precedes both Invite and Organization-shape as the true beginning, and answers the progress question with Purpose + History rather than "nothing." Read v2 for the current, frozen document.

Status (original): 🔵 Design phase — no code, no schema, no UI, no architecture changes. Extends the frozen RDIOS Product Foundation v1, People Domain Review v1, and Experience Principles v1 — proposes nothing they don't already have a home for. RDE and the current RDIOS prototype are both unmodified by this document.

# RDIOS Institution Setup Experience v1

## The real problem, stated precisely

Today, a brand-new institution lands on Home and Home says: *"The institution is calm this morning."*

That sentence is **technically correct and psychologically wrong**, and the gap between those two things is the actual problem this document solves — not "onboarding is missing," something more specific.

Home's Attention Engine can only ever say one of two things when Act Now is empty: *everything real is handled*, or *nothing real exists yet*. Those are opposite situations that currently produce the identical sentence. For a five-year-old institution, "calm" is the best possible news. For an institution that is four minutes old, "calm" is a lie of omission — there is enormous, obvious, real work to do (invite people, give the institution shape), and Home is staying silent about it because nothing has taught it that *building the institution* is itself a legitimate category of attention.

That's the actual design problem: **the Attention Engine doesn't yet know that a new institution's most urgent decisions are about itself.** Everything below follows from fixing that, not from adding an onboarding flow bolted onto the side of the product.

## The core decision: Setup is not a mode. It's Day-1 attention.

Reject, explicitly, the shape most software reaches for by default: a welcome screen, a numbered wizard, a progress bar, a "Skip setup" escape hatch, a distinct visual mode you enter and later exit. All of that is a second product living inside the first one, with its own rules, that a person has to learn once and then never see again. It fails the founder's own filter immediately: *it exists because software usually does this, not because it helps anyone understand RDIOS.*

**The alternative, and the one this document commits to:** the same Attention Engine, the same Act Now / Be Aware / History tiers, the same calm card-and-verb language — populated, in an institution's earliest days, with setup-shaped decisions instead of operational ones. There is no separate Setup screen to design, because Setup is not a place. It is what Home honestly contains when an institution is new. A founder on day one and a founder on day four hundred are looking at the *same* Home, the *same* mechanism, doing the *same* thing it always does: telling them the truest, most useful next decision. The content changes because the institution changes. Nothing else does.

This is also, not incidentally, the answer to "would I remember this six months later." Nobody remembers a wizard. People remember the moment software understood them without being told.

## What actually deserves to be Act Now on day one — and what doesn't

Applying the filter honestly to the founder's own example sequence (Welcome → Invite → Positions → Organization → Departments → Task → Project → Expense → Document):

**Passes the filter — real, universal, true for every institution type:**

- **Invite someone.** Already built, already live-verified this engagement. An institution of exactly one person is not yet meaningfully an institution — RDIOS is fundamentally about coordinating people, and a founder alone has nothing to coordinate. This is the single highest-leverage first decision there is, and it already works exactly right: one card, one verb, no form-within-a-form.
- **Shape your organization.** Not "create a Position" — that word stays confined to Settings, per the Language Rule already frozen in the Blueprint. On Home, this reads as something like *"Who reports to whom?"* — offering the institution's own starter shape (see Institution Types, below) as a suggestion, editable, skippable, never forced. This is the second real universal truth: almost nothing else — assigning Work, tracking Money against a department, knowing who approves what — means anything until the institution has *some* shape, even a rough or partly-vacant one.

**Fails the filter — real, but not universal, and wrong to force on day one:**

- **A welcome screen or tour.** Home's existing calm, personalized greeting *is* the welcome. A separate tour teaches software; it teaches nothing about the institution. Cut entirely.
- **Create a first Task, Project, Expense, or Document.** Each of these is genuinely useful — eventually, to the institution that actually has one. A temple with no ongoing "projects" in the software sense gains nothing from being told to invent one to fill a checklist slot. Forcing these on day one manufactures busywork to make the product look used, which is precisely the thing "software usually does this" was warning against. **The right home for each of these is the application it belongs to, once that application exists** — Work's own future design should decide when "create your first task" genuinely deserves to be Act Now (probably: never forced, offered only once there's a real reason, exactly like Identity already does for Invite). This document deliberately does not design those moments — that's each application's own first-use design, owed when that application is actually being built, not invented speculatively here.
- **A numbered "Departments" step separate from Organization.** The People Domain Review already treats Department as a grouping concept distinct from Position, but as a *day-one decision* they're one moment, not two — nobody thinks "first I'll define departments, then separately I'll define who reports to whom." Splitting it into two Act Now cards would be exactly the kind of step that exists because a wizard needs steps, not because the founder needs two decisions.

## Progress: none. Deliberately.

The founder asked to choose one — percentages, milestones, journeys, chapters, achievements, or nothing — and explain why. **Nothing.**

Every one of the other options requires the same false premise: a fixed, known-in-advance sequence of steps, countable, so a fraction or a chapter number means something. There is no such sequence — the previous section just established that most of what a founder does after "invite" and "shape the organization" is genuinely institution-specific and open-ended, not a checklist with a knowable length. A progress bar over an undefined denominator isn't honest progress, it's decoration pretending to be measurement.

More importantly: a percentage or an achievement badge is a small, constant pressure — *you are incomplete, hurry up* — and that is precisely the tone the Experience Principles forbid, on the very screen meant to build trust. "Calm is a feature, not an absence of content" applies with more force here than anywhere else in the product, because this is the first impression.

**What signals progress instead:** the Act Now list gets shorter. That's all. When the setup-shaped cards are gone, Home says the exact sentence it already knows how to say — *"The institution is calm this morning"* — and for the first time, that sentence is true in the way it should be. No new UI, no new mechanism, no announcement. The completion signal is the same silence that always means the same thing everywhere else in RDIOS. Consistency, not celebration.

## Completion and the long lifecycle

There is no "Setup Complete" screen to design, because — per the core decision above — there was never a separate Setup mode to exit from. It doesn't disappear, transform, or graduate into something else on a schedule. It simply stops generating cards once the underlying gaps it was honestly reporting (one member, no shape) stop being true.

Explicitly rejecting two of the founder's named options, with reasons: **not an achievement system** — gamification is the wrong register for an institutional operating system, for the same reason a hospital's charting software shouldn't have confetti. **Not an annual review** — RDIOS's whole premise is continuous attention, not calendar-driven check-ins; framing organizational health as a yearly ritual contradicts the product's own philosophy before it's a year old.

What *does* carry forward, forever, without ever being named as a separate feature: the same raw signal that powered the first setup card — *does this institution's shape match its reality* — never stops being true or false. A Position that goes vacant eighteen months from now is exactly the same fact, in the exact same shape, as a Position that started vacant on day one. It belongs in **Be Aware**, permanently, as ordinary ambient truth — not a resurrected "Setup" mode, not a health score, just the Attention Engine doing on day six hundred what it did on day one: noticing what's true and saying so plainly. If a future "Institution Health" view ever gets built, this is *why* it would feel coherent rather than bolted on — it would be reading the same signals Setup always read, at a different point in the institution's life. Naming that connection now; not committing to building it.

## Institution types: same mechanism, different content

Should a Temple and a Startup experience identical setup? **The mechanism, yes. The content, no** — and the frozen architecture already has exactly the right place for that difference, without changing anything.

The Product Foundation's Institution Configuration Layer already names **Organization Templates** as a per-institution-type configuration surface. That's where this lives:

- A **Temple**'s "shape your organization" suggestion offers a starter shape close to Trustee → Priest → Volunteer Coordinator.
- A **Hospital**'s offers something like Director → Department Head → Attending → Resident, department-scoped.
- A **Startup**'s offers almost nothing — maybe just Founder and Co-Founder — because forcing structure on two people is exactly the kind of premature step this document has been arguing against throughout.
- An **NGO**, a **School**, a **Foundation**, a **Trust** each get their own starter shape, authored once, reused by every institution of that type.

None of this requires a new engine. It requires Organization Templates — already named, already scoped, already homed in the Institution Configuration Layer — to exist with real content per type. The setup experience's only job is to *offer* the template as a starting suggestion at the "shape your organization" moment, never force it, and let the founder discard, edit, or ignore it exactly as freely as they can skip the invite card.

## Where this lives, architecturally — nothing new

Both real Act Now moments are contributed the same way every future application's Act Now items will be: through the Attention Contract already named in the Product Foundation, already seamed into the current prototype's own code (`os/attention/engine.ts` names this exact extension point in its own comments). Identity is already, today, the one live contributor — the "you're the only one here" card is Identity honestly reporting a gap. "Shape your organization" is the same contributor, reporting a second, equally real gap, once People/Positions exist to report it. Nothing about this requires a new engine, a new tier, or a new contract shape — it requires exactly one more honest signal from a provider that already exists in the running prototype.

## The first ten minutes, narrated

**A Temple.** Lakshmi creates "Meenakshi Temple Trust," selects Temple as the type, and lands on Home. It already says her name and the time of day — nothing new needed there, already built, already verified this engagement. One card: *"You're the only one here — nothing runs alone for long. Invite."* She invites Ganesh, the temple's priest. He accepts. History, quietly, already records both moments in plain language. A second card now appears: *"Who reports to whom?"* — offering the Temple starter shape. She glances at it, adjusts one line, accepts it. Two real decisions, about her actual institution, no form longer than a sentence, no screen she'll ever need to "complete." Home goes quiet. It stays quiet until something real happens.

**A Startup.** Two co-founders, a company type, the same Home, the same first card. They invite each other. The organization-shape card offers almost nothing to accept — two founders don't need an org chart yet — so it either doesn't appear at all, or appears once and is dismissed in one click. Within ninety seconds they're looking at a calm, empty Home that has already told them the truth: there's nothing real to decide yet, and that's fine.

Both founders had a different first ten minutes, built from the identical mechanism. Neither ever saw a step counter, a tour, or a screen that existed only because software usually has one.

## The six-month test, applied

The moment worth remembering isn't a screen — it's the instant History quietly writes *"Ganesh Bhatt joined"* in plain English, seconds after it happened, with no prompting. That's already real, already built, already proven live this engagement. Setup's entire job is to make sure that moment — and the one right before it, deciding who to invite — is the *first* thing a founder does, with nothing standing between login and that decision. Everything in this document exists to protect that one moment, not to surround it with more moments.

## What this document deliberately does not design

The first-use moment for Work, Money, Projects, and Documents — each belongs to that application's own design pass, when it's actually being built, following the same honesty rule Identity already follows: offered only when a real gap exists, never manufactured to fill a step. A future "Institution Health" view, hinted at but not committed to. Any visual treatment of the setup cards themselves — that's Phase 2's territory, not this document's.

---

Nothing implemented. No screens designed, deliberately — this was an experience review, not a UI review, per the instruction. Waiting for this to be accepted before it becomes the next thing built, ahead of People.
