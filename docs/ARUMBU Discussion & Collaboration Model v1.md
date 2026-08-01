Status: 🔵 Architectural investigation — design only, no code, no schema, no roadmap change, no constitutional amendment, no UI, no API. The ARUMBU Constitution v1 is treated as permanently frozen and immutable throughout. This document's own title uses the word "Discussion" only because the founder's brief was already titled that way when the investigation was commissioned — the investigation itself, per the founder's own explicit instruction, was run without assuming that word, or any of the other six candidate words offered alongside it, was the correct name. Where the evidence lands on a different, already-frozen word, this document says so plainly, including in its own conclusion.

# ARUMBU Discussion & Collaboration Model v1

## Method, and the one rule this investigation holds itself to more strictly than the ones before it

Every prior investigation in this series (Operational Object, Operational Flow) reached its verdict honestly, but this one carries an extra discipline the founder named explicitly: don't let the word chosen for the phenomenon decide the outcome before the evidence does. So this document does not open by defining "Discussion." It opens by asking what the recurring pattern actually is, in plain description, and only asks which of seven candidate nouns — Discussion, Conversation, Collaboration, Thread, Journal, Commentary, Activity Stream — fits it, after the architecture has already been decided by evidence. The naming question is answered last, in the verdict, not first.

**The phenomenon, described without naming it yet:** people talk to each other about a specific institutional thing, and that talk sometimes matters enough to remember and sometimes doesn't.

---

## Q1 — Definition, and the collapse test, run against all three named candidates before anything else

**Attempt at one sentence:** *[The phenomenon] is the record of what people said to each other about a specific institutional thing, kept exactly as durable as the thing it was said about deserves.*

**Does it collapse into Project?** No. Tested directly: the phenomenon attaches to far more than Projects — a Task, a Document, a Position, an Expense, even a Tamizhi Recommendation (§Q2) can all plausibly be talked about. Project is one subject among many, not the boundary of the pattern. This is the one candidate this document can reject cleanly and immediately.

