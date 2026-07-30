> **ARUMBU is the product name introduced after this document was written.** Everything below was written under, and refers throughout to, the internal engineering name "RDIOS." That reasoning is preserved exactly as frozen — nothing in this document has been altered or renamed. "RDIOS" remains the correct internal/engineering term for the underlying platform this document describes; "ARUMBU" is what that platform is now called on every customer-facing screen.

Status: 🔵 Philosophy and product design — no code, no schema, no architecture changes. Read against every frozen document before a word of this was written: Product Foundation v1, People Domain Review v1, Audit Engine Design v1, the Experience Principles (Act Now / Be Aware / History, the Interruption Rule, the Assistant Voice — frozen via the Architecture Freeze Declaration v1, §"What is now frozen"), Product Philosophy v1, Platform Integration Strategy v1, Institution Intelligence Principles v1, Visual Design System v1, and the live M5 Authority & Permissions implementation. Nothing here modifies RDE. Nothing here modifies the current RDIOS implementation. If M5's architecture is correct — and this document concludes that, with one precise naming discipline named explicitly, not a rebuild — it is built upon, not reopened.

# RDIOS Governance & Responsibility Model v1

## Context

M5 answered "what can this person do?" correctly, and the founder's own words closing that milestone were "exactly what I wanted." This document exists because a second, older question sits underneath the first one, and building six more applications without answering it first is how every ERP in history ended up with thousands of disconnected permission keys and a different, ad hoc approval system bolted onto every module: **who is responsible for making this decision, and how does that responsibility move — temporarily, permanently, or in a crisis — without the institution losing track of itself?**

Permissions are a resolved *answer*. Governance is the *question being asked*, over and over, differently, by every application that will ever be built on this platform. Get the question right once, here, and Work, Finance, HR, Projects, CRM, Assets, Documents, and Reports all inherit it unchanged. Get it wrong, or skip it, and each of those applications will quietly invent its own answer — its own approval chain shape, its own idea of what a delegation is, its own escalation logic — and RDIOS will have become, without anyone deciding it should, exactly the kind of software this whole engagement has been trying not to build.

## The one reframe everything below depends on

**A Position does not own actions. A Position owns an Area of Responsibility.** Actions are borrowed from that Area, situationally, by whichever application needs to ask "who is allowed to do this" — never stored redundantly, per action, on the Position itself. This single sentence is the difference between a governance model that survives fifty years and a permission catalog that needs a migration every time a new application ships a new button. Every question below is really this same sentence, examined from a different angle.

---

## 1. What is Responsibility?

The founder's own example makes the stakes concrete: does "Finance Manager" mean *Approve Expenses*, or does it mean *Responsible for Finance*?

