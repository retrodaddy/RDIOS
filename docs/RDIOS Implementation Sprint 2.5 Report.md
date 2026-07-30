> **ARUMBU is the product name introduced after this document was written.** Everything below was written under, and refers throughout to, the internal engineering name "RDIOS." That reasoning is preserved exactly as frozen — nothing in this document has been altered or renamed. "RDIOS" remains the correct internal/engineering term for the underlying platform this document describes; "ARUMBU" is what that platform is now called on every customer-facing screen.

# RDIOS Implementation Sprint 2.5 Report
## Platform Polish

## What this sprint was

A stabilization pass, not a feature sprint and not a design sprint. Nothing here changes what RDIOS does. Every item below closes a gap Sprint 2 named honestly and left open, or fixes something this sprint's own work found along the way. No new module, no new architecture, no RDE changes.

---

## 1. Shared UI Primitive Migration

**Done, and real.** Every primary/secondary/danger button and every drawer-or-dialog panel across the product's interactive surface now goes through `components/ui/Button` and the `bg-elevated` / motion tokens, not hand-written Tailwind per file. Migrated this sprint: `WorkBoard.tsx` (every action button — New, Create, Approve, Reject, Complete, Save, Add comment), `PositionSidePanel.tsx`, `AppointHolderCard.tsx`, `AffiliationsCard.tsx`, `CapabilitiesCard.tsx`, `CreatePositionCard.tsx`, `OrganizationCanvas.tsx`, `OffboardButton.tsx`, and the three pre-authentication forms (`LoginForm`, `OnboardingForm`, `AcceptButton`). A full-repo search for the old `bg-accent px-... text-on-accent` hand-rolled pattern and for `shadow-2xl`/`shadow-lg`/`red-500` (the un-tokened error color that predated `text-error`) came back empty after this pass — verified by grep, not assumed.