**Does it collapse into History?** **Partially, precisely, and the precision matters more than the yes/no.** History is append-only, narrated once, immutable, and answers "what happened" (Audit Engine Design's own frozen definition). Ordinary conversation is often none of those things — people correct typos, retract a half-formed thought, ask a question that turns out to be irrelevant five minutes later. Forcing all conversation into History's own immutable shape would be wrong, for the identical reason the Universal Record Model already refused to force universal Versioning onto every Record type (§3 of that document: "symmetry purchased at the cost of real complexity nobody asked for"). **But a specific, narrow subset of conversation — a decision reached, an instruction given, evidence captured — is exactly History-shaped, and pretending otherwise would be equally wrong.** This partial, bounded collapse is the single most important finding this document produces, and §Q5/§Q9 build directly on it.

**Does it collapse into Comments?** **Yes, almost entirely, and this is the finding the rest of this document has to take most seriously.** The Universal Record Model already named this pattern, under this exact name, three investigations ago: *"Comments — included here, but honestly the weakest-evidenced entry on this list: real value for Work (already built) and plausible value elsewhere, but the case for it being structurally required... was not found. Kept as a universal door rather than promoted to mandatory or demoted to rejected."* Every property this investigation's own working definition names — attaches to a Record, sometimes matters enough to remember, sometimes doesn't — is already, precisely, what that sentence describes. **Per this document's own rule ("reject immediately if it duplicates an existing concept"), the phenomenon does not earn a new name at the point of definition.** What remains open, and what the rest of this document actually investigates, is not *whether* this is Comments, but *what Comments needs to become* to correctly hold the weight this investigation's brief describes — a materially deeper question than the Universal Record Model had reason to ask when it first, correctly, left Comments as the weakest-evidenced door on its list.

---

## Q2 — Where communication belongs, domain by domain

| Domain | Where communication naturally belongs | Independent existence needed? |
|---|---|---|
| **People** | On the Person or Membership (a performance conversation, an onboarding note) | No — attaches, doesn't stand alone |
| **Community** | On the Contact — already close to how Community's own relationship notes already feel today | No |
| **Work** | On the Task or Approval — the Universal Record Model's own already-confirmed strongest case | No |
| **Money** | On the Expense/Income (why a transaction was categorized a certain way) | No |
| **Projects** | On the Project — reconfirmed as the Operational Flow investigation's own central finding: Comments should default to aggregating here | No |
| **Documents** | On the Document — a genuinely new, legitimate use case this investigation surfaces that neither prior document named explicitly: review-style feedback on a Document's own content ("this clause needs revision"), distinct from Documents' own versioning mechanism | No |
| **Reports** | Weak fit — conversation "about a Report" more naturally belongs on whatever Record the Report's own numbers concern, not the frozen snapshot itself | No |
| **Search** | None — Search owns no content of its own to discuss | N/A |
| **History** | None — History is the read surface, never itself a subject; a History *entry* could theoretically be referenced, but this is an edge case not worth pursuing further here | N/A |
| **Tamizhi** | **A second genuinely new use case: should a person be able to discuss a Recommendation with a colleague before Accepting, Dismissing, or Deferring it?** Real and plausible — today Tamizhi offers exactly three verbs and nothing in between. Comments attached to a Recommendation require no change to Institution Intelligence Principles or the Recommendation Model itself — it is simply one more Record type Comments can attach to, and the decision itself remains, unchanged, a human Accept/Dismiss/Defer act. | No |
| **Authority** | None directly — Areas of Responsibility aren't conversational subjects | N/A |
| **Operational Intelligence** | None on the Signal itself (deterministic arithmetic has nothing to discuss) — but the *implications* of a Signal are exactly the kind of thing worth discussing on whatever Record the Signal is attributed to, already covered by that Record's own Comments | N/A |

**The finding, stated once: nothing in this table requires communication to exist independently of a Record. Every legitimate instance attaches to something that already has a home.** This directly confirms Q1's own collapse finding from a second, independent angle.

---

## Q3 — Fourteen industries: who talks, why, where, and when it becomes memory

Depth focused specifically on the "when does it become institutional memory" question, since that is where this investigation finds its real substance, not in re-proving the attachment pattern already confirmed in Q2.

**Garment Manufacturing.** Merchandiser and Vendor discuss a quality defect on Order 248. Becomes memory the instant a real decision is reached ("accept with a discount" or "reject the batch") — the decision, not the back-and-forth that led to it, is what deserves permanence.

**Hospital.** A Nurse and Doctor discuss a patient's changing symptoms. **The sharpest high-stakes case in this entire investigation** — in many real jurisdictions, clinical conversation about patient care is itself legally part of the medical record. This is direct, concrete evidence that some conversation must be capable of becoming immutable memory *at the moment it's said*, not only retroactively when a decision crystallizes.

**School.** Teacher and Parent discuss a disciplinary concern. Casual back-and-forth stays ordinary; the moment a formal decision (a suspension, a plan) is reached, that specific exchange deserves permanence.

**Construction.** Site Engineer and Contractor discuss a safety concern. **Here, waiting for "a decision" is itself the wrong model** — a safety-relevant statement is worth capturing the moment it's made, regardless of whether a decision follows immediately, for the same liability and regulatory reasons the Hospital case already established.

**Government.** A Case Officer and a citizen, or two departments, discuss an Official File. Plausibly the entire conversation, not only its conclusion, needs to be part of the permanent record — transparency and right-to-information obligations frequently require exactly this.

**Software Company.** A Developer and PM discuss a bug. Mostly ordinary and disposable; becomes memory only if it documents a genuine architectural decision worth remembering later.

**Retail.** Store Manager and Supplier discuss a delayed shipment. Ordinary until a real commercial consequence (a penalty invoked, a partial shipment accepted) is reached.

**NGO.** Field Officer and Programme Manager discuss a beneficiary's changing needs. Becomes memory at the moment a resource-allocation decision is made — donor accountability requires exactly this trail to exist.

**Temple.** Trustees discuss festival budget allocation. The conversation is context; the actual financial commitment is already captured by Finance's own Approval mechanism — conversation here is precursor, not the record itself.

**Church.** Pastoral counseling. **The one case in this investigation that produces a genuine, important exception, not a variation on the pattern**: some institutional conversation should never be captured by this mechanism at all, for reasons of confidentiality and trust that outrank institutional memory's own value — named honestly here because pretending every conversation should be capturable would be a real overreach this document specifically warned itself against.

**Logistics.** Dispatcher and Driver discuss a route delay. Ordinary unless it affects a delivery commitment.

**Agriculture.** Farm Manager and Agronomist discuss pest treatment. Becomes memory if it drives a real input-application decision, directly producing a Resource Transaction per the Measurement & Resource Model.

**Mining, Power Plant.** Operators discuss an anomaly during a shift. Same high-stakes, capture-at-the-moment-of-statement reasoning as Construction and Hospital — safety-relevant conversation, not merely decision-relevant conversation, deserves immediate permanence in these specific institution types.

**The pattern found, stated once: "capture only the decision" is correct for most institutions, and dangerously insufficient for a specific, identifiable subset (hospitals, governments, safety-regulated industries) where the surrounding conversation itself carries institutional and legal weight.** This is not a contradiction requiring two different mechanisms — it is exactly the kind of institution-specific posture the Institutional Policy Model already exists to hold, tested directly in §Q5.

---

## Q4 — Message ownership: attempting to prove every option wrong

- **Person** — wrong as the primary owner. "Where is Order 248" not "what did Ravi say," per the founder's own brief, is direct, repeated evidence across this entire investigation series that person-centric ownership doesn't match how institutions actually think about their own conversation.
- **Task, Document, Approval, Community Contact, Position** — each individually too narrow; Q2 already confirmed conversation legitimately attaches to all of these and more.
- **Project** — too narrow in the other direction, per Q1's own finding; not everything discussed is Project-scoped.
- **Institution** — too broad; a message about a specific Order shouldn't be filed at the level of the whole institution, which would make it undiscoverable exactly where someone would look for it.
- **The option that survives, because it's the only one that isn't a single Record type: the message belongs to whichever real Record it's about, via the identical polymorphic `subjectType`/`subjectId` pattern the Audit Engine already uses for every other kind of institutional fact.** This is not a new ownership model — it is the same mechanism History, Documents' relationships, and Operational Signals already use, applied here for the fourth time in this corpus, which is itself evidence this is the correct, converged answer rather than a coincidence.

---

## Q5 — Permanence: should every category survive forever?

**No — and the categories named in the brief split cleanly into two groups once tested against Q3's own evidence, rather than needing a bespoke rule per category.**

- **Ordinary, editable, deletable within reason** — Temporary, Operational, Question, Announcement. These are the Software Company bug discussion, the Retail shipment-delay chat, the ordinary back-and-forth before a Hospital decision crystallizes. Treating these as immutable from the moment they're typed would manufacture exactly the kind of institutional anxiety Experience Principles already warns against — nobody should feel watched for asking a clarifying question.
- **Promotable to immutable, History-linked permanence** — Decision, Instruction, Evidence. The moment a message is marked (by its author, or automatically when it produces a real institutional consequence — an Approval, a Resource Transaction, a Policy exception) as one of these three, it becomes append-only, exactly the "corrections are new records, never edits" discipline the Audit Engine already guarantees for everything else it holds. This is not a new immutability rule — it is the existing one, applied to a message the moment that message earns the weight of an institutional fact.

**The Construction/Hospital/Mining/Power-Plant exception, named precisely rather than left implicit:** for institution types where safety- or clinically-relevant conversation must be captured at the moment it's said, not only once a decision follows, an institution should be able to configure — via an ordinary Policy, compiled to a Business Rule exactly as the Institutional Policy Model and Constitutional Clarifications already specify — that messages tagged with a specific category (Safety) default to Evidence-permanence automatically, rather than waiting for a person to remember to promote them. **This reuses the Policy → Business Rule mechanism already frozen elsewhere in this series; it does not invent a new configuration concept.**

**The Church exception, equally precise:** an institution may also configure, via the identical Policy mechanism, that certain conversation contexts (pastoral, HR-sensitive) are never captured by this mechanism at all — the platform's own honest recognition that not every institutional exchange should become institutional memory, no matter how disciplined the immutability guarantee is for the ones that do.

---

## Q6 — Attachments: messages or Records, and how they interact with Documents

**Neither owns attachments outright — the correct answer, tested directly against duplication risk, is that a shared attachment defaults to belonging to the message until it earns the weight of a Document, at which point it becomes one, using the mechanism that already exists rather than a second one.** A quick photo shared for context in an ordinary conversation ("here's what the defect looks like") stays exactly that — casual, ephemeral, message-scoped, no different in kind from any other content inside an ordinary, editable message. **The moment that photo has lasting institutional value — evidence for a quality dispute, a design file that will be referenced again later — it should become a real Document**, through M10's own already-built "a Document is not a file" mechanism, cross-referenced from the message rather than duplicated inside it. **This is the identical promotion logic already established in Q5 for the message itself, applied a second time to what the message carries.** Nothing about this requires Documents to change, and nothing about it requires a new attachment concept — it requires exactly one small rule: an attachment only ever has one canonical home at a time, either the message or a Document, never both, so no institution ever has to wonder which copy is authoritative.

---

## Q7 — Mentions: what survives organizational change best

**Tested directly against Governance §5's own already-frozen reasoning, which answers this question almost word for word without needing to be re-derived**: *"a chain that had been built naming Priya specifically would need to be found and rewritten the same week she left... every institution running RDIOS for real would eventually accumulate exactly that kind of quiet rot."* The identical logic applies to mentions precisely: **a mention of a Person is fragile — it silently goes stale the moment that person leaves the Position the mention actually meant to reach. A mention of an Area of Responsibility or a Position is durable — it continues to resolve correctly to whoever currently holds it, forever, exactly the way an Approval Chain already does.**

**The resolution, not a rejection of Person-mentions but a precise scoping of when each is correct:** mention a **Person** for genuinely personal address ("thanks, Ravi, for catching this") — a real, legitimate, human use that shouldn't be engineered away. Mention an **Area of Responsibility** or **Position** whenever the intent is "whoever is responsible for this" — the far more common institutional case, and the one this investigation's own worked example (§Q8) depends on getting right.

---

## Q8 — Notification routing: rejecting naive broadcasting

For the worked example — a discussion on Production Order 248, with Merchandiser, Supervisor, Vendor, Owner, QA, and Finance all named as participants — **"notify everyone on every message" is rejected immediately and completely**, for the identical reason every prior notification-routing investigation in this series has already rejected it: it is exactly the manufactured, undifferentiated urgency Product Philosophy names as the failure mode that trains people to stop trusting a signal.

**The correct routing, derived entirely from mechanisms already frozen, not invented here:**

- A person actively participating in the thread (has posted, per ordinary conversational courtesy — not a new concept, simply how any conversation already works) sees new messages the way anyone would, at whatever cadence they're already checking the Record.
- A person **mentioned**, per Q7's own durable-mention discipline, is notified through Attention exactly the way any other Attention-worthy fact already reaches Home — no new tier, no new mechanism.
- A person holding the **Area of Responsibility** the conversation's category implies (Finance, if the message is tagged financially relevant) is notified only if the message is promoted (Q5) — ordinary chatter does not page Finance.
- The **Owner** is notified only via Governance's own Escalation mechanism, if something genuinely unresolved crosses into their own held Area — never as a default recipient of routine operational conversation, for the same reason named in both prior investigations in this series.

**Nothing here required a new routing concept.** Every clause above reuses a mechanism this series has already named at least once — Governance's Areas, Attention's own composition, Escalation.

---

## Q9 — Institutional memory: when does conversation become History, and how does it hold up under real scrutiny

**Directly answered by Q5's own promotion mechanism, restated here at the level this question specifically asks:** conversation becomes institutional memory the moment it is promoted — deliberately, by a person, or automatically, by a Policy-configured category default (Safety, per the Construction/Mining/Power-Plant finding). Before promotion, it is ordinary, mutable content, no different in kind from any casual exchange. After promotion, it inherits the Audit Engine's own existing guarantee completely.

**Should deleted messages disappear?** Only before promotion. An unpromoted, ordinary message may be deleted by its author, the same way any casual remark can be retracted — nothing institutional was ever staked on it. A promoted message cannot be deleted, ever, for the identical reason a Ledger entry or an Audit record cannot be — this is not a new rule, it is the existing one, simply now correctly scoped to apply only after the moment a message earns it.

**Should edits remain visible?** For a promoted message: yes, and per the Audit Engine's own already-frozen discipline, a correction is a new record referencing the one it corrects, never an edit in place — "an audit trail that can be edited after the fact isn't a trail, it's a draft," restated here for conversational content rather than a Ledger entry.

**Should decisions be immutable?** **Yes — but with one sharp, important boundary this investigation surfaces precisely: a decision reached "in conversation" is never, on its own, a legitimate substitute for a real institutional decision made through Governance's own Approval Chain.** A promoted "Decision" message is a durable *record that a decision was discussed and reached* — it is not, and must never become, a bypass around Work's own Approval mechanism. If Production Order 248's quality dispute is genuinely resolved by conversation, the actual institutional Approval (accepting the batch, adjusting payment) still has to happen through Work's own Governance-gated Approval flow; the promoted message is evidence and context sitting beside that Approval, cross-referenced to it, never a replacement for it. **This is the single most important guardrail this document names, because failing to draw it precisely would let conversation quietly become a second, ungoverned decision-making channel — exactly the failure Governance's entire model exists to prevent.**

**Tested against hospitals, governments, courts, and NGOs directly:** every one of these institution types is precisely the kind that would notice, immediately and consequentially, if a "decision" made in chat were ever treated as equivalent to a real, governed Approval. The boundary named above is not a theoretical caution — it is the specific thing that keeps this entire model safe to build at all for exactly the institution types this platform names as its hardest, highest-stakes customers.

---

## Q10 — Slack, Teams, Chime: architecture, not features

**What these systems fundamentally optimize for, stated precisely: real-time, person-and-channel-centric, engagement-driven ephemeral exchange.** Their organizing unit is "who is in this channel or this DM," not "what institutional thing is this about." Their notification design (badges, typing indicators, presence, unread counts) is built to maximize attention capture and responsiveness, not to protect calm or earn attention the way Experience Principles already requires. Their retention model treats every message as equally disposable by default, with permanence as an afterthought (a pinned message, a saved item) rather than a structural property decided by what the message actually is.

**Should ARUMBU optimize for the same thing?** **No, and this document can now say precisely why, rather than only by appeal to precedent.** Every finding in this investigation — Q2's attachment-to-Record pattern, Q5's permanence split, Q7's mention-durability discipline, Q9's decision/Approval boundary — depends on conversation being organized around *what institutional thing it's about*, not *who's in the room*. Those are architecturally incompatible organizing principles, not merely different feature sets. **ARUMBU should optimize for the opposite of what these systems optimize for: record-centric rather than person-centric, calm rather than engagement-driven, memory-shaped rather than disposable-by-default.** This is also the precise, evidence-based reason the Architecture Phase 2 document was correct to reject a general-purpose "Internal Communication" application outright — not merely because Slack already exists, but because building a system optimized the way Slack is optimized would be actively wrong for what this platform needs conversation to do.

---

## Q11 — Constitutional placement, tested against the exact bar already applied to Authority, Search, Tamizhi, Operational Intelligence, Measurement, and the Structure Engine

**Does it make institution-agnostic decisions or enforce rules independent of any one domain's content?** No — it attaches, it doesn't decide, exactly the same failure that already disqualified Work, Documents, and Operational Flow from Shared Engine status. **Not a Shared Engine.**

**Does it answer one coherent institutional question the way People or Work does?** No — it is cross-cutting by nature, attaching to whatever Record it concerns, never a standalone subject of its own the way an Application Layer citizen must be. **Not a new Application.**

**Is it Infrastructure?** No — it carries real institutional content and memory, which disqualifies it from Infrastructure by the same test already applied to Integrations and to the Operational Intelligence Engine's own boundary.

**Is it a Universal Record Model discipline?** **Yes, decisively — the strongest fit of any candidate tested in this document, because the Universal Record Model already named this exact door, under this exact name, before this investigation began.** What this investigation adds is not a new door but a substantially deeper specification of what the existing door needs to hold: a permanence taxonomy, a promotion mechanism reusing the Audit Engine's own guarantee, a mention-durability rule reusing Governance's own reasoning, and one precisely-drawn boundary protecting Governance's Approval Chain from ever being informally bypassed. **This is Comments, taken from "weakest-evidenced, kept open" to "specified with real, evidence-backed substance" — a refinement of an already-accepted concept, not a new one, and not merely a rename either.**

---

## Q12 — Active disproof: assume Slack, Teams, Chime, Mattermost, and Rocket.Chat are sufficient

**The strongest version of this argument, stated fully before testing it:** every institution already has a chat tool. The Integration & Automation Framework already connects to all of them. Route every Notification Intent there and let people talk exactly where they already do — ARUMBU gains nothing by building its own conversation mechanism, and every finding above about permanence, mentions, and promotion could, in principle, be reimplemented as policy inside whichever external tool an institution already uses.

**Where this argument fails, tested directly against this document's own evidence rather than assumed to fail:** an external chat message is not, and structurally cannot become, an ARUMBU Record. It has no `subjectType`/`subjectId`. It cannot be a valid History subject. It cannot be promoted into the Audit Engine's own immutable guarantee. It is invisible to Search. It never appears on the Record's own Timeline the way Universal Record Model Q9 already requires of every genuine institutional fact. **For the Hospital, Government, Construction, Mining, and Power Plant cases named directly in Q3 and Q9 — the institution types where conversation itself can carry legal and safety weight — a conversation that happened only in an external tool is a conversation the institution's own memory has no access to, permanently.** This is not a hypothetical shortcoming; it is the exact failure Product Philosophy's own opening argument describes — a fact that existed, somewhere, but never reached the place an institution's memory actually lives.

**The argument fails, precisely at the point where institutional memory (Q9) and Governance's own decision-integrity boundary (Q9's own closing finding) are concerned — and holds everywhere else.** This produces a genuinely narrow, honest conclusion rather than a sweeping one: **ARUMBU does not need to replace Slack, Teams, or Chime as the place ordinary, real-time, low-stakes conversation happens** — the Integration Framework's own connector-based approach remains correct and sufficient for that. **ARUMBU does need its own lightweight, Record-attached mechanism specifically for the subset of conversation that either already is, or could become, institutional memory** — which is exactly Comments, deepened per this document, never a competing chat product.

