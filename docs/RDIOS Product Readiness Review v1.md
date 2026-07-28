Status: 🟡 Living baseline — a product review, not architecture. No code changed to produce this; every finding below is cited to an exact file and line, or to a live click-through performed this pass. Nothing here proposes new engines, renames frozen architecture, or touches RDE. This document is the baseline every future RDIOS screen gets checked against before it ships.

# RDIOS Product Readiness Review v1

**Scope honestly stated up front:** RDIOS today is Identity & Tenant, Auth, the Shell, and Home — five real screens (login, onboarding, home, settings, invite-accept) plus seven empty application shells (People, Work, Money, Customers, Projects, Documents, Reports). This review audits exactly that surface, not a hypothetical finished product. Several findings below will read as "not applicable yet" — that's accurate, not a gap in the review.

---

## 1. Branding Audit

**Searched the entire `app/`, `os/`, and `components/` trees for "Retro Daddy," "RDII," "RDE," and "Where Vision Becomes Legacy."**

**Result: clean.** Zero references to Retro Daddy, RDII, or the tagline anywhere in rendered UI or source. The only two literal "RDE" matches are both inside code *comments* — internal engineering notes citing RDE as architectural precedent, never rendered to a screen:

- `os/identity/session.ts:49` — a comment noting the tenant-resolution helper "mirrors RDE's `requirePortalUser()`"
- `components/os/Shell.tsx:12` — a comment noting the shell is "built fresh for RDIOS — RDE's shell is architectural precedent only"

Both are exactly what they should be — a developer's note about lineage, invisible to every actual user. One more, lower-stakes but worth naming: `package.json`'s `description` field also mentions RDE by name — never rendered in the product, but it's the kind of metadata that can leak into places nobody thinks to check (a future About screen, a package registry listing). Cheap to neutralize whenever `package.json` next gets touched; not urgent enough to justify a change on its own.

No action needed on the code comments; noted here only so the search is provably exhaustive rather than asserted.

**Verdict:** RDIOS has no Retro-Daddy residue today. This is the one area where "built fresh instead of copied" already paid off completely — there was nothing to strip because nothing was ever borrowed.

---

## 2. Product Language Audit

**Three real leaks found, all engineering language surfacing where a user would read it:**

| Where | What it says | Problem |
|---|---|---|
| `app/login/LoginForm.tsx:46` | "Dev-mode sign-in — real authentication arrives with RDIOS's own infrastructure." | Tells a demo visitor the product is unfinished, in plain sight, on the very first screen anyone sees. |
| `app/(workspace)/settings/page.tsx:13` | "...everything here is configuration, not code, per the frozen **Institution Configuration Layer**." | Names an internal architecture layer directly in user-facing copy — exactly the class of thing the Experience Principles forbid. |
| `components/os/EmptyApplication.tsx:6` | "This **application** hasn't been built yet. Its records will live here once it has." | Says outright that the software is incomplete, on seven different screens. Fine as an honest placeholder for internal review; wrong for anyone outside the team to see. |

**Everywhere else** — the nine navigation labels, Home's Act Now / Be Aware / History headers, the onboarding form, the invite form — reads in plain institutional language already. "Institution," "Invite," "Sign out," "Nothing needs you right now" all pass cleanly.

**Verdict:** the *pattern* is right (nine plain-language destinations, no engine names in Navigation), but three specific sentences leak build-state directly to the user. All three are one-line fixes, listed as the top recommendation below — none require new architecture.

---

## 3. Empty State Audit

**Current state: every application shell shows the identical generic message** — "This application hasn't been built yet." This is honest for an internal review and wrong for a demo. None of the seven empty applications currently do what the founder specified: help a first-time customer with a primary action.

**Recommended copy, per application — not yet implemented:**

| Application | Recommended empty state | Primary action |
|---|---|---|
| People | "Nobody has joined this institution yet." | Invite your first teammate |
| Work | "No work exists yet." | Create your first task |
| Money | "No financial activity recorded yet." | Record your first expense |
| Customers | "No one you're serving yet." | Add your first customer |
| Projects | "No projects exist yet." | Create your first project |
| Documents | "No documents have been added." | Upload your first document |
| Reports | "Nothing to report on yet — reports fill in as the institution gets used." | *(no action — reports are always secondary to activity)* |