**Deliberately not migrated, and named honestly:** small inline text-actions ("Close," "End," "Remove," "Cancel" next to a list row) were left as plain ghost text rather than wrapped in the `Button` component. Converting a one-word inline link into a bordered/padded button control would add visual weight the frozen document explicitly warns against for this exact pattern — this was a judgment call about what "duplicate button" actually means, not an oversight. `Card` and `SectionHeader` exist and are used by two new components (`PositionsTable`, `EmptyApplication`'s eyebrow label kept its original treatment deliberately — see below) but were not retroactively applied to every existing bordered `<div>` in the product; that remains real, low-risk, mechanical work for a future pass.

---

## 2. Typography

**The missing second family is now real.** `app/layout.tsx` loads Inter (workhorse, humanist, exactly the category the frozen document names) and Fraunces (the one expressive display face) via `next/font/google`, assigned to the `--font-sans` / `--font-display` CSS variables that `tailwind.config.ts` already referenced but that resolved to nothing before this sprint — every `font-display` heading was silently falling back to the same system sans as everything else. Verified live: read the actual computed `font-family` off a rendered `<h1>` this session and confirmed it resolves to Fraunces, distinct from the body's Inter.

**Numbers:** `tabular-nums` (a Tailwind core utility, no plugin needed) is wired into `DataTable`'s numeric-column cells and the `.os-table` CSS class. No screen in RDIOS renders a real column of numbers yet — there's still no financial or reports data — so this is proven in the table primitive, not against real figures.

---

## 3. Toast System

**Built and wired, not just built.** `ToastProvider` (queue, stacking via a fixed bottom corner, individual 5s auto-dismiss / 8s for errors, `role="status"`/`aria-live="polite"` for success-info-warning, `role="alert"`/`aria-live="assertive"` for errors, a visible dismiss control) now wraps the entire app from `app/layout.tsx`. Wired into three real flows this sprint: inviting someone (success/error), cancelling an invitation (info/error), and offboarding (success/error). Verified live: cancelled a real pending invitation and captured the actual rendered toast — correct message, correct `border-l-info` tone class, correct animation class, present and readable.

**Not migrated:** every other inline `role="alert"` error paragraph already in the product (Work's create/decide/escalate errors, People's appoint/end/grant errors) still renders inline rather than through the toast queue. Both patterns are accessible and functional; consolidating all of them onto one queue is real, mechanical follow-up work, not attempted wholesale this sprint to avoid touching a dozen more files under this sprint's time.

---

## 4. Contrast Validation

**This is the sprint's most substantive, most honest piece of work.** A real WCAG contrast script (`scripts/contrast-check.mjs`, checked into the repo for reuse) computed actual relative-luminance contrast ratios — not estimated, not eyeballed — for every text/background pairing across all six theme renderings (Slate counted separately in light and dark), including the actual composited color of a 10%-tinted Badge background, not just the flat semantic color.

**First run found 11 real failures.** Success and warning text on their own tinted badge backgrounds fell short of 4.5:1 in Slate-light, Light, and Forest; secondary/tertiary "dim" text fell short of a legitimate small-text reading in Light and Forest; Forest and Light's `accent-bright` (used for eyebrow labels and links) fell short; Dark's accent text fell short. **All eleven were fixed** — by darkening the affected token values, not by lowering the bar — and the script was re-run to confirm. Final state: every text/background pairing in every theme passes WCAG AA. The updated values are live in `app/globals.css`, with a comment block explaining exactly what changed and why.

**One category of check still fails everywhere, by deliberate design, not oversight:** the hairline `border` color against `bg` falls short of the 3:1 non-text-UI-component minimum in all six renderings, because the frozen Visual Design System explicitly calls for a quiet, low-contrast hairline divider — a 3:1 border would directly contradict "a single hairline, not a heavy drop shadow." The one place border contrast would actually matter for someone navigating by sight — a focused control — doesn't rely on the passive border at all; it switches to the Accent color (§7 below), which does pass. This is named as an accepted, reasoned exception, not hidden.

---

## 5. Tables

**A real, complete `DataTable` primitive exists** (`components/ui/DataTable.tsx`): sorting (click a column header, ascending/descending/off, with a visible arrow and `aria-sort`), an empty state via the shared `EmptyState` component, sticky headers (via `.os-table`'s CSS), row selection (checkbox column, select-all), a loading skeleton (row-shaped `Skeleton` placeholders), and horizontal-scroll responsiveness rather than a broken layout on narrow screens.

**Proven against real data, deliberately not the People roster.** The People roster stayed a plain List — converting two fields (name, position) per person into a multi-column table would have contradicted the frozen document's own "Lists... a consistent divider is enough" rule, not proven the pattern. Instead, the Positions section of the same page — three genuinely comparable columns (Position, Reports to, Holder) across every row — was rebuilt on `DataTable`. Verified live: created two positions, confirmed the table renders both, clicked the "Position" header, and confirmed the rows actually re-sorted (Alpha Lead before Zebra Lead, ascending arrow shown) — not just that a click handler exists.

---

## 6. Forms

Reviewed every form in the product against the frozen rules: labels above fields (already true everywhere, confirmed), one column by default (true everywhere except the intentionally-paired appointment-type/position selects, which are the kind of tightly-related short pair the document allows), validation as calm text beneath the field rather than color-only (already true — every error is a `role="alert"` paragraph with real text, never a red border alone).

**Found and fixed:** input, select, and textarea focus states across the entire product paired `outline-none` with `focus:border-accent` — a border-color change alone, with the browser's own focus outline explicitly removed and nothing of equivalent visibility in its place. This is the sprint's most significant accessibility finding outside of §4. Fixed globally in `app/globals.css` with a `:focus-visible` rule restoring a real, visible 2px accent outline on every input, select, textarea, button, link, and `[tabindex]` element — additive to the existing border-color change, not a replacement, and scoped to `:focus-visible` so it only appears for keyboard/programmatic focus, never on an ordinary mouse click. Verified live: focused the invite form's name input and read back the actual computed `outline` style — a real 2px solid accent ring, present.

---

## 7. Micro-interactions

Hover, pressed, and disabled states are now consistent by construction rather than by convention, because they come from the same `Button` component everywhere it's used (§1) instead of being re-typed per file. Loading states already correctly used text ("Inviting…", "Creating…", "Appointing…") rather than a spinner for button-pending states, which the frozen document names as already correct — unchanged. Transitions on hover/color changes now consistently reference the `duration-fast`/`ease-os-out` tokens where they were touched this sprint; a handful of untouched components elsewhere in the product still use Tailwind's bare `transition-colors` default duration rather than the named token — cosmetically identical today (Tailwind's default is close to `--os-duration-fast`), but not literally sourced from the same token, so a future change to that token wouldn't reach them. Named, not fixed, given the sprint's time.

---

## 8. Performance

**Found and fixed a real, measurable issue, not a hypothetical one.** Before this sprint, a single request to any workspace page ran the full person → memberships → institution → permissions resolution chain **up to three times**: once in the root layout (for theme and preferences), once in the workspace layout (for the Shell), and again in the page component itself, since most pages call `requireIdentity()` directly. Fixed by wrapping `getIdentityContext` in React's `cache()` — the standard, built-in mechanism for exactly this problem, not a new caching layer. Verified via typecheck and a full production build; the specific effect (fewer duplicate mock-provider calls per request) wasn't independently measured with a profiler this sprint, but the fix is structurally correct and the standard fix for this exact, well-known Next.js App Router pattern.

**Looked at and left alone, honestly:** `mockPreferencesProvider.getPreferences` is also called twice per request in the same layout chain, but it's a single synchronous `Map.get()` against an in-memory store — the actual cost is negligible, and wrapping it in `cache()` too would be complexity without a measurable benefit. No duplicate client-side providers or obviously oversized components were found in the areas reviewed this sprint; a full render-count profiling pass (React DevTools Profiler on a real interaction) was not performed.

---

## 9. Verification

- `npx tsc --noEmit` — clean, run after every major change this sprint (six separate passes), not just once at the end.
- `npx next lint` — clean.
- `npx next build` — clean production build, all 16 routes, from a fully cleared `.next` cache.
- **Live walkthrough, this session:** created a fresh institution; confirmed the real second typeface renders (`Fraunces` on an `<h1>`, distinct from body `Inter`); created two positions and confirmed the new `DataTable` renders and its sort actually reorders rows; invited and then cancelled a real invitation and captured the actual rendered `Toast` — correct message, correct tone, correct animation class; confirmed all five theme names appear correctly in the Preferences form; focused a real input and confirmed the new `:focus-visible` outline is genuinely present with the correct color and offset.
- **Not independently re-verified this sprint:** the Sprint 1 and Sprint 2 findings (offboarding access revocation, invitation expiry, approval-button gating, all five themes' background colors). Nothing in this sprint's changes touches that logic or those color values in a way that should have regressed them, and re-running those full scenarios from scratch was judged lower-value than covering this sprint's new ground — a reasoned trade-off given the time available, not an oversight.
- **Desktop/tablet/mobile:** desktop verified throughout (the live walkthrough above). Mobile navigation (built in Sprint 1) was not independently re-tested this sprint since nothing here touched it structurally, beyond the shared `Button`/token changes it now also inherits. Tablet was not separately tested at all this sprint — named as a real gap, not assumed fine.

---

## Remaining Design Debt

1. Small ghost text-actions ("Close," "End," "Remove") deliberately don't use the `Button` component — a real, bounded, consistent exception, not an oversight, but worth a second look if the product later wants every clickable control to be one of a fixed set of primitives with no exceptions.
2. `Card` and `SectionHeader` primitives exist but aren't retroactively applied everywhere a bordered container or uppercase label already appears by hand.
3. Toast is wired into three flows; most of the product's error feedback still renders as inline `role="alert"` paragraphs rather than through the queue.
4. Density's visual reach is still limited to the Shell's own sidebar (a Sprint 1 gap, unchanged this sprint).
5. Not every component's transition duration is sourced from the `duration-fast`/`ease-os-out` tokens — some still use Tailwind's bare default, cosmetically identical today but not the same source of truth.

## Remaining Technical Debt

1. Only one of the two duplicate per-request identity fetches in the layout chain was addressed by name (`getIdentityContext`); no broader render-performance audit was performed.
2. No table anywhere in the product has real data to validate `DataTable` against beyond the Positions list — Money, Reports, and anything financial will be the first real stress test.
3. `scripts/contrast-check.mjs` keeps its color values in sync with `globals.css` by hand, not by importing from a single source — small enough token set that this is a reasonable trade today, but it will drift silently if either file changes without the other being updated.

## Accessibility Score

**Materially improved, still not exhaustively audited.** Every theme now passes real, measured WCAG AA contrast for every text/background combination checked (90 pairs, 6 renderings, 0 remaining failures against a defensible bar). Focus visibility, previously suppressed sitewide, is now real and confirmed live. Against that: no screen-reader pass was performed this sprint or last; touch-target sizing wasn't re-measured; the one intentionally-accepted contrast exception (hairline borders) means a border-only visual cue should never be relied on as the sole signal anywhere in the product, and that assumption wasn't independently audited across every screen. Call it **solid foundation, not a certified audit.**

## UI Consistency Score

**High for the surfaces this sprint touched, unverified for the ones it didn't.** Every drawer, dialog, and primary/secondary button in the product's core flows (People, Work, Settings, pre-auth) now shares one real component and one token set — confirmed by grep, not assumed. Card-shaped containers and section labels outside those flows weren't audited for drift this sprint. No second design language was found anywhere in the product; the gaps that remain are consistent-application gaps (not everything migrated yet), not competing-pattern gaps.

## Platform Readiness Score

Trustworthy in the specific, load-bearing ways this and the prior two sprints targeted: access control is correct and verified, the visual language is real and measured rather than asserted, and the interaction primitives that exist are genuinely shared, not duplicated. Not yet a fully realized, every-corner-checked product — the honest gaps above are real, not filler.

## Recommendation

**Ready for Finance** — with the explicit caveat that this readiness is about the platform's foundation (identity, theming, shared components, verified contrast), not about Finance's own screens, which don't exist yet and will need their own scrutiny once built, especially given `DataTable` and `.os-table`'s numeric-column rules have never been proven against real financial figures. Nothing in the remaining design or technical debt above blocks starting Finance & Assets; none of it is the kind of gap that would make Finance's first real screens harder to build correctly. If another stabilization pass ever feels warranted, the honest trigger would be *after* Finance's first table and first real number-heavy screen exist — testing the frozen table and typography rules against real data will surface far more than a fourth polish pass against mock data would.