---

## Q13 — Ten years from now

With Spreadsheet, Calendar, Inventory, Manufacturing, Fleet, Maintenance, Recruitment, Payroll, Learning, and Automation all built, does the concept strengthen or disappear?

**Strengthens, for the identical reason every future-test in this series has already found for every other confirmed refinement: each of these ten future capabilities becomes a new consumer of the same door, never a reason to replace it.** A Maintenance Job's own discussion thread, a Recruitment Candidate's own interview notes, a Payroll dispute's own documented exchange, a Learning course's own Q&A — every one of them wants exactly what this document already specifies: attach to a Record, stay ordinary until it earns permanence, notify through Governance's Areas rather than a broadcast list, and never quietly become an ungoverned decision channel. None of them need a different mechanism to get it.

---

## Verdict

**2. Refine an existing concept.**

**Not a rejection** — Q12's own disproof section found a real, specific, evidence-backed gap (institutional memory for high-stakes conversation) that external chat tools structurally cannot close, which means the strongest counter-argument this document could construct did not survive. **Not a new constitutional concept either** — Q1 found the phenomenon collapses almost entirely into Comments, the Universal Record Model's own already-named, already-accepted door, and Q11's application of the exact bar used for five prior engines confirms it fails every test that would earn it independent standing.

**On naming, addressed last, as promised at the start of this document, and answered by evidence rather than by whichever word sounded best:** none of Discussion, Conversation, Collaboration, Thread, Journal, Commentary, or Activity Stream earns a new place in the Constitution. **The correct word is the one already frozen — Comments** — because renaming an already-correctly-named concept purely to make this investigation's findings sound more novel than they are would be exactly the kind of feature-count-inflating move the ARUMBU North Star exists to prevent. "Activity Stream" deserves one specific note: it is not a rejected candidate so much as a *future presentation* question (a chronological view composed from History and promoted Comments together) — real, plausible, and explicitly out of this document's scope as a UI concern, not a naming one.

