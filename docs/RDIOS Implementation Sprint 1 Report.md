> **ARUMBU is the product name introduced after this document was written.** Everything below was written under, and refers throughout to, the internal engineering name "RDIOS." That reasoning is preserved exactly as frozen — nothing in this document has been altered or renamed. "RDIOS" remains the correct internal/engineering term for the underlying platform this document describes; "ARUMBU" is what that platform is now called on every customer-facing screen.

# RDIOS Implementation Sprint 1 Report
## Trust & Product Cohesion

## What this sprint was

Not a feature sprint. Every change below exists to make one of five things true: Trust, Consistency, Predictability, Accessibility, or Product polish. No new module was started. No architecture changed. No new design document was written. This report is the record of what was actually found and actually fixed, in the same spirit as the Product Validation Sprint that preceded it — honest about what's still weak, not just what's done.

---

## 1. Identity & Access

This is where the sprint's one non-negotiable objective lived: an offboarded person must not be able to access the institution again.

**Found.** `offboardPersonAction` (`applications/people/actions.ts`) only ever ended a person's Positions and Affiliations. It never touched their `InstitutionMembership` — the record `os/identity/session.ts` actually checks (`status === "active"`) on every single request to decide who's signed in. The two systems had never been connected. An offboarded person kept a fully active membership and could sign back in, read the institution's Home, People, Work, and History — including the entry recording their own offboarding — indefinitely.

**Fixed.** `offboardPersonAction` now also calls a new `IdentityProvider.endMembership(institutionId, personId)`, which sets that membership's status to `"ended"`. Because identity is re-resolved fresh on every request from that same status field — nothing cached, nothing trusted from an earlier request — this is sufficient to end access immediately, with no separate session-invalidation mechanism needed.

**Verified live.** Offboarded a real person (Ravi Shah, Finance Head, Riverstone Manufacturing) with the new code. Confirmed: his position correctly showed "Ended" as before, *and* signing in with his email afterward now returns "No active institution for this account yet" instead of a working session. This was tested by directly reproducing the exact failure the Product Validation Sprint found, then re-running it against the fix.

**Also found and fixed, same area:**
- **Invitations never expired.** `inviteMembership` now sets a 7-day `expiresAt`; `acceptInvitation` checks it and fails closed ("This invitation has expired — ask whoever invited you to send a new one.") past that point.
- **Invitations couldn't be cancelled.** A cancelled invitation stayed acceptable forever if the invitee still had the link. Added `cancelInvitation` (sets status to `"ended"` — the same status offboarding now uses, so a cancelled invite and a revoked membership fail through the exact same, already-tested code path) and a `cancelInvitationAction`, exposed as a "Cancel" button in Settings.
- **Re-accepting an already-active or already-ended membership** now fails with a clear message instead of silently succeeding a second time.
- **The login screen's dead end.** Someone with a pending invitation who tried the ordinary email sign-in (instead of their invite link — a real, plausible mistake) got "No active institution for this account yet" with no next step. It now distinguishes the case and says so: "You have a pending invitation — use the link whoever invited you sent, not this page, to accept it."

**Verified, not changed.** Suspended users cannot enter — this was already true by construction, since `getIdentityContext` only ever resolves a membership with `status === "active"`, and `"suspended"` is a distinct value in that same enum. No UI exists yet to actually place someone into that state (no feature ever called for it), so this was confirmed structurally rather than exercised end-to-end. Named here rather than silently left implicit, per this sprint's own "do not assume, verify everything" instruction — this is the one item in §1 verified by reading, not by clicking.

---

## 2. Session Management

Reviewed every state named in the brief against the actual mechanism (`os/identity/session.ts`, cookie-based, re-resolved from scratch on every request — no server-side session cache to go stale).

- **Login / Logout** — verified live, both directions.
- **Multiple tabs** — a signed-out cookie is shared across tabs in the same browser by construction (httpOnly cookie, not per-tab state), so this is consistent by default; not separately tested with two live tabs this sprint.
- **Session refresh / browser refresh** — identity resolves fresh on every server render; nothing client-cached could show stale identity after a refresh.
- **Expired sessions** — there is no session expiry today (the mock session token has no TTL). This is a real gap, not silently claimed as handled: a dev-mode session token lives until the cookie is cleared. Flagged under Remaining Concerns.
- **Direct URL access** — `requireIdentity()` gates every workspace route and redirects to `/login?next=...` when there's no valid identity; verified this still holds after the Identity & Access changes (an ended membership now correctly triggers this same redirect).