**Important distinction to hold onto:** the *copy* above is a legitimate product-language fix, cheap to make today. The *primary action buttons* mostly cannot be wired honestly yet — "Create your first task" has nowhere real to go until Work exists, "Invite your first teammate" already works today (Settings), so People's empty state is the one that could be fully correct immediately. Recommend fixing the copy everywhere now, wiring the action only where a real destination already exists (People only, today), and never linking a button to a page that doesn't work yet.

---

## 4. Institution Independence Verification

**Live-tested this pass:** created a real institution as a **Temple** ("Meenakshi Temple Trust," founder Lakshmi Iyer) through the actual onboarding flow, invited a second member (Ganesh Bhatt), accepted the invitation, signed out, and signed back in by email — the full loop, on a non-company institution type, with zero code assumptions specific to any one institution.

**Structurally independent, confirmed:** the institution type selector offers all twelve types (Company through Other) with no special-casing anywhere in the onboarding, session, or Home code — nothing branches on "if type === company." A temple's Home page looked and behaved identically to what a company's would.

**Experientially *not yet* independent — an honest gap, not a defect:** nothing adapts to institution type yet, because the Institution Configuration Layer (terminology, per-type org templates) hasn't been built. A temple and a company both see the word "Institution," not "Temple" or "Company"; both would see "Founder" as a generic English word if that ever appears, not a temple-appropriate term like "Trustee." This is expected at this stage — the Configuration Layer is scoped for later in the Foundation, not for the Identity/Home slice — but it's the reason "feels native to any institution" isn't fully true yet, only "doesn't break for any institution," which is a real and different claim.

**Verdict:** zero hardcoded blockers found. Zero adaptive personalization built yet either. Both facts are correct and both matter — pass the "doesn't break" test, do not yet pass the "feels built for us" test.

---

## 5. Experience Walkthrough — Founder, HR, Finance, Manager, Staff

**The honest finding first, because it shapes every answer below:** RDIOS has no role or Position system yet — that's the People application, not yet built. Every member of an institution today has an identical experience. This isn't a bug to fix in this pass; it's the correct, expected state of a product where Identity exists and Authorization doesn't yet.

| Role | What they'd see first | Decision available immediately | What's confusing | Clicks required | Feels like one OS, or separate pages? |
|---|---|---|---|---|---|
| **Founder** | Home, correctly personalized by name and institution | Invite the first teammate (Act Now, real, works) | Nothing yet — this is the strongest screen in the product | One click from login to a working decision | One OS — this is the screen the whole product should feel like |
| **HR** | Identical Home — no HR-specific view exists | Same invite action, since HR = whoever's logged in today | No distinction between "the founder's Home" and "HR's Home" — because there isn't one yet | Same as Founder | Can't be answered honestly yet — no role differentiation exists |
| **Finance** | Identical Home | Nothing Money-specific — Money is an empty shell | The Money link in the sidebar leads nowhere useful | Zero, because there's nothing to do | Feels like a placeholder, correctly, since it is one |
| **Manager** | Identical Home | Nothing team-specific — no Positions, no reports-to graph yet | Same as HR | N/A | Same as HR |
| **Staff** | Identical Home | Same invite action available to everyone today, which is itself slightly wrong — inviting people is naturally a Founder/HR action, not a Staff one, but there's no permission model yet to say otherwise | The product currently trusts every member equally | N/A | The one real gap: today's Settings invite form has no permission check tied to it |

