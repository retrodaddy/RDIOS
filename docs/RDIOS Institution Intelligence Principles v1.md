> **ARUMBU is the product name introduced after this document was written.** Everything below was written under, and refers throughout to, the internal engineering name "RDIOS." That reasoning is preserved exactly as frozen — nothing in this document has been altered or renamed. "RDIOS" remains the correct internal/engineering term for the underlying platform this document describes; "ARUMBU" is what that platform is now called on every customer-facing screen.

Status: 🔵 Philosophy — no code, no UI, no architecture. Governs behavior, not placement: the frozen Platform Integration Strategy v1 §4 already settled where Tamizhi sits (a sibling product, never inside RDIOS, entering only through the Search provider registry and the Attention Contract) and the offline-safe test that keeps RDIOS from ever depending on it to function. This document picks up exactly where that one stopped — not *where* intelligence enters RDIOS, but *how it is allowed to behave* once it does. Every future application inherits this contract automatically; none of them design their own version of it.

# RDIOS Institution Intelligence Principles v1

## Context

M4 is next. Before it's built, before Work, before any application is designed with "and Tamizhi could help here" as an afterthought, this document exists to answer a harder question first: once intelligence is real inside RDIOS, what is it actually allowed to do, and on whose terms? Get this wrong and every application built afterward inherits the mistake silently — a Work Engine that lets its AI suggestion box grow into a second inbox, a Money application whose "smart" recommendations start feeling like a salesperson instead of a colleague. Get it right once, here, and every application after this one simply obeys a contract that already exists, the same way every application today already obeys the Attention Contract without re-deriving it.

**The document is not about Tamizhi's capabilities.** What Tamizhi can *do* — generate a video, draft a document, analyze a portfolio — is Tamizhi's own design authority, a separate product with its own roadmap, per the Platform Integration Strategy's explicit boundary. This document is about the much narrower thing RDIOS actually controls: the terms of the doorway. Anything that walks through RDIOS's two doors — a Search result, an Attention Contract contribution — plays by RDIOS's rules from that point on, regardless of how it was produced on the other side of the door. RDIOS doesn't need to understand Tamizhi to govern this. It only needs to hold every door to the same standard it already holds every human-authored feature to.

## The one distinction this document exists to protect

**Intelligence is a contributor, not a voice of its own.** Every one of the eight questions below resolves to the same underlying test: *does this behave exactly like any other contributor to Act Now, Be Aware, History, or Search already would — or does it quietly claim a privilege no human-authored application feature gets?* The moment intelligence gets its own channel, its own visual treatment, its own exemption from a rule that binds everything else, RDIOS has stopped being one coherent operating system and started being an operating system with a second, competing one bolted to its side. Every answer that follows is really just this sentence, applied to a different verb.

---

## 1. When should Tamizhi speak?

Only when what it has clears the identical bar any other Act Now, Be Aware, or History contributor already has to clear: real, present, true, and tied to an actual institutional fact — never to fill silence, never to demonstrate that it is working. A recommendation that would not have been worth a human colleague interrupting someone for is not worth Tamizhi interrupting someone for either. Speaking is not free just because generating the sentence was cheap.

## 2. When should Tamizhi stay silent?

The default state, not a fallback. Per the Product Philosophy's "attention should be earned, not assumed," silence is not something Tamizhi settles for when it has nothing to say — it is the correct, ordinary, unremarkable outcome most of the time, the same way Home already says "The institution is calm this morning" honestly rather than manufacturing an Act Now item to avoid looking idle. Tamizhi is never scored, tuned, or judged on how often it speaks. An intelligence layer that feels pressure to stay visibly useful will eventually start manufacturing reasons to talk, and that pressure is the actual root of every "AI feature" that institutions learn to ignore within a month.

## 3. When should Tamizhi recommend?

When a real decision a person must make anyway has a well-supported answer Tamizhi can offer — and only ever as an ordinary Act Now card: same shape, same tiering, same mandatory verb the Architecture Freeze Declaration already requires of every Act Now item, indistinguishable at a glance from a card any non-AI application feature produced. A recommendation is not a decision. The verb still belongs to a person; Tamizhi's job ends at "here's what I'd do and why," never at "done." If a recommendation ever needs a different visual treatment to read as trustworthy, that is a sign the recommendation itself isn't good enough yet — not a case for giving it a badge.

## 4. When should Tamizhi ask questions?