---

## 3. One Institution Memory

Reviewed People, Home, Work, History, Settings, Organization, and Attention for a single source of truth.

**Found.** Two real spots where a screen didn't reflect a change immediately:
- Inviting someone in Settings didn't refresh the new "Pending invitations" list — the founder would see the share link but not the person, until they happened to navigate away and back. Fixed: `InviteForm` now calls `router.refresh()` after a successful invite.
- (Cancel already refreshed correctly; this was the one asymmetric case.)

**Confirmed already correct, not changed:** Work's Attention Contract, People's roster, and Home's Be Aware panel all read through the same providers (`mockPeopleProvider`, `mockWorkProvider`, `mockIdentityProvider`) with no parallel state anywhere — this was true before this sprint and remains true; the only real gap was the client-side refresh timing above, not a second source of truth.

---

## 4. Notification Experience

**Finding, not a fix: there is no dedicated notification system in RDIOS today.** No bell icon, no dropdown, no unread count, nothing named `Notification` anywhere in the codebase. The closest thing is the History feed on Home, which is a plain server-rendered list — no open/close state, no keyboard menu, nothing that the checklist in this section (click-outside, Escape, keyboard navigation, focus handling) actually applies to.

Building one was explicitly out of scope for this sprint — it would be a new capability, not polish of an existing one, and doing it without the founder's sign-off would contradict "we are NOT adding new architecture." This is named here instead of quietly built, per this sprint's own instruction not to inflate progress. If notifications matter before M7, that's a scoping conversation, not a Sprint 1 line item.

What *did* get the click-outside/Escape/focus treatment this sprint, because they are real dismissible overlays already in the product: the Position side panel, the Work create/detail drawers, and the new mobile navigation drawer (added this sprint — see §7).

---

## 5. Empty States

Reviewed Money, Clients/Community, Projects, Documents, and Reports (all built as stubs in earlier milestones) plus every genuinely-empty list state (no positions, no work, no invitations).

**Found.** The five stub destinations already avoided implementation language — none of them said "not implemented" or referenced code. That bar was already met. What they didn't do was distinguish themselves from each other or say anything about what's coming, unlike Settings' own copy ("Invitations are ready today; naming, branding, and business rules are on the way").

**Not changed this sprint.** Rewriting five destinations' worth of empty-state copy to each explain "what belongs here, why it matters, what will appear" is real content work, not a mechanical fix — it needs institution-aware language the same way §8 does, and doing it hastily risked exactly the generic-filler problem this sprint is trying to remove. Flagged as a real, specific remaining item rather than attempted shallowly.

**Changed:** Genuinely-empty *interactive* lists (no pending invitations, no work items, no positions) already read as calm and intentional, not broken — verified, no changes needed.

---

## 6. Accessibility

- **Position responsibility checkboxes** — the Product Validation Sprint reported these as unlabeled ("checkbox 'on'" in an accessibility tree read). Investigated: the markup already uses proper `id`/`htmlFor` label association (`components/os/PositionSidePanel.tsx`), which is the correct pattern. Re-tested this sprint with a real click-driven interaction (not synthetic DOM events) and confirmed the label text is what actually gets read. This looks to have been an artifact of how a prior automated pass extracted the accessibility tree, not a real defect — noted rather than "fixed," since there was nothing to fix.
- **Mobile navigation didn't exist at all.** The mobile header showed only the institution name — no way to reach People, Work, or any other screen from a phone. This is the sprint's most significant accessibility finding. Fixed with a real drawer: opens via a labelled button (`aria-expanded`), closes on Escape, closes on backdrop click, closes automatically on navigation, traps nothing it shouldn't (background is inert via the backdrop, not a broken focus trap). Verified live at mobile viewport width.
- **Reduce motion** — implemented as a real, global CSS rule (`app/globals.css`), not a curated per-component list that would quietly miss new animated elements as the product grows. Also respects the OS-level `prefers-reduced-motion` media query independent of the stored preference.
- **Font size** — scales from the root `<html>` element, so Tailwind's rem-based type scale carries the change through every screen without per-component work. Verified the mechanism is real, not just wired to a no-op.
- Full screen-reader and keyboard-only pass across every screen was not performed this sprint — the checklist was applied where it was practical to verify quickly (dialogs, the new drawer, the checkbox question above), not as an exhaustive audit. Named as a remaining concern below.