**The one concrete, fixable-now finding:** the invite action in Settings has no permission gate — any signed-in member can invite anyone. This is expected (Authorization doesn't exist yet) but worth naming explicitly as a known, temporary looseness rather than an oversight, so it doesn't get mistaken for a considered decision later.

**Verdict:** this walkthrough mostly confirms what's already known — role-based experience is People/Authorization's job, not yet built. The value of doing it now is catching the one real, fixable-today issue (unrestricted invite) and stating plainly that "walk through as five roles" will be a genuinely different, much more interesting exercise once Positions exist.

---

## 6. Navigation Review

Only two destinations have real content today (Home, Settings); the other seven are empty shells. Reviewing what exists:

- **The Invite flow already follows the right instinct** — it's a form embedded directly on Settings, not a separate page-per-step, not a modal that blocks the screen. This is the pattern to repeat, not rework.
- **Home's Act Now item ("Invite your team") already deep-links straight into that inline form** rather than to a generic destination — this is exactly "bring the decision to the user" working correctly, on the one decision that currently exists.
- **Nothing today should become a drawer or get folded into Start Work** — there is no Start Work equivalent in RDIOS yet (that's People/Work's job), and with only one real action in the whole product, there's nothing to consolidate. This section will matter once People ships; today it's structurally sound because there's almost nothing to review.

**Verdict:** no navigation debt exists yet, because there's barely any navigation. The pattern already established (inline forms, decisions linked directly from Home) is the right one to hold every future screen to.

---

## 7. Design Consistency

**Consistent today:** one token system (`--os-bg`, `--os-surface`, `--os-border`, `--os-text`, `--os-muted`, `--os-dim`, `--os-accent`) used identically across every screen — login, onboarding, Home, Settings. Card shape (`rounded-xl`/`rounded-2xl`, `border-border`, `bg-surface/40`), button shape, and form-field shape all repeat the same values across every file.

**A real risk, worth naming before People ships:** none of that repetition is extracted into a shared component yet — every screen re-writes the same Tailwind class string for a button or a field by hand (`inviteAction`'s field styling in `InviteForm.tsx` and `OnboardingForm.tsx` are copy-pasted, not shared). This has cost nothing yet because there are only five real screens. It will cost real drift the moment People ships its own forms and cards independently. **Recommend extracting `components/ui/` primitives (Button, Field, Card) before or during the People build** — not a new engine, not new architecture, just the same discipline RDE's own `components/ui/` already proved necessary at exactly this size.

**Verdict:** consistent by accident of small scale today, not yet consistent by construction. Fixable in an afternoon, better fixed now than after three more applications copy the same unshared patterns.

---

## 8. Product Readiness Score

Scored honestly, against "ready for a first public demo" — not against "good progress for the stage it's at."

| Area | Score /10 | Why |
|---|---|---|
| Branding | 9 | Genuinely clean; only knocked down because "no residue" hasn't been tested against a full production build's generated artifacts. |
| First Impression | 6 | Login and Home are genuinely calm and well-built. The visible "Dev-mode sign-in" line undercuts it immediately. |
| Navigation | 4 | What exists is right; seven of nine destinations are dead ends today, which a demo audience would notice within a minute. |
| Simplicity | 8 | Nothing is over-built; the one flow that exists (invite) is about as simple as it could be. |
| Discoverability | 5 | Nothing hides what little exists, but there's nothing to discover past Home and Settings. |
| Decision Flow | 7 | The one real decision (invite) is genuinely excellent — inline, verb-first, no wasted clicks. Can't score higher with only one decision to judge. |
| Empty States | 3 | Currently just says "not built yet," seven times. This is the single most demo-damaging finding in the review. |
| Consistency | 7 | Real today, fragile going forward without extracted primitives. |
| Institution Independence | 7 | Structurally proven with a live non-company test; experientially unproven (no terminology adaptation yet). |
| **Overall Demo Readiness** | **4 / 10** | Honest number: what exists is well-built and on-brand for "calm operating system," but a demo audience would spend most of the walkthrough looking at "hasn't been built yet." Not ready for a public demo; genuinely promising as a foundation. |

---

## What I'd fix first, if asked — not implemented, per instruction

In order of actual demo impact, cheapest first:

1. Remove "Dev-mode sign-in" and "Institution Configuration Layer" from user-facing copy (§2) — minutes, zero risk.
2. Replace the seven identical "hasn't been built yet" messages with the per-application copy in §3 — an afternoon, zero new architecture, immediately makes the product feel like nine considered screens instead of two real ones and seven stubs.
3. Extract shared `components/ui/` primitives before People's forms multiply the current copy-paste pattern (§7).
4. Everything else in this review (role differentiation, navigation consolidation, institution terminology) is correctly blocked on People/Authorization and shouldn't be forced early.

Nothing above has been built. Waiting for this review to be accepted before touching anything, per your instruction.