**It means responsible for Finance.** Approving expenses is one of the things that responsibility currently entails — today. Six months from now, when Work ships budget approvals, and a year from now, when Reports ships financial-disclosure sign-off, both of those new powers should attach to whoever is responsible for Finance *automatically*, the moment those applications are built — not because someone remembered to go back and edit every Finance Position across every institution on the platform to grant two new permission keys. An institution's understanding of who runs its money doesn't change every time RDIOS ships a feature. The catalog of things "running the money" entails does. Those are different rates of change, and a governance model that conflates them will force the slow-changing thing (who's responsible) to be re-edited every time the fast-changing thing (what that responsibility currently lets you do) grows.

This is also simply how institutions already describe themselves, in the words people actually use. Nobody's job description says "may click Approve on the expense-approval screen." It says "responsible for Finance." A governance model that mirrors the words an institution already uses about itself needs no translation layer between how people think and how the software works — which is the same discipline the Institution Configuration Layer already applies to terminology (Product Foundation §8), extended one level deeper, into the structure of authority itself rather than just its vocabulary.

**Concretely:** a Position holds one or more Areas of Responsibility (Finance, People, Safety, Communications, Governance itself — configurable per institution, the same "seeded starter set, extendable without a code change" discipline the Institution Configuration Layer already promises for Permissions). Every application that ever gets built declares, once, which of its own actions belong to which Area — never inventing a new authority source, only registering into the ones that already exist. A Position's actual, current powers are always a computed projection of its Areas against whatever applications happen to be active in that institution today — never a static list a person edited once and forgot.

## 2. Authority

**Authority is never a personal trait. It is always a property of a seat.** A person does not "have" authority the way they have a name or an email address; they hold authority for exactly as long as they hold the Position that carries it, and not one moment longer. This is already M5's real behavior — permissions are resolved fresh, every request, from whichever Positions a person's currently-active holdings are — and it is correct. Nothing about this document asks M5 to change it.

**Is authority permanent?** Only as permanent as the holding is. The Position itself can be permanent (a seat that outlives every person who ever fills it — this is the entire point of an org chart, and exactly what "the thread that keeps being pulled forward by whoever is currently holding it" already named in the Product Philosophy). The *person's* authority through that seat lasts only as long as they hold it.

**Can authority come from somewhere else — not from a Position?** Yes, in exactly two legitimate shapes, and both are explored fully below (§3 and §9): a **temporary, time-boxed widening** of who may act for an Area (delegation, temporary appointment, escalation, emergency), and nothing else. Authority never attaches to a person independent of any seat, permanently, outside the org graph — the moment RDIOS allowed that, it would have quietly built a second, invisible org chart running alongside the real one, which is the exact failure mode this whole document exists to prevent.

## 3. Delegation

A founder goes on vacation. **Yes, they can delegate — and delegation must never touch the Position itself.** The Founder seat keeps every Area it has always held, unedited, untouched, for the entire time the founder is away. What changes is a separate, temporary record: *this Area of Responsibility, held by this Position, is additionally exercisable by this other person, starting now, ending at this specific moment.*

This is the same discipline the People Domain Review already insists on elsewhere — Position, Affiliation, and Capability are kept as three distinct concepts specifically so that none of them has to be distorted to express something it wasn't designed for. Delegation is a fourth distinct concept for exactly the same reason: it is not a Position (it grants no permanent seat), not an Affiliation (it isn't a relationship, it's an authority grant), and not a Capability (it isn't a qualification, it's a temporary power). Trying to express delegation by editing a Position's responsibilities and editing them back later is the same mistake as trying to express "volunteer" by inventing a fake Position for it — technically possible, quietly wrong, and exactly the kind of shortcut that reads as a real design flaw in five years.

**Should delegation automatically expire?** Always, without exception, as a non-negotiable governance principle, not a configurable default. Authority that does not expire on its own becomes authority nobody remembers to revoke — every real institution's worst access-control incidents trace back to exactly this: a temporary grant that quietly became permanent because ending it was nobody's specific job. An institution may renew a delegation, deliberately, as many times as it wants. It may never let one run without an end.

Every delegation is, itself, an institutional fact — written to History the moment it starts and the moment it ends, in the same plain, calm sentence style every other History entry already uses ("Priya delegated Finance to Sam, through August 5"). A delegation nobody can see later isn't a safety feature; it's a blind spot wearing a safety feature's costume.

## 4. Temporary Authority

Acting CEO. Interim Principal. Temporary HR Head. Emergency Finance Officer. Holiday replacement.

**RDIOS already, quietly, has the seed of this — it was built two milestones ago and nobody had to invent anything new to notice it.** M3's `AppointmentType` — `permanent`, `acting`, `temporary` — already distinguishes exactly this. Appointing someone to a Position with `appointmentType: "acting"` already grants them that seat's full, current Area of Responsibility, through the identical mechanism a permanent appointment uses. Nothing about the Authority Engine treats an Acting holder's authority as smaller or different in kind — because it shouldn't be. An Acting CEO who can't actually act as CEO isn't temporary authority; it's a title with no power behind it, which is worse than no title at all.

What Temporary Authority adds, philosophically, on top of what's already real: **institutional memory should say so, honestly, every time it narrates that person's actions.** "Sam is Acting Finance Manager" carries real information a plain "Sam is Finance Manager" doesn't — it tells anyone reading History, later, that this was a covering arrangement, not a succession. This is a narration and display discipline for whichever application surfaces a Position's holder (People's roster and profile screens today; every future application that shows "who's responsible" later) — never a new governance mechanism, because the mechanism was already correct the day M3 shipped `AppointmentType`.

Ending an Acting or Temporary appointment uses the exact same `endHolderAction` any appointment ending already uses. Nothing about the institution changes permanently — the seat returns to whatever state it was in before, exactly as vacating any Position already works today.

## 5. Approval Chains

Purchase → Finance → Founder → Complete. HR → CEO → Legal → Complete. Temple: any two of five trustees.

**An approval chain names Areas of Responsibility in sequence — or in a quorum — never named individuals.** This is the whole reason the Finance-Manager-not-Approve-Expenses reframing in §1 matters practically, not just philosophically: a chain that says "Finance, then Founder" keeps working, completely unedited, the day the Finance Manager resigns and someone else is appointed to that seat. A chain that had been built naming *Priya* specifically would need to be found and rewritten the same week she left — and every institution running RDIOS for real would eventually accumulate exactly that kind of quiet rot, chain by chain, until nobody trusted the approval system to mean what it said.

**Sequential and quorum chains are the same underlying primitive, not two separate features.** A chain is a series of steps; each step names one or more Areas and a threshold of how many distinct current holders of those Areas must approve before the step is satisfied. A strict sequence is simply every step's threshold set to "1 of 1." "Any two of five trustees" is one step whose threshold is "2 of the current holders of the Trustee Area." Nothing about the model needs a special case for either shape — the founder's own two examples and the temple example are three points on one continuous design, not three different features to build separately.

**This document defines the shape a chain has. It does not define how a chain executes.** The state machine that actually walks a pending decision through its steps, waits for approvals, and marks it complete is the Work Engine's job (M6, already named in the Architecture Freeze Declaration as porting nearly assumption-free from RDE's proven template-driven design) — Governance's only job is to make sure that engine always asks "who currently holds this Area" rather than "who did we hardcode as the approver," so the chain's *meaning* survives every future change to who's actually standing in each seat.

## 6. Separation of Duties

Create Vendor → Approve Vendor → Pay Vendor. Should RDIOS stop one person from doing all three?

**Yes, and the mechanism is a constraint on a chain, not a new source of authority.** A "same-actor exclusion" rule says: for this specific decision type, the person who satisfied one step of the chain may not also satisfy a later step, regardless of what Area they hold or how many Areas they hold. This never changes who has authority — someone can genuinely be responsible for both Finance and Procurement in a small institution, and that's real, honest, and often unavoidable. What it changes is whether one specific instance of one specific decision can be closed out entirely by one person acting alone.

This has to be configurable per decision type, and it has to default to *off*, not *on* — a five-person temple cannot realistically separate every duty three ways, and a governance model that forces separation-of-duties on every institution regardless of size would make RDIOS actively unusable for exactly the small, real institutions it exists to serve. The right default posture is closer to a *recommendation* than an enforcement: when a chain's steps could all be satisfied by the same person, RDIOS can say so plainly ("this approval could currently be completed by one person — consider separating it") the same calm, informational way Be Aware already surfaces anything that's true but not yet a decision — and let the institution decide whether that's a real risk or simply the honest size they are.

## 7. Escalation

What happens when someone doesn't act?

**Attention moves first. Authority only widens if attention alone doesn't resolve it — and even then, it never silently reassigns the decision away from the seat it belongs to.** This directly extends the Product Philosophy's own deepest distinction — the subsystem owns the truth, RDIOS owns attention — into governance specifically: a stalled decision is, first and foremost, an attention failure, not an authority failure, and the fix that respects the institution's own structure is to make the right person aware, not to quietly hand the decision to someone else.

Concretely: if a decision sits with its responsible Area's current holder past whatever window the institution has defined, the *first* move is exactly what Home already does for everything else — surface it, more insistently, to that same person. If that still doesn't resolve it, escalation **widens who currently has standing to act**, by walking one step up the real reporting graph M4 already built — the Position that the stalled Position reports to gains the ability to act on this specific pending decision too, without losing anything the original holder still has. The original responsible person can still act, at any point, even after escalation has widened the pool; escalation adds a path, it never closes one.

This is precisely the "Escalate" verb the Architecture Freeze Declaration already named as real, expected, and buildable directly on machinery already frozen (Events, Work Engine, Audit) — this document supplies the philosophy that verb has been waiting for, not a new mechanism beside it.

## 8. Transfer

Someone resigns. What survives, what ends, what transfers?

This is a direct, specific application of the People Domain Review's own Atomic Offboarding classification (Close / Preserve / Archive / Transfer / Reassign / Delete / Leave-Untouched), already frozen, already live in M3 — Governance doesn't invent a new answer here, it applies the existing one precisely to authority:

- **Ends:** the person's holding of every Position they occupied. The seats themselves survive, now vacant — exactly the "Unfilled" state already real in People and the Organization Builder today. Any Delegation or Temporary Authority this person personally held, or personally granted to someone else, ends outright with them — both are person-bound by nature (§3), and neither can meaningfully continue once one side of the arrangement is gone.
- **Transfers:** nothing transfers to a *person*. Any pending decision where this person was the responsible actor now resolves against whoever next holds that Position once someone is appointed — or, if the seat sits vacant, escalates up the graph exactly as §7 already describes, using the identical mechanism rather than a special-cased one. Decisions attach to seats, not people, precisely so that a person's departure never requires anyone to go hunting for what they "owned" and manually hand it to someone else.
- **Preserved, permanently, untouched:** every History and Audit record of everything this person ever decided while they held their seats. A person leaving never rewrites what they decided while they were here — the Audit Engine's append-only guarantee already makes this true structurally; Governance simply confirms it applies without exception to authority-bearing decisions specifically, which are exactly the records an institution can least afford to lose the moment someone leaves.

## 9. Emergency Governance

Fire. Flood. Cyber attack. Hospital emergency. Temple festival. Election day. Should governance temporarily change?

**Yes — but only through a mode the institution defined and named in advance, activated by a specific pre-named Area of Responsibility, and bounded by a duration that ends itself automatically.** "Emergency" is the single most historically abused word in institutional governance for justifying a permanent power grab, precisely because it feels self-justifying in the moment. The discipline that keeps RDIOS from ever becoming the tool that made that easier is refusing to let emergency governance be improvised: an institution configures its emergency modes — what they're called, what widens, who may activate them, how long they last by default — the same way a real hospital writes its emergency protocol long before any actual fire, never during one.

**Who authorizes activation:** only whoever currently holds the specific, pre-named Area the institution assigned that power to (an "Institutional Safety" Area, or whatever an institution's own terminology calls it) — never "anyone," and, per Institution Intelligence Principles v1, never Tamizhi. Tamizhi may notice conditions that match a pre-defined emergency pattern and say so, exactly the way it's permitted to flag anything else — the decision to activate remains a human one, made by a real seat, every time.

**What activation actually does:** the same primitive as Escalation (§7), triggered by a declared event instead of elapsed time — it widens the pool of who may currently act on specific, pre-named decision types. It never deletes or silently overrides the institution's normal chain underneath; the normal chain still exists, unedited, and resumes automatically the instant the emergency window ends. Nothing about the institution's permanent structure changes because of an emergency — only, temporarily, who may act on a narrow, pre-declared set of decisions while it lasts.

**Automatic end, without exception**, exactly the discipline §3 already established for delegation: a maximum duration set in advance, expiring on its own, requiring an active, visible re-declaration to extend — never a silent default of "until someone remembers to turn it off." Both the activation and the end are written permanently to History, in plain language, as the genuinely significant institutional events they are.

## 10. Tamizhi

Institution Intelligence Principles v1 already froze the one sentence Governance has to obey without exception: **intelligence is a contributor, not a voice of its own.** Inside Governance specifically, that means Tamizhi may surface exactly the kind of observation the founder named — "this exceeds your purchasing policy," "this invoice is unusual," "this approval violates institutional policy" — attached to a pending decision as an ordinary Be Aware or Act Now contribution, through the identical two doors already frozen in the Platform Integration Strategy (a Search result, an Attention Contract contributor), never through a channel of its own.

**Tamizhi cannot approve, reject, activate Emergency Governance, initiate a Delegation, satisfy an Approval Chain step, or resolve an Escalation.** Every one of those remains an action a Position — a real seat, held by a real person — performs. Tamizhi's entire role in Governance is to help the person holding that seat notice what they might have missed and decide faster, never to decide in their place or to stand in as a seat itself.

The test this document borrows directly from Institution Intelligence Principles v1 applies here without modification: **if Tamizhi vanished tonight, every chain, every escalation path, every emergency mode must still fully function tomorrow morning.** Governance that quietly depended on Tamizhi to function correctly would have violated the single deepest rule Product Philosophy already established — that AI must never become something a person has to reach *through* to reach their own institution — at the exact layer where that violation would matter most.

## 11. The Permission Catalog Philosophy

No future application invents its own approval logic, its own delegation concept, or its own escalation behavior. Every application — Work, Money, Customers, Projects, Documents, Reports, HR, Assets, and whatever gets built after them — inherits exactly one governance primitive set, unchanged:

- **Areas of Responsibility**, held by Positions, resolved fresh from the real organization graph, never a flat action list (§1).
- **One time-boxed authority-widening mechanism**, with four different real-world triggers — a person's own choice (Delegation, §3), a seat needing a temporary holder (Temporary Authority, §4), inaction (Escalation, §7), and a declared crisis (Emergency Governance, §9) — never four separate mechanisms pretending to be different things.
- **Approval Chains** defined as a sequence or quorum of Areas, never individuals, executed by the Work Engine but authored entirely in terms of Governance's own vocabulary.
- **Separation of Duties** as a configurable, recommended-not-forced constraint on a chain, never a new authority source.

A new application registers two things, and only two things, into this system: which of its own actions belong to which Areas of Responsibility, and which of its decision types need an Approval Chain. Both are pure Institution Configuration Layer data — exactly what Product Foundation §8 already promised Permissions would be ("the per-institution permission catalog, seeded from a starter set matched to institution type, extendable per institution without a code change"). This document is what keeps that promise honest in practice, six applications from now, instead of it quietly decaying into exactly the pile of disconnected keys the founder is asking this document to prevent.

## 12. Future-Proofing

Governments. Universities. Banks. Factories. Hospitals. Religious organizations. Political parties. International NGOs. Family offices.

This model was not designed as a feature list and then checked against these institutions afterward. It was built by asking how institutions of every one of these kinds have already, actually governed themselves — mostly without any software at all, for centuries. A government's chain of command is Areas of Responsibility resolved against an org graph. A bank's four-eyes principle is Separation of Duties, named differently. A temple's board quorum is an Approval Chain with a threshold above one. A hospital's emergency protocol, written and rehearsed long before any actual emergency, is Emergency Governance exactly as described in §9. A family office's power of attorney is Delegation, in the oldest legal language there is for it. None of these institutions needed RDIOS to invent how they govern themselves — they already knew. This model survives all of them because it describes what they were already doing, in RDIOS's own vocabulary, rather than asking them to adopt a vocabulary invented for software and never meant to describe an institution at all.

---

## Where this leaves M5 — affirmed, and one precise naming discipline, not a rebuild

The founder's own instruction was explicit: build on M5 if it's correct; name a real flaw precisely, with the smallest possible correction, if it isn't. Having read the live implementation against everything above, the honest answer is that **M5's architecture is correct** — `Position.responsibilities`, resolved once per request, unioned from currently-active holdings, with the founder as the bootstrap authority, is exactly the mechanism §1 and §2 describe. Nothing here asks for it to change shape.

**One real, precisely-scoped gap exists, and it is a naming discipline, not a schema defect.** M5's three shipped keys — `members.invite`, `organization.manage`, `people.offboard` — are not consistently shaped. `organization.manage` is already an Area, correctly. `members.invite` and `people.offboard` are closer to bare verbs. Nothing in the code is wrong; the `PermissionKey[]` field accepts any string and needs no change at all. What's missing is the rule that would have stopped this drift from starting, and that will matter enormously the first time Work or Money adds its own keys without one: **every future responsibility key must be named as a noun — an Area — never a verb-object pair.** `people.offboard` is grandfathered as the boundary case that makes the rule concrete, not as a mistake to fix retroactively (no code changes, per this document's own scope) — worth a Backlog note that it may eventually read more honestly as part of a broader `people.manage` or `people` Area, decided later, by real usage, not now, by this document.

## What this means, practically, for M6 onward

Work's Approval application does not invent its own approval-chain concept — it consumes §5, unchanged. Money's founder-ledger and expense flows do not invent their own delegation logic when a founder is traveling — they consume §3, unchanged. Every application's first design conversation about "who can do this" starts from the same question this document already answered, not from a blank page. That is the entire point of doing this now, before Work exists, rather than after six applications have each quietly answered it slightly differently.

## The closing test

**If every future application inherited this governance model unchanged, would RDIOS still feel coherent twenty years from now?**

Yes. Every primitive above is phrased at the altitude an institution already thinks at about itself — a seat, an area of responsibility, a temporary widening of who may act, a chain of areas, a departure, a crisis — and never once at the altitude of a specific screen, a specific button, or a specific application's internal name for anything. Nothing here will need to be retired when Work ships, or when Money ships, or when whatever RDIOS is asked to become in year fifteen ships, because nothing here was written in the vocabulary of software to begin with. It was written in the vocabulary institutions have always used to describe how they decide things — which is the one vocabulary that doesn't go out of date.