---

## 7. Product Consistency

- **Institution-aware responsibility language.** The Product Validation Sprint's sharpest consistency finding: navigation labels and empty-state questions already adapted per institution type ("Clients" vs. "Community"), but the Authority Engine's own responsibility catalog — "Offboard someone," "Manage positions and people" — stayed flatly corporate everywhere, including a temple. Extended `os/institution/terminology.ts` (the same mechanism nav labels already use, not a new one) with responsibility-label overrides for volunteer- and congregation-style institutions (NGO, temple, church, mosque, trust): "Offboard someone" → "End someone's involvement," "Manage positions and people" → "Manage roles and people." Verified live on a fresh NGO institution — both labels and their descriptions now read correctly, everywhere they appear (Position side panel, Work's approval-chain builder and detail view). Company, manufacturing, hospital, school, college, and government keep the original wording deliberately — it already reads naturally there, and inventing variation for its own sake was explicitly against this sprint's instruction.
- **Sidebar and mobile nav now share one set of destinations, one active-state rule, and one collapse mechanism** rather than the mobile header being an entirely separate, much smaller surface than desktop.
- A full pixel-level pass across every button/card/dialog/badge on every screen was not performed — the product already draws from one small set of Tailwind utility patterns with no competing design language found anywhere, so this wasn't the place real problems were hiding. Time went to the concrete gaps found instead (mobile nav, responsibility language) rather than a cosmetic sweep with no findings behind it.

---

## 8. Institution Language

Covered together with §7 above (the responsibility-catalog fix *is* this section's main finding). Beyond that: re-walked the nav-label and empty-state terminology system (`os/institution/terminology.ts`) institution type by institution type and found it already consistently applied everywhere it's wired in — no destination was silently using the generic default where an override existed. No unnecessary new variation was introduced; the only two labels changed were the two the Validation Sprint named specifically, and only for institution types where the default genuinely reads wrong.

---

## 9. Founder Experience

Walked back through onboarding as a first-time founder, this time for an NGO (Northgate Foundation) rather than the manufacturing company the Validation Sprint used, specifically to re-test with fresh eyes on a different institution type.

**Found and fixed:** the Validation Sprint's second-largest finding — a founder can build out an entire organization and never notice they aren't seated anywhere in it — reproduced exactly on the new institution. Home's Attention Engine (`os/attention/engine.ts`) now checks this directly: once at least one Position exists and the founder holds none of them, Act Now surfaces "You're not seated in your own organization yet" with a direct path to fix it. Verified live: the nudge appeared on the fresh NGO institution with one vacant position, and did not appear once a position with an active holder already existed (confirmed against the older Riverstone Manufacturing data, where the founder was already seated from the prior sprint).

**Found and fixed:** "Good evening" next to "The institution is calm this morning" — both now read from the same `partOfDay()` value, so they can no longer disagree with each other. Verified at two different times of day during this session (morning and, in an earlier check, evening).

No other confusion surfaced walking through NGO onboarding, invitations, and organization-building that wasn't already covered by an item above.

---

## 10. User Preferences

Built as a real, working feature — genuinely belongs to the Person, not the institution (`os/preferences/`, keyed by `personId`, the same shape as everything else Person-scoped in RDIOS).

**What's real and verified live, this session:**
- **Theme** (system / light / dark) — the CSS infrastructure (`[data-theme]` rules) already existed from before this sprint; this sprint wired it to a real, persisted choice. Verified: switching to Dark changed the actual background color on reload.
- **Reduce motion** — verified the `data-reduce-motion` attribute is set and read correctly after a real (not synthetic) checkbox interaction.
- **Default landing page** — verified: setting it to "Work" and signing back in landed on `/work`, not `/home`. Falls back safely to Home if the stored key doesn't match a real destination for whatever institution the person is currently in (guards against a stale preference from a different institution type sending someone to a destination that doesn't exist there).
- **Sidebar collapse** — verified: persists across reload, and the collapsed rail still exposes every destination (single-letter, with a title tooltip) rather than silently dropping some.
- **Font size** — verified the mechanism (root `font-size`, cascades through Tailwind's rem scale) is real; not independently re-verified pixel-by-pixel on every screen.

**Honestly partial: Density.** Persists correctly and is read correctly (`data-density` on `<html>`, a real `--os-density-scale` CSS variable). Its actual visual effect today only reaches the Shell's own sidebar navigation rows. It does not yet touch the padding or spacing of lists, cards, or forms anywhere else in the product — Work rows, People roster rows, and Position panel sections all render at one fixed density regardless of this setting. Threading density through every one of those surfaces is real, broader work that wasn't attempted this sprint rather than being rushed into a shallow, inconsistent state. Stated plainly here rather than claimed as complete.

**Minor, known tradeoff:** when the sidebar is collapsed, "Sign out" is only reachable by expanding it again — not broken, just one extra click. Left as-is; adding a second, icon-only sign-out control to the collapsed rail was judged not worth the added visual complexity for a control used once per session.

---

## 11. Verification

- `npx tsc --noEmit` — clean, no errors, run twice (once mid-sprint, once after the final `InviteForm` fix found during live testing).
- `npx next lint` — clean, no warnings.
- `npx next build` — clean production build, all 16 routes compile.
- **Live walkthrough**, this session, covering: fresh NGO onboarding; position creation and the founder-seating nudge; the institution-aware responsibility catalog on a live NGO position; inviting two people and watching the pending list update live; cancelling one invitation and confirming it disappeared immediately; re-offboarding a real person from an earlier session's data and confirming their login was actually revoked afterward (the sprint's central test); the full Preferences form (theme, density, default landing, sidebar collapse, reduce motion) saved and re-verified after reload; the mobile navigation drawer opened, and closed via Escape.
- **Regression found during this sprint's own testing, and fixed within it:** the "Pending invitations" list didn't refresh after inviting someone — caught only by actually clicking through the flow, not by code review. This is exactly why the live-walkthrough step exists rather than trusting a typecheck.
- **Not independently re-verified this sprint:** the M6 Work approval flow (same-actor exclusion, escalation) — the eligibility-gating change in §1/Work only narrows *when* the Approve/Reject buttons render; it does not touch the server-side decision logic those buttons call, which was already covered by the Product Validation Sprint's live testing. Re-running that full multi-person approval scenario from scratch was judged lower-value than the new ground covered above, given the sprint's time.

---

## 12. Remaining Concerns

Stated plainly, not softened:

1. **No session expiry.** A signed-in session lives until the cookie is cleared. Not a Sprint 1 item originally, but surfaced while reviewing §2 — worth a real decision before this goes anywhere near production data.
2. **No notification system exists.** §4's checklist has nothing to apply to yet. If notifications are wanted before M7, that needs to be scoped as its own small milestone, not folded into a future polish pass.
3. **Density preference is real but shallow** — persisted and functional, visually effective only in the sidebar today.
4. **Empty-state copy for Money, Clients/Community, Projects, Documents, and Reports** still reads identically to each other. Honest and non-technical, but not yet distinct or forward-looking the way Settings' own copy is.
5. **No exhaustive screen-reader / keyboard-only audit** was performed across every screen — spot-checked where practical, not swept comprehensively.
6. **Suspended-user handling is structurally correct but untested end-to-end**, because no feature yet exists to actually suspend someone.
7. **Product consistency was reviewed, not redesigned** — no findings surfaced beyond the two named in §7, but that reflects a targeted pass, not a formal design-system audit.

---

## Readiness Assessment

The one thing this sprint was actually about — an offboarded person keeping access — is fixed and verified live, not just reasoned about. That was the correct thing to spend the majority of this sprint's care on, and it's the one place where "trust" was measured against an actual, reproducible failure rather than a general impression.

Everything else in this report is real, working, and verified at the level stated above — but this was one implementation sprint, not a rewrite of the product's polish. Several of the twelve sections (§4 notifications, §5 empty-state copy, §10 density) have honest, named gaps rather than false completeness. RDIOS is measurably calmer and more trustworthy than it was before this sprint, in the specific ways the Validation Sprint asked for. It is not yet at the point where every corner has been checked — §12 names exactly which corners remain. Whether that's enough before M7 begins, or whether one or two of those remaining concerns (particularly session expiry, given M7 is Finance) deserve a short second pass first, is a call for the founder to make with this list in hand — not a decision this report makes for them.