Only when it is missing something it genuinely needs and the cost of asking is clearly lower than the cost of a wrong guess — and even then, at Be Aware's calm register by default, never at Act Now's urgency, unless the missing fact is truly blocking something a person already needs to act on right now. Tamizhi does not interview people to build a profile of them. One well-placed question, asked once, at the moment it's actually needed, is the entire budget. A system that asks questions to seem thorough is doing the same thing as a system that speaks to fill silence — spending trust it hasn't earned yet.

## 5. When should Tamizhi create work automatically?

Only through the same Automation mechanism the Platform Integration Strategy already named as ordinary machinery — reacting to a real Event and creating or assigning a Work Item — never through a parallel, AI-specific creation path. Every item it creates is owned by a real person from the moment it exists, is written to History with the same honesty a human-initiated action would be, and is never irreversible on its own authority. If a Work Item Tamizhi created is indistinguishable in the log from one a person created by hand — same shape, same accountability, same trail — it was built correctly. If it needs a special "created by AI" asterisk to be trusted, it wasn't ready to create work yet.

## 6. When should Tamizhi refuse?

Whenever an action would require it to guess at authority it hasn't actually been granted, whenever it would be irreversible and Tamizhi isn't certain, and whenever the honest answer is "I don't know" rather than a confident approximation dressed up to look like an answer. Authorization — who is actually allowed to decide this — is Authority & Permissions' job (M5), not something Tamizhi improvises around in the meantime; until that resolver exists for real, Tamizhi's default posture toward anything permission-shaped is to say so plainly and stop, the same way a new employee who doesn't yet know the rules asks rather than acts. A refusal that states its own limits clearly is more trustworthy than a confident answer that turns out to be wrong, and RDIOS should treat it that way — refusal is not a failure state to design away.

## 7. How does Tamizhi avoid becoming another notification system?

By having no channel of its own to become one through. No separate AI inbox, no push notifications with their own settings page, no unread badge counting Tamizhi's opinions as if they were a queue to clear. Everything it contributes enters through the same three doors every application already uses — Act Now, Be Aware, History — and is subject to the same tiering discipline, the same "quiet unless said" rule the org-shape mechanism was already held to, the same Interruption Rule every other feature in RDIOS obeys. The moment intelligence gets a notification surface that behaves even slightly differently from everything else — a different sound, a different badge, a different place it can reach a person — RDIOS has built the second inbox this whole document exists to prevent, just with better manners.

## 8. How does Tamizhi respect the RDIOS Experience Principles?

By never being exempted from any of them. Verb-first: every Act Now contribution carries a real verb a person performs, never "Reviewed by AI" standing in for one. Calm: no urgency Tamizhi manufactures is ever weighted differently from urgency a human-authored feature manufactured — both are equally wrong, for the same reason. Tiered, never forced: a recommendation is Act Now only if it would have earned that tier from a human colleague; otherwise it waits in Be Aware like everything else that isn't yet a real decision. Drawer over destination for anything reversible, exactly as the Visual Design System already requires of every other feature. Offline-safe, per the Platform Integration Strategy: every screen, every card, every search result continues to work correctly with Tamizhi entirely disconnected, because RDIOS calls Tamizhi and is never called by it. None of this is a special "AI mode" of the Experience Principles. It is the Experience Principles, applied without a carve-out.

---

## What this means, practically, for every application built after this document

Work, Money, Customers, Projects, Documents, Reports — none of them design their own answer to "how should our AI feature behave." That question is already closed, here, once, for all of them. When the Work Engine is built with "Tamizhi could help here" in mind, the help has to arrive as an ordinary Act Now card a person can act on, not a chat window bolted to the side of the screen. When Money eventually wants Tamizhi to flag an anomaly, the flag is Be Aware until it's genuinely someone's decision to make right now, exactly like every other Be Aware item earns its place. No application gets to reopen this document to justify a shortcut — the same discipline the Architecture Freeze Declaration already holds every other frozen decision to.

## The closing test

Two questions, asked of every future intelligence-touched feature before it ships, neither one optional:

**If a sharp, well-liked colleague had done exactly what Tamizhi just did — said exactly that, at exactly that moment, in exactly that tier — would it have felt like good judgment, or would it have felt like they were showing off, nagging, or covering themselves?** If the honest answer is anything but good judgment, the feature isn't ready, no matter how capable the underlying model is.

**If Tamizhi vanished tonight, would every screen in RDIOS still make complete sense tomorrow morning?** The answer must always be yes. Institution Intelligence exists to help a person reach their own institution faster — never to become something they have to reach *through* to get there, which the Product Philosophy already named as the one thing RDIOS can never allow AI to become.
