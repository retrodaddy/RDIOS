> **ARUMBU is the product name introduced after this document was written.** Everything below refers throughout to the internal engineering name "RDIOS," consistent with every other document in this corpus written before the branding migration. "RDIOS" remains the correct internal/engineering term for the underlying platform; "ARUMBU" is what that platform is called on every customer-facing screen.

Status: 🟢 Frozen v1 — **extraction and consolidation, not new design.** Every principle in this document has already governed RDIOS since before Product Foundation v1 froze; it has been cited, by name, as "the frozen Experience Principles" in at least four later constitutional documents (Product Foundation §5, Architecture Freeze Declaration, Institution Setup Experience v2, Institution Intelligence Principles §8, Visual Design System) without ever having its own file. The ARUMBU Constitution Ratification Review v1 named this the single most consequential gap standing between the Constitution's current state and permanent freeze — a load-bearing, by-name-cited document that existed only as scattered fragments and institutional memory. This document closes that gap by collecting those fragments into one authoritative home. Nothing below is a new decision; every sentence traces to a specific prior document, cited inline, and where two prior documents phrase the same rule slightly differently, this document keeps the more precise phrasing and notes the source, never invents a third version.

# RDIOS Experience Principles v1

## Why this document exists, and why only now

Product Foundation §5 named "the Attention Engine — the actual filter defined in the RDIOS Experience Principles (§2, tiering)" as if that document already existed the day Product Foundation froze. It didn't, and the omission was never dishonest — every document that has since cited it correctly restated the specific rule it needed in its own margin, faithfully and consistently, which is exactly why this extraction is possible without inventing anything: eleven documents' worth of consistent restatement is the actual source material this document compiles from. What was missing was never the substance. It was a single place to find it.

## 1. The Three Tiers — Act Now, Be Aware, History

The Attention Engine's entire job, stated once, precisely: **decide what crosses the threshold into Act Now versus Be Aware versus nothing at all** (Product Foundation §5). Three tiers, never a fourth, each answering a genuinely different question:

- **Act Now** — a real, present decision a specific person must make, with a real verb attached. "*This* can be Approved, *that* can be Completed" (Architecture Freeze Declaration). **An Act Now item without an available verb isn't Act Now; it's Be Aware** (Architecture Freeze Declaration) — this is the literal test that separates the two tiers, not a matter of degree or urgency-of-tone.
- **Be Aware** — true, current, worth knowing, with no decision attached. An unset Purpose, a vacant Position, a document approaching expiry before it's urgent enough to demand action — real facts that earn a quiet place on Home without earning an interruption. Be Aware content has **no control at all; the absence of a control is itself the signal** (Visual Design System) — a person should be able to tell, without reading a label, that nothing is asked of them here.
- **History** — settled, past-tense, safe. What has already happened, narrated once, permanently, never re-interpreted (Audit Engine Design's own "History does not get to reinterpret the past," restated here as the experiential consequence of that architectural guarantee).

**Promotion and demotion are never manual.** An item's tier is a computed consequence of whether a real decision currently exists, not a status a person or an application sets directly. The moment a pending Approval is decided, it leaves Act Now — not because someone marked it read, but because the condition that put it there stopped being true. This is the direct behavioral meaning of Product Foundation's own "the subsystem owns the truth, RDIOS owns attention" (Product Philosophy): applications never manage their own Attention tier; they report what's true, and the Attention Engine alone decides where that truth belongs.

**Silence is not absence of function — it is the correct, ordinary outcome most of the time.** "The institution is calm this morning" (live, verified copy, cited in Institution Setup Experience v2) is not a fallback state the product settles for when it has nothing to say; it is what a healthy institution's Home honestly looks like most days, and manufacturing an Act Now item to avoid looking idle is a direct violation of this document (Institution Intelligence Principles §2 states the identical rule for Tamizhi specifically; it is restated here as the general rule every application already inherits, not an AI-specific exception).

## 2. How the tiers are visually distinguished, without relying on color

Restated in full from the Visual Design System, because this table is definitional to what "tier" means experientially, not merely a styling choice layered on top of an already-settled concept:

| | Size | Position | Contrast | Rhythm | Interactivity |
|---|---|---|---|---|---|
| **Act Now** | Largest among peers | Always topmost | Highest against background | Tight — urgency reads as closeness | A verb-labeled control is present |
| **Be Aware** | Mid-size | Always below Act Now | Soft — muted background tint | Generous — calm, unhurried | No control at all; the absence *is* the signal |
| **History** | Smallest | Bottom, or behind a scroll/click | Quietest — muted text | Left-aligned, evenly spaced | None — settled, past-tense, safe |

A colorblind person, or anyone with their monitor in grayscale, must read the identical hierarchy from this table alone (Visual Design System). Color, when applied, only ever confirms what size, position, contrast, and interactivity already established — it is never the only signal carrying a tier's meaning.

## 3. The Interruption Rule

**Drawers are the default for anything that isn't destructive. Dialogs are reserved for irreversible actions only** (Visual Design System). This is not a UI-styling preference — it is the concrete mechanism that keeps Attention's own "calm is a feature" (Product Philosophy) true in practice rather than only in prose. A drawer slides in from the edge the content is conceptually attached to, with the background staying visibly, dimly present — the person never truly left where they were. A dialog blocks the screen and demands an answer before anything else can happen, and that cost is reserved exclusively for actions that cannot be undone with a simple "undo" toast — delete, offboard, and nothing milder.

**Using a Dialog for routine data entry is a direct violation of this rule** (Visual Design System's own words: "that overuse is one of the most common sources of interruption-fatigue in business software, and it directly violates the frozen Interruption Rule") — named here as the formal source of the term "Interruption Rule" itself, since it appears by name in the Visual Design System without ever having been defined in one place before this document.

**Every future intelligence-touched feature inherits this without exception** (Institution Intelligence Principles §8): "Drawer over destination for anything reversible, exactly as the Visual Design System already requires of every other feature." Tamizhi does not get a bespoke interruption model; nothing does.

## 4. The Assistant Voice

**A single phrasing layer every OS-level surface routes through, so "calm, plain, one thing at a time" is enforced by one shared component, not by every developer remembering the rule independently** (Product Foundation §5). Concretely, every sentence a person reads on Home, in a History entry, in a Be Aware widget, or in a Tamizhi Recommendation is held to the same register:

- **Calm.** No urgency is manufactured to make a feature feel more important than it is. Institution Intelligence Principles §8 states the enforcement precisely for Tamizhi specifically — "no urgency Tamizhi manufactures is ever weighted differently from urgency a human-authored feature manufactured — both are equally wrong, for the same reason" — and that "for the same reason" is this document: the Assistant Voice does not have an AI mode and a human mode. It has one register.
- **Plain.** History entries are "one calm sentence and a relative timestamp... no per-event-type iconography" (Visual Design System) — "Ganesh Bhatt joined," not a jargon-laden system message. A sentence written in the Assistant Voice should be legible to the person it's about, not only to the engineer who built the feature that generated it.
- **One thing at a time.** Directly inherited from Product Philosophy's own "why every screen should answer only one question" — the Assistant Voice's job is partly to prevent a single sentence from trying to convey two facts at once, the same discipline applied at the level of a sentence that Product Philosophy applies at the level of a screen.

**Summaries render once, at write time, and are never recomputed on read** (Audit Engine Design) — the Assistant Voice is not a live rendering choice reapplied every time a person looks at a record; it is baked into the sentence the moment History records it, so that if the phrasing rules ever change later, an old record still reads exactly as it did when it happened.

## 5. Calm as a discipline, not a mood

Three restated rules, gathered from across the corpus because together they are the actual mechanism behind "calm," not merely an adjective applied to it:

- **Attention is earned, not assumed** (Product Philosophy). Only what is genuinely, currently a real decision gets to interrupt anyone; everything else waits quietly to be found.
- **If everything is marked urgent, nothing is** (Product Philosophy, drawing the hospital-alarm analogy directly). This is why there are exactly three tiers and never a fourth, more-urgent-than-Act-Now tier — Act Now is already the ceiling.
- **A feature that would not have been worth a sharp, well-liked colleague interrupting someone for is not worth this product interrupting someone for either** (Institution Intelligence Principles §1, restated here as the general test every Act Now contributor is held to, not only Tamizhi's).

## 6. Verb vocabulary

The Architecture Freeze Declaration's own accounting, preserved exactly, because it is the concrete evidence that "verb-shaped by construction" (§1 above) is a real, checkable property rather than a slogan:

**Already real, live-verified, generalizing directly from RDE precedent:** Approve, Reject, Complete, Assign, Invite, Offboard, Comment.

**Named, expected, not yet built — implementation work waiting for its moment, not an open design question:** Delegate, Escalate, Transfer, Suspend, Restore, Review. Every one of these rides machinery already frozen elsewhere in the Constitution (the Work Engine's application-layer implementation, Events, Audit) rather than requiring new architecture to add.

An Act Now item's control must always carry one of these — or a future verb built to the same standard — never a bare "View" or "Open," which are navigation, not decisions, and belong nowhere in Act Now.

## What this document does not decide

- **Visual tokens, themes, typography, spacing, motion** — governed entirely by the Visual Design System, which this document defers to completely for anything below the level of "which tier, which interruption class, which voice."
- **Tamizhi's specific behavioral contract** (when it speaks, stays silent, recommends, asks, refuses) — governed entirely by Institution Intelligence Principles, which this document supplies the general Experience Principles that document's own §8 explicitly inherits, never overrides.
- **What counts as audit-worthy, or how History is technically stored** — governed entirely by the Audit Engine Design; this document governs only how History *reads* to a person, never how it's written or persisted.
- **Anything institution-specific** — every principle above is platform capability, per Platform Integration Strategy §7's own test; none of it varies by institution type, terminology, or branding.

## The closing test

Every principle above already had to survive being cited correctly, unprompted, in eleven separate documents written by different people at different times across this entire engagement, each restating it precisely enough that this document could be assembled from their margins without inventing a single new rule. That is the actual proof this document asks to stand on — not that these principles sound right in isolation, but that they have already, quietly, governed every screen this platform has shipped, for the entire time this platform has existed, without ever once being written down in one place before now.
