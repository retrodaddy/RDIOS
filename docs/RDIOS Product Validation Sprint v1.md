> **ARUMBU is the product name introduced after this document was written.** Everything below was written under, and refers throughout to, the internal engineering name "RDIOS." That reasoning is preserved exactly as frozen — nothing in this document has been altered or renamed. "RDIOS" remains the correct internal/engineering term for the underlying platform this document describes; "ARUMBU" is what that platform is now called on every customer-facing screen.

# RDIOS Product Validation Sprint v1

## What this document is

This is not a bug report. This is not a QA pass. This is not an architecture review — the Constitution is frozen and nothing here proposes touching it.

This is a record of one week spent actually running an institution inside RDIOS: signing up, inviting people, building an organization, assigning responsibility, creating and approving work, escalating a stuck decision, offboarding someone, and coming back the next morning to do it again. It was done as a founder would do it — cold, without reading the code, without knowing where the seams are.

Two institutions were lived in over the course of the sprint: **Riverstone Manufacturing** (a company, run in depth — organization, invitations, appointments, tasks, approvals, escalation, offboarding, all exercised end to end) and **Sri Meenakshi Temple Trust** (a temple, run more briefly, specifically to test whether the product's language holds up outside a company context). Personas actually inhabited, not merely imagined: the founder (Alan Reyes / Krishnan Iyer), a plant manager who held real responsibility and decided real approvals (Priya Nair), a finance head who was later offboarded mid-sprint (Ravi Shah), and someone invited who never got as far as accepting (Meera Iyer).

Every finding below is something that was actually seen on screen, not inferred from reading source. Findings are ordered most severe first.

---

## Findings

### 1. An offboarded person can still sign in and read everything

**Observation.** Ravi Shah was offboarded as Finance Head — the confirmation dialog said clearly that "every position and affiliation Ravi Shah currently holds... will be ended at once." It was. His position card correctly flipped to "Ended." Then, out of curiosity, the sprint signed back in as Ravi at the ordinary login screen. It worked. Ravi landed on a fully populated Home: the institution's purpose, its organization counts, its open work counts, and — most strikingly — the full History feed, including the line "Alan Reyes offboarded Ravi Shah (1 position(s), 0 affiliation(s) closed)." He could read the news of his own departure, and everything the institution had done before and after it, from his own former desk.

**Why it matters.** Offboarding is the one moment in the sprint where an institution is explicitly telling the software "this person no longer belongs here." A founder who clicks that button is not thinking about positions and affiliations as separate technical concepts — they are thinking "get them out." Finding out that "out" still means "can read the whole institution's operating history" would not just be a surprise, it would be the kind of thing that makes a founder stop trusting the product with anything sensitive. This is the single sharpest gap between what the software did (correctly, by its own internal model) and what a founder would have assumed it did.

**Severity.** Critical.

**Suggested direction.** Offboarding, as an experience, should mean the person's relationship with the institution is over — not just that their seats are empty. Whatever "leaving" means for account access needs to be part of what offboarding promises, not a separate, undiscovered gap next to it.

---

### 2. The founder isn't seated in the institution they just built

**Observation.** Alan Reyes created Riverstone Manufacturing, wrote its purpose, and built out an org chart with a "Founder & CEO" position at the top. That position sat there marked "Unfilled" the entire time — Alan's own profile page said "Holds no position yet." Nothing in the product prompted this to be fixed. It only got noticed and corrected by deliberately opening Alan's profile and appointing him.

**Why it matters.** The founder bypass in the permission model means this never blocked anything Alan could do — but that is exactly the trap. The software worked fine underneath, while the picture on screen (an empty box at the top of your own company, right after you built it) told a different, unsettling story. A founder who never happens to click into their own profile would go on running their institution for weeks believing — correctly, by what they can see — that nobody, including them, is Founder & CEO.

**Severity.** High.

**Suggested direction.** The moment an institution is created, its creator's relationship to it should already be visible and named on screen — not something they have to go discover and fix in a second, separate action.

---

### 3. Approve / Reject / Escalate render before it's known whether you're allowed to decide

**Observation.** As Priya (Plant Manager, responsible for "Manage work" only), opening an approval waiting on "Invite new people" showed the exact same three buttons — Approve, Reject, Escalate — as the approval she actually could decide. Clicking Approve produced a calm, correctly worded rejection: "Deciding the Invite new people step isn't your responsibility here." The system was right. But the button invited the click first and explained why not only after.

**Why it matters.** The founder's own framing draws a line between an action that "increases confidence" and one that "merely completes successfully" — or in this case, merely fails cleanly. A button that looks equally actionable whether or not you can actually use it asks the person to find out the hard way. Over a real week of use, across many approvals a person doesn't hold, this becomes a small tax on trust paid over and over — not a broken feature, but a repeated little "no" where a "this isn't yours" would have been kinder to see coming.

**Severity.** High.

**Suggested direction.** Someone looking at an approval they cannot decide should be able to tell that from the shape of the screen itself, before they reach for a button.

---

### 4. The words a Trustee reads are the same words a Plant Manager reads

**Observation.** Building out Sri Meenakshi Temple Trust's organization and opening a position's "Responsible for" list showed exactly the same four lines seen in Riverstone Manufacturing: "Invite new people," "Manage positions and people," "Offboard someone," "Manage work" — same labels, same descriptions, word for word. Meanwhile, one screen away, the product's own navigation and empty states had already adapted beautifully: the same route that reads "CLIENTS — Who are we supplying?" for the manufacturing company reads "COMMUNITY — Who are we serving?" for the temple. The contrast is stark precisely because half the product clearly knows how to do this and the other half doesn't yet.

**Why it matters.** This is the exact place the founder's own test — "would a temple trustee naturally say this?" — bites hardest. "Offboard someone" is clinical, HR-department language; a trustee setting up their temple's first seats is not going to recognize their own institution in that phrase, even though every other screen around it has been speaking their language. Governance and Policy are meant to be the part of RDIOS every future application inherits unchanged — which makes this the highest-leverage place for institutional language to either hold or crack.

**Severity.** High.

**Suggested direction.** Nothing about the underlying four responsibilities needs to change — only whether the words describing them can flex the same way the rest of the product already does.

---

### 5. "Good evening" next to "calm this morning"

**Observation.** Every Home screen visited in the evening opened with "Good evening, [Name]." directly above "The institution is calm this morning." Reproduced consistently across both institutions and multiple sign-ins.

**Why it matters.** It's small, but it's exactly the kind of seam the founder's brief asks to be caught — a place where the software reminds you it's software instead of disappearing. "Calm" is the right word; "this morning" undermines the very calm it's trying to name, because the reader's eye catches the mismatch before the meaning lands.

**Severity.** Medium.

**Suggested direction.** Whichever of the two is meant to track real time of day should track it consistently in both places.

---

### 6. Five destinations that all say "nothing here yet" — with no sense of when, or what to do about it

**Observation.** Money, Clients/Community, Projects, Documents, and Reports all sit in the primary navigation, all fully reachable, and every single one currently reads: "Nothing here yet — it will appear the moment [institution] has some." No call to action, no sense of whether "some" is something the founder is supposed to go create right now or a capability still being built. By contrast, Settings — one tab over — is explicit: "Invitations are ready today; naming, branding, and business rules are on the way." That one sentence does more to keep trust intact than all five empty states combined.

**Why it matters.** A founder doing their morning walk-through, exactly as this sprint's brief describes, will click every tab at least once early on. Landing on five identical dead ends in a row — dead ends that give no hint whether they're "not built yet" or "just empty right now" — is the fastest way to make someone stop trusting the nav bar to mean what it says.

**Severity.** Medium.

**Suggested direction.** Settings already shows the pattern that works: say plainly what's here and what's coming. The other empty destinations don't need to explain the roadmap, just need to stop being indistinguishable from each other.

---

### 7. An invite link exists exactly once, in exactly one place, for exactly one moment

**Observation.** Inviting Priya, then Ravi, then Meera in a row, the settings screen showed only the most recently generated link each time — the previous one wasn't visible anywhere, listed nowhere, findable nowhere. If a founder invites three people in one sitting and doesn't immediately paste and send each link before creating the next, the earlier ones are simply gone from the screen (though presumably still valid — this wasn't verifiable without already knowing the URL from having captured it a step earlier).

**Why it matters.** Real invitation flows are rarely one person at a time with an uninterrupted send in between. A founder building a five-person institution in one sitting, the way this sprint did, would lose track fast.

**Severity.** Medium.

**Suggested direction.** Pending invitations that haven't been accepted yet should stay visible and retrievable somewhere, not only at the instant they were created.

---

### 8. "No active institution for this account yet" doesn't say what to do next

**Observation.** Meera Iyer was invited but never accepted. Signing in with her email at the ordinary login screen (not her invite link) produced: "No active institution for this account yet." True, calm, and a dead end — it doesn't mention that an invite link exists, or that she should ask Alan to resend it, or anything else actionable.

**Why it matters.** This is precisely the "invited but not yet accepted" persona the sprint's brief asked to be tested, and it's a real, plausible way someone would end up at this screen — losing the original link, or trying the front door out of habit. The message is honest about the problem without helping solve it.

**Severity.** Medium.

**Suggested direction.** Someone in this state should come away knowing what to do, not just what's wrong.

---

### 9. Every "Responsible for" checkbox reads as "on" to anything but eyes

**Observation.** In the Position side panel, the four responsibility checkboxes are visually laid out with clear labels next to them — but each one, read directly, is a checkbox literally named "on," indistinguishable from its siblings.

**Why it matters.** This is invisible to the sighted walkthrough this sprint mostly consisted of, which is itself the point — it wouldn't have been caught at all except for reading the page structurally. A founder or trustee relying on assistive technology to build their organization would find four identical, unlabeled toggles where everyone else sees four clearly different responsibilities.

**Severity.** Medium.

**Suggested direction.** Each checkbox should announce which responsibility it toggles, not just display it.

---

### 10. Editing a position's description leaves no trace of having saved

**Observation.** Typing a free-text description into Plant Manager's "What this position is responsible for" field, then closing the panel, gave no confirmation the text was kept — no saved indicator, no toast, nothing distinguishing "saved" from "about to vanish."

**Why it matters.** Small, but it's a "did this increase confidence, or just complete" moment in miniature. Most of the rest of the product (task completion, approval decisions, appointments) confirms itself clearly through the History feed and status changes. This one field is quieter than its neighbors for no apparent reason.

**Severity.** Low.

**Suggested direction.** Bring this in line with how confidently everything else in the product confirms itself.

---

## What held up

The point of this sprint was to find where the floor gives way, not to hand out praise — but an honest picture needs the parts that didn't crack too, because they're load-bearing for the answers below.

The **Attention Contract** did exactly what M6 set out to prove: Priya's Home showed precisely the two things that were hers to do, no more, no less, and precisely excluded the approval she had no standing on — this was verified, not assumed, by comparing her Home against Alan's and against what she could and couldn't act on in Work.

**Same-actor exclusion held even against the founder.** Alan, despite holding every permission through founder bypass, was correctly and unconditionally blocked from deciding an approval he had created himself — the rule that a request and its decision can never be the same person survived contact with the one identity in the system that bypasses everything else.

**Escalation worked exactly as the Governance model describes**, end to end, on the first real attempt: an approval stuck on a vacant position's responsibility, escalated by the plant manager, correctly and automatically became decidable by that vacant position's parent — no manual reassignment, no dead end.

**Institution-aware language, where it has been built, is genuinely convincing** — the same route reading "Who are we supplying?" for a manufacturer and "Who are we serving?" for a temple, without missing a beat, is the clearest evidence in the whole sprint that RDIOS's core idea (one operating system, many institutions) is real and not just aspirational.

---

## The five questions

**1. Would I trust RDIOS to run my institution today?**
Not yet, and the offboarding finding above is the reason, not a supporting detail — it's the reason on its own. Everything else on this list is the kind of friction a founder learns to route around. Discovering that offboarding someone doesn't actually end their access is the kind of thing that makes a founder start double-checking the software instead of trusting it, and that changes the relationship for everything else in the product too.

**2. Would I enjoy using it every morning?**
The moments that worked — the Attention Contract, the escalation, the language that adapts to the institution — are genuinely calm and genuinely different from a pile of business apps stapled together. Those moments were enjoyed. But five identical dead-end tabs and a mistimed "good evening" are the kind of small frictions that accumulate across a real week in a way a single walkthrough doesn't fully capture, and this sprint felt that accumulation by day two.

**3. What are the ten biggest sources of friction?**
The ten findings above, in the order given — offboarding access, the unseated founder, false-affordance approval buttons, generic responsibility language, the greeting mismatch, the five bare destinations, the disappearing invite links, the dead-end login message, the unlabeled checkboxes, and the silent-save description field.

**4. What single improvement would create the biggest increase in trust?**
Make offboarding actually end someone's relationship with the institution — including whatever "being able to sign in and look around" means. Nothing else on this list threatens trust the way that one does, because it's the one place the software's internal correctness and the founder's plain-language expectation point in opposite directions.

**5. Is RDIOS ready for M7, or should another validation sprint happen first?**
Not ready yet — not because Work or People are shaky (they held up well under real, sustained use this week) but because the offboarding gap is a trust question, not a Finance question, and Finance & Assets is the one module where trust matters most before a single feature is built. Close the offboarding gap, and take one more pass at whether the responsibility language can adapt the way the navigation already does — that second one matters more for M7 specifically, since Finance is exactly where a temple trustee's, a hospital administrator's, and a factory owner's vocabulary diverge the hardest. After that, this sprint's honest read is that RDIOS is close.