**The smallest possible addition, supported by every section above rather than intuition:**

1. **A small, closed permanence-category vocabulary** (Temporary / Operational / Question / Announcement, ordinary and mutable; Decision / Instruction / Evidence, promotable to the Audit Engine's own immutable guarantee) — §Q5, §Q9.
2. **A promotion mechanism, not a new immutability rule** — reusing "corrections are new records, never edits" exactly as already frozen, applied to a Comment the moment it earns institutional weight — §Q5, §Q9.
3. **A Policy-configurable default** letting specific institution types (safety-regulated, clinical) mark a category as auto-promoted at the moment of statement, and letting any institution exclude a category from capture entirely — reusing the Institutional Policy Model's own Business Rule mechanism, unmodified — §Q5, §Q3's Church/Construction findings.
4. **A mention-durability preference** — Areas of Responsibility and Positions over Persons, wherever the intent is "whoever is responsible" — directly reusing Governance §5's own already-frozen reasoning about naming durability — §Q7.
5. **One precisely-drawn boundary**: a promoted "Decision" Comment is evidence and context, never a substitute for a real Governance-gated Approval — the single guardrail this investigation treats as non-negotiable, because without it this entire refinement would risk becoming the exact ungoverned decision channel Governance's whole model exists to prevent — §Q9.

Every one of these five is an extension of a mechanism this corpus already froze — the Audit Engine's promotion discipline, Governance's Area-resolution and naming-durability logic, the Institutional Policy Model's Business Rule mechanism, Documents' own relationship pattern. As with the two investigations before it, the absence of a single genuinely new primitive, after an investigation specifically designed not to assume one existed, is itself the strongest evidence this document has to offer.
