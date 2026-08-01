Status: 🔵 Behavioral specification — design only, no code, no visual mockups, no component library, no roadmap change, no constitutional amendment. The ARUMBU Constitution v1 is frozen; every rule below is a translation of an already-frozen principle into observable, testable behavior — never a new principle. Where this document names a number (a field count, a threshold), that number is a practical default for consistency, not a constitutional commitment, and may be tuned by implementation without reopening this document.

# ARUMBU Design System & Interaction Standards v1

## Why behavior, not appearance

Two documents already govern how ARUMBU looks (Visual Design System v1) and what it's fundamentally allowed to feel like (Experience Principles v1). Neither answers the question a person actually experiences moving between applications: does clicking the same kind of thing always do the same kind of thing? This document answers only that question. A user who has learned People should never have to relearn how a drawer closes, how a table remembers its filters, or how a notification earns the right to interrupt them, the moment they open Work for the first time. That is the entire and only goal of everything below.

---

## Section 1 — Core Experience Principles, as observable behavior

- **Calm** — no screen ever interrupts a person without a real, current, true reason behind it; a quiet Home on a quiet day is correct, not broken.
- **Predictable** — the same action, anywhere in the product, always produces the same category of result in the same place; a keyboard shortcut never means one thing in Work and something else in Finance.
- **Forgiving** — nothing is unrecoverable without a deliberate, explicit, two-step act; unsaved work is never silently lost to a refresh, a closed drawer, or a failed submission.
- **Professional** — completion looks like relief, never a celebration; nothing plays a sound, bounces, or asks to be admired.
- **Institution-first** — an institution's own configured word always appears where the generic platform word would otherwise be, with zero exceptions anywhere in the product.
- **Human-first** — every verb belongs to a person; nothing narrates as if the system itself acted, including Tamizhi.

---

## Section 2 — Navigation Standards (behavior only)

- **Desktop.** A persistent sidebar and a minimal top bar (Search, Notifications, Identity — nothing else) never disappear or relocate between applications.
- **Tablet.** The sidebar collapses to icons or a drawer; every touch target grows to a comfortable minimum; nothing that was reachable on desktop becomes unreachable here.
- **Mobile.** The sidebar never persists on screen; navigation lives behind a single, consistent affordance (a bottom bar or a hamburger-triggered drawer) — the same one, everywhere.
- **Sidebar.** Quieter, lower-contrast than the content it leads to; exactly one visual treatment marks the active destination, platform-wide.
- **Top bar.** Minimal, fixed height, never accumulates promotional or "what's new" content.
- **Search.** One global entry point, identical keyboard shortcut, reachable from every single screen without exception.
- **Breadcrumbs.** Used only where a real hierarchy exists (nested Projects, a Document's own folder-equivalent) — never fabricated for a flat list to look more structured than it is.
- **Back behavior.** Browser Back always restores the exact prior scroll position, filter state, and open/closed drawer state — never a fresh reload that discards context.
- **Remembered navigation.** The last-visited tab and filter within an application is remembered per person, persisting across sessions.
- **Deep links.** Every Record has a stable, shareable URL; opening it always reuses the record's existing detail experience, never a duplicate view built for the link.
- **History navigation.** Forward and back never silently discard an in-progress, unsaved drawer without the same warning a manual close would trigger.
- **Browser refresh.** Never loses committed data; an unsaved draft is protected by autosave (Section 4) before refresh can claim it.

---

## Section 3 — Drawer Standards

- **When drawers are used.** Any reversible action, without exception — the platform's own default, per the already-frozen Interruption Rule.
- **When dialogs are used.** Only irreversible actions — delete, permanently offboard, anything an "undo" toast cannot cover.
- **When full pages are used.** A Record type's own primary landing/list experience, and genuinely long-form authoring (a large form, a Document's own content) — never for a quick lookup that a drawer would serve just as well.
- **Maximum nesting.** One full detail drawer open at a time; a drawer may open a nested confirmation dialog above it, never a second full detail drawer stacked behind the first.
- **Closing behavior.** Clicking the dimmed background or pressing Escape closes a drawer instantly if nothing is unsaved.
- **Unsaved changes.** Any close attempt — background click, Escape, browser back — prompts explicitly if something unsaved would be lost; never a silent discard.
- **Escape key.** Always closes the topmost open layer first; never navigates away, never triggers a destructive default action.
- **Background interaction.** The background stays visibly, dimly present, never fully obscured — a person can always tell, at a glance, that they haven't left where they were.
- **Mobile adaptation.** A drawer becomes a bottom sheet on mobile and tablet, at the identical z-index tier, governed by the identical closing and unsaved-changes rules — never a surprise full-screen takeover, except where the content genuinely requires the room (a large form).

---

## Section 4 — Forms

- **Validation timing.** Inline, per field, the moment a field loses focus — never held back until submit.
- **Required fields.** Marked with one consistent indicator, platform-wide, never left to be inferred.
- **Optional fields.** Explicitly labeled "optional" — never ambiguous by omission.
- **Autosave.** Any field longer than a single line autosaves a working draft; short, single-line fields do not need to.
- **Confirmation.** Every successful submission gives explicit, visible confirmation — never silence after a click.
- **Keyboard navigation.** Tab order always follows visual and reading order; Enter submits only where exactly one primary action exists, and never one that is destructive.
- **Default values.** Pre-filled only from real institutional configuration (a currency, a fiscal-year-relative date) — never invented or guessed.
- **Focus behavior.** The first empty field receives focus automatically the moment a form opens.
- **Searchable selects.** Any select offering more than roughly ten options becomes a searchable, typeahead field — never a long, unfiltered scroll.
- **Large forms.** Anything past roughly eight fields is broken into collapsible sections, the identical pattern already shipped and proven in the Finance build's own expense editor.

---

## Section 5 — Tables

- **Sorting.** Clicking a column header cycles through a fixed three-state sequence (ascending, descending, none), remembered per person, per table.
- **Filtering.** Filters are always visible above the table, with a clear indicator whenever one is active — never hidden behind an unmarked menu.
- **Grouping.** Optional, never default; group headers, where used, are collapsible.
- **Saved filters.** Any filter combination can be named and saved, and is reachable by a shareable URL.
- **Bulk selection.** A selection checkbox column appears wherever more than one row-level action exists, with a persistent, visible count of what's currently selected.
- **Column resizing.** Allowed, and remembered per person.
- **Column visibility.** A show/hide toggle exists for any table with more than roughly six columns — never a fixed, uneditable column set at that width.
- **Pagination.** The default for any institution-scoped table that could grow large; page size is remembered per person.
- **Infinite scroll.** Reserved specifically for chronological, append-only surfaces — Timeline, Search results — never used where a person needs to reliably reference "row forty" later.
- **Export.** Every table offers a CSV or print-safe export.
- **Printing.** Tabular figures and right-aligned numerics are preserved in printed output, exactly as they appear on screen.
- **Empty states.** "Nothing exists yet" and "nothing matches your filter" are always two distinct, honestly worded states — never one generic message covering both.
- **Loading.** Skeleton rows match real row height and shape; a table never replaces its entire structure with a bare spinner.

---

## Section 6 — Search

- **Universal search.** One global entry point, the identical keyboard shortcut everywhere, always institution-scoped, always filtered by the searching person's own Authority before ranking.
- **Local search** (a filter box on one list). Behaves identically, in interaction shape, to Universal Search's own typing and result behavior — just scoped to the current list.
- **Quick filters.** Type and status filters remain one click away, visible beside results, never buried.
- **Recent searches.** Remembered per person, surfaced on focus before a new query is typed.
- **Keyboard shortcut.** Identical and global — never remapped or duplicated per application.
- **Result opening.** Always opens the record's own existing detail experience — never a second, Search-specific view of the same thing.
- **Highlighting.** Matched query terms are visibly highlighted in every result.
- **Zero-result experience.** Never a bare dead end — always suggests a next step (broaden the query, check spelling); the fact itself quietly informs institutional awareness through the already-designed zero-result Operational Signal, entirely invisibly to the person searching.
- **Saved searches.** A query plus its filters can be named and saved, through the identical mechanism a saved table filter already uses — one mechanism, two surfaces.

---

## Section 7 — Timeline: History, Comments, Signals, Tamizhi, presented, never redesigned

- **Visual order.** Newest first, always, without exception.
- **Chronological rules.** Every entry carries a real timestamp, shown as relative time by default, absolute time on hover.
- **Promotion rules.** An ordinary Comment renders identically to any other entry until it is promoted; a promoted entry carries one permanent, visible marker distinguishing it from ordinary conversation — the one deliberate exception to Timeline entries otherwise looking alike.
- **Collapse rules.** A long, uneventful run of ordinary Comments may collapse behind a "12 more" affordance; a promoted Decision, Instruction, or Evidence entry is never collapsible.
- **Grouping.** Consecutive entries from the same actor within a short window group beneath one timestamp header, reducing repetition without losing a single entry.
- **Operational Signals on Timeline.** Appear only when a Signal produced a genuine Attention contribution — a Signal computing quietly in the background never surfaces on its own, honoring the Audit Engine's own "not everything is memory" discipline.
- **Tamizhi on Timeline.** A Recommendation's own Accept, Dismiss, or Defer always narrates as the deciding person's action — never in Tamizhi's own voice, exactly as already frozen and verified.

---

## Section 8 — Notifications

- **Toast.** Reserved for the result of a person's own just-completed action — never for something that happened elsewhere or asynchronously.
- **Attention.** The only channel for anything requiring a decision — never simulated by a toast or a push notification.
- **Operational Signals.** Have no notification channel of their own; they inform Attention, Reports, or Tamizhi, which decide whether a person is ever told.
- **Recommendations.** Reach a person exclusively through Home's own Tamizhi Observations section — never a separate channel.
- **Errors.** Always specific enough to act on — never a bare "Something went wrong."
- **Warnings.** Reserved for a genuine, current risk to a person's own in-progress action — never a manufactured caution.
- **Success.** Quiet, brief, auto-dismissing.
- **Background completion** (a Report finishing generation). A toast with a direct link to the result — never left for a person to notice on their own.
- **Priority.** Exactly three weights exist, and no fourth is ever invented: routine (toast), needs-a-decision (Attention), irreversible-consequence (Dialog).
- **Placement.** One consistent screen position for toasts, platform-wide.
- **Lifetime.** Toasts auto-dismiss on a short, fixed timer; Attention items persist until their underlying condition genuinely resolves.
- **Stacking.** Predictable, newest on top, never covering an action button.
- **Deduplication.** An identical toast fired twice in quick succession collapses into one, never doubles.

---

## Section 9 — Graphs: understanding over decoration

- **Line — yes**, for a genuine trend with a real comparison basis.
- **Bar — yes**, the default for comparing discrete categories, and the standard replacement wherever a pie chart would otherwise be tempting.
- **Area — yes, sparingly**, for cumulative trends; never stacked past two or three series, past which it stops being legible.
- **Gauge — no**, except one sparing, institution-wide "calm / not calm" indicator — restraint is the entire point of a gauge's rare use.
- **Sparkline — yes**, the default at every "glance" altitude — Home, list rows, a CEO's own morning view.
- **Timeline — yes**, essential, governed fully by Section 7.
- **Progress — yes, only with a real, known denominator** — never an invented percentage.
- **Pie — no, almost universally** — a horizontal bar or a ranked list communicates the identical information more precisely, every time this document could construct a case.
- **Stacked Bar — yes, conditionally**, for two to four category breakdowns across time; past four or five series, small multiples of simple bars replace it.
- **Heat Map — yes for aggregate, capacity-shaped patterns** (shift coverage); **no for person-level activity** — the latter reads as surveillance, a direct conflict with the platform's own anti-surveillance findings.
- **Treemap — no** — genuinely hard to compare precisely; a ranked list replaces it in every case examined.

---

## Section 10 — Mobile Standards

- **Touch targets.** Comfortable minimum size honored on every control, no exceptions.
- **Gestures.** Swipe-to-dismiss is available for toasts and bottom sheets; no gesture is ever the *only* path to an action — every gesture has a visible, tappable equivalent.
- **Bottom sheets.** The mobile form of every drawer, governed by the identical closing and unsaved-changes rules in Section 3.
- **Offline behavior.** A clear, honest "you're offline, showing last-known data" state — never a silent stale view presented as current.
- **Camera.** Any upload flow offers direct camera capture, not only a file picker.
- **Uploads.** Images compress client-side before upload; PDFs pass through untouched — the identical discipline already proven in the Finance build's own upload path.
- **Large forms.** Collapsible sections (Section 4) matter even more here — never a single unbroken scroll of twenty fields on a small screen.
- **Search.** Identical behavior to desktop; a persistent, always-visible affordance replaces the keyboard shortcut, which has no mobile equivalent.
- **Timeline.** Identical chronological, grouping, and collapse rules; tap targets for expanding a collapsed run are generously sized.

---

## Section 11 — Accessibility

- **Keyboard-first operation.** Every action is reachable without a mouse, without exception.
- **Screen readers.** Every icon-only control carries a real accessible label; dynamic updates are announced politely, never mid-sentence.
- **Reduced motion.** Every animation respects the system-level preference.
- **Color blindness.** Every semantic state pairs an icon or a label with color — color alone never carries meaning.
- **High contrast.** Every theme independently meets WCAG AA — never assumed from one "primary" theme and hoped for elsewhere.
- **Zoom.** Layout holds at 200% browser zoom; text remains resizable without breaking anything.
- **Focus recovery.** Closing a drawer or dialog always returns keyboard focus to the exact control that opened it.
- **Error recovery.** A failed submission returns focus to the first invalid field, with the error announced.
- **Institutional environments.** Shared or kiosk-style devices (a hospital nursing station, a school office computer) are treated as a real, common case — session timeout and account-switching are both graceful, never punishing.

---

## Section 12 — Performance Standards (expectations, not implementation)

- **Loading skeletons.** Appear within roughly 100ms if content isn't ready instantly, and match the exact shape of what's coming.
- **Optimistic updates.** A person's own low-risk action reflects instantly, reconciling silently if the server disagrees — never used for anything Dialog-gated.
- **Background refresh.** Stale-tolerant widgets refresh silently, with no visible reload.
- **Caching.** A person never waits twice for identical, unchanged data within one session.
- **Large datasets.** Any list past a comfortable render size paginates or virtualizes — a table should never feel "heavy" as it grows.
- **Search latency.** Perceived as effectively instant — this document sets the expectation; the mechanism belongs to the infrastructure layer.
- **Drawer opening.** Perceived as instant; the drawer's own intentional 250–350ms motion is the only delay a person should ever notice.
- **Timeline rendering.** The newest, most relevant entries appear first and fast; older entries load progressively, never blocking the initial view.
- **Perceived performance.** Always prioritized over raw technical speed — a fast-feeling skeleton beats a slow-feeling spinner at identical actual latency.

---

## Section 13 — One Hundred Consistency Rules

**Records & Data Model**
1. Every Record has a Timeline.
2. Every Record has a stable, shareable, deep-linkable URL.
3. Every Record shows its own Related Records, where any exist.
4. Every Record's "last updated" is always visible on its detail view.
5. Every Record's creator is always visible.
6. No Record is ever silently deleted — only archived, superseded, or deleted behind a Dialog.
7. Every Record type's free-text vocabulary offers institution-configured suggestions, never a hardcoded list.
8. Every Record respects institution isolation without exception, on every surface it appears.
9. A Record's identity persists even after every field on it has changed.
10. Every cross-reference between Records is a real, clickable link, never plain text naming another Record.

**Navigation**
11. Every application shares the identical sidebar and top bar shape.
12. The active destination is marked by exactly one visual treatment, platform-wide.
13. Browser Back always restores the exact prior view state.
14. Every list remembers its own last-used filter, per person.
15. Every deep link opens the same detail experience a person would reach by navigating manually.
16. Search is reachable identically from every screen.
17. No destination is reachable only through a hidden or undocumented path.
18. Navigation never requires more than three real decisions to reach any Record a person can see.
19. Institution-inactive applications never appear in navigation.
20. Switching institutions is always one deliberate, explicit action, never ambient.

**Drawers & Dialogs**
21. Every reversible action opens in a drawer, never a dialog.
22. Every irreversible action opens in a dialog, never a drawer.
23. A drawer's background stays visibly, dimly present, never fully obscured.
24. Escape always closes the topmost open layer first.
25. Closing a drawer with unsaved changes always prompts, never silently discards.
26. No more than one full detail drawer is ever open at once.
27. A drawer always slides from the edge its content is conceptually attached to.
28. A dialog always names the exact, specific consequence of the action it gates.
29. On mobile, every drawer becomes a bottom sheet with identical closing rules.
30. A confirmed action always gives explicit feedback before its drawer closes.

**Forms**
31. Every required field is marked with the same consistent indicator, platform-wide.
32. Every optional field is explicitly labeled "optional."
33. Validation appears inline, per field, never only on submit.
34. Every form's first empty field receives focus automatically on open.
35. Any select with more than roughly ten options becomes searchable.
36. Forms longer than roughly eight fields are broken into collapsible sections.
37. Every successful save gives an explicit, visible confirmation.
38. Autosave applies to any field longer than a single line.
39. Server-side validation always re-checks what client-side validation already checked.
40. Default values are only ever pre-filled from real institutional configuration.

**Tables**
41. Every table's column headers sort in a fixed three-state cycle.
42. Every table remembers its own sort and filter state per person.
43. Bulk selection shows a persistent, visible count of what's selected.
44. Every table distinguishes "no data yet" from "no data matches this filter."
45. Every table's loading state matches real row height and shape.
46. Every table offers a CSV or print-safe export.
47. Numeric columns are always right-aligned; text columns always left-aligned.
48. Every numeric column uses tabular figures, without exception.
49. Infinite scroll is used only for chronological, append-only surfaces.
50. Pagination page size is remembered per person.

**Search**
51. Universal Search is reachable by the identical keyboard shortcut on every screen.
52. Every Search result opens the record's existing detail experience.
53. Search results are always institution-scoped and Authority-filtered before ranking.
54. Matched query terms are always visibly highlighted in results.
55. A zero-result search always suggests a next step, never a bare dead end.
56. Recent searches are remembered per person and shown before typing begins.
57. Any filter combination, in Search or a table, can be saved through the identical mechanism.
58. Search ranking never depends on anything AI-driven or semantic.
59. Search never returns a result a person's own Authority wouldn't otherwise let them see.
60. A local, in-list search box behaves identically in interaction shape to Universal Search.

**Timeline & Memory**
61. Timeline entries are always ordered newest first.
62. Every timestamp shows relative time by default, absolute time on hover.
63. A promoted Comment carries a permanent, visible marker distinguishing it from ordinary conversation.
64. A promoted Decision, Instruction, or Evidence entry is never collapsible.
65. Consecutive entries from the same actor within a short window group under one header.
66. History is never edited in place — a correction is always a new entry referencing the one it corrects.
67. A Tamizhi decision is always narrated as the deciding person's own action.
68. Operational Signals appear on a Timeline only when they produced a real Attention contribution.
69. Every institutional fact worth remembering is narrated in one calm, complete sentence.
70. No Timeline entry is ever permanently deleted once promoted to institutional memory.

**Notifications & Attention**
71. Toasts are used only for the result of a person's own just-completed action.
72. Anything requiring a decision reaches a person through Attention, never a toast.
73. An Act Now item always carries a real, available verb.
74. A Be Aware item never carries an interactive control.
75. Toasts stack predictably and never obscure an action button.
76. An identical toast fired twice in quick succession never doubles up.
77. Silence is always a valid, honest, calm outcome — never manufactured urgency to avoid it.
78. Every notification is traceable to a real, current, true fact.
79. Tamizhi Recommendations reach a person exclusively through the Home Tamizhi Observations section.
80. A dismissed or deferred Recommendation never re-surfaces without genuinely new evidence.

**Governance & Permissions**
81. Authority is always resolved fresh, never cached beyond its own permission-version marker.
82. A permission denial always states plainly why, never a raw or generic error.
83. Same-actor exclusion, wherever configured, is enforced identically across every application.
84. Escalation always widens the eligible pool up the real reporting graph, never reassigns a decision away from its seat.
85. No action a person cannot perform is ever presented as available, only to fail on click.
86. Every Approval Chain step shows its own position in the sequence, not only its current state.
87. A Delegation or Temporary Authority grant always has a visible start and end.
88. Every Area of Responsibility is named as a noun, never a bare verb-object action.
89. An Automation Rule always acts using its author's own Area of Responsibility, narrated as such.
90. Every mutating connector action stays structurally unreachable to Tamizhi.

**Language & Terminology**
91. Institution-configured terminology always wins over generic platform language, in every surface, without exception.
92. Internal engineering vocabulary never leaks into user-facing copy.
93. Every button label is a real, specific verb — never a vague "OK" or "Submit" where a more specific word exists.
94. The same concept is always called the same word, everywhere it appears in one institution.
95. Every empty state names the one action that would fill it.
96. Every error message is specific enough to act on, never "Something went wrong."
97. The Assistant Voice — calm, plain, one thing at a time — governs every generated sentence, human-authored or Tamizhi-authored alike.
98. A five-person institution and a ten-thousand-person institution see the identical interaction shape, differing only in configured content.
99. No screen answers more than one question.
100. Every visual and behavioral pattern is learned once and trusted everywhere — the sentence every rule above exists to serve.

---

## Section 14 — Fifty Anti-Patterns, and precisely why each violates the Constitution

1. **Dashboard overload** — violates "one screen answers one question" (Product Philosophy).
2. **Popup spam** — violates the Interruption Rule (Experience Principles §3).
3. **Gamification** — violates the Visual Design System's own rejection of entertainment-register motion, and Product Philosophy's own "institutional operating system, not entertainment."
4. **Hidden navigation** — violates "no destination reachable only through a hidden path" (Rule 17).
5. **Artificial urgency** — violates "attention should be earned, not assumed" (Product Philosophy).
6. **AI interruption (a chat bubble)** — violates Institution Intelligence Principles' explicit "no chat window, no floating assistant."
7. **Notification fatigue** — violates "if everything is marked urgent, nothing is" (Product Philosophy).
8. **Color-only meaning** — violates the Visual Design System's own accessibility discipline.
9. **Permission surprises** — violates Authority's own resolved-fresh guarantee and Rule 85.
10. **Duplicate actions** — violates "one card, one decision" (Visual Design System).
11. **Inconsistent terminology** — violates Rule 94.
12. **Feature duplication (a second chat app)** — violates the North Star's "strengthen capability, not feature count," directly the Architecture Phase 2 finding on Internal Communication.
13. **Institution-specific hardcoding** — violates Platform Integration Strategy §6's "a bug report, not a shipped feature."
14. **A progress bar with no real denominator** — violates the Master Roadmap's own refusal of invented metrics.
15. **Zebra-striped tables** — violates the Visual Design System's explicit "no zebra striping."
16. **Heavy drop shadows on cards** — violates "a single hairline, not a heavy drop shadow."
17. **A second, competing notification inbox for any feature** — violates Institution Intelligence Principles §7 directly.
18. **Autoplaying video or animated illustration** — violates the Visual Design System's own "never" list.
19. **Bouncing or elastic overshoot animation** — same source, same list.
20. **Celebratory particle effects on completion** — same source; "completion is relief, not celebration."
21. **A permanent "NEW" badge that never expires** — violates "never a permanent tag... accumulates into noise."
22. **Floating labels on form fields** — violates the Visual Design System's own forms and accessibility discipline.
23. **A red dot for ordinary unread counts** — violates "red is reserved for actual errors or warnings."
24. **Modal dialogs for routine data entry** — violates the Interruption Rule directly.
25. **An infinite, unbounded search-results list with no "show more"** — violates the frozen Search design (M12).
26. **A "How can I help?" prompt anywhere** — violates Institution Intelligence Principles' explicit prohibition.
27. **Tamizhi executing an action without a human Accept** — violates Institution Intelligence Principles' core boundary.
28. **A Recommendation with a percentage confidence score** — violates the Recommendation Model's High/Medium/Low-only rule.
29. **Manufactured Act Now items to look busier** — violates the M7 Finance report's own explicitly rejected precedent.
30. **Person-level activity heat maps** — violates the Institutional Presence investigation's anti-surveillance finding.
31. **Default GPS-precision presence tracking** — same source, explicitly named as something that must never become a default.
32. **A Business Rule with no traceable source Policy** — violates the Institutional Policy Model's "hidden inside code" prohibition.
33. **An Approval Chain naming a specific person instead of an Area** — violates Governance §5 directly.
34. **Same-actor approval with no Separation-of-Duties recommendation** — violates Governance §6's configurable-recommendation posture.
35. **A Delegation with no automatic expiry** — violates Governance §3's non-negotiable rule.
36. **History rewritten or edited in place** — violates "corrections are new records, never edits" (Audit Engine Design).
37. **A cross-tenant leak in a shared cache key** — violates Enterprise Foundation §5.4's leakage-prevention rule.
38. **An Automation Rule that bypasses an Approval Chain** — violates the Automation Framework's core guarantee.
39. **A connector action Tamizhi can trigger without human Accept** — violates the Integration Framework's explicit boundary.
40. **A pie chart used where precise comparison matters** — violates this document's own Section 9.
41. **A treemap where a ranked list would be clearer** — same reasoning.
42. **A gauge used for anything beyond the one sparing case** — same reasoning; restraint is the point.
43. **Skeletons that don't match real content's shape** — violates the Visual Design System's layout-stability rationale.
44. **A spinner shown for a predictable-shaped result** — violates "skeletons over spinners wherever shape is predictable."
45. **A form that discards input on a failed submit** — violates "forgiving" (Section 1).
46. **Silent data loss on browser refresh** — same reasoning.
47. **A table that resets filters on every visit** — violates Rule 14.
48. **Onboarding as a separate mode with a progress bar** — violates Institution Setup Experience v2's explicit rejection of this exact pattern.
49. **A "Setup Complete" screen or an onboarding achievement system** — same source, "not an achievement system."
50. **Any screen a person who has learned one other ARUMBU application would find genuinely surprising** — the summary anti-pattern every rule above is one specific instance of.

---

## Section 15 — Ten-year test: fifty applications, five hundred screens, ten million records, thousands of institutions

**Would "I already know how this works" still hold? Tested honestly, not assumed.** The one hundred rules and fifty anti-patterns above genuinely cover the interaction surface this document set out to cover — but naming a rule and enforcing it across fifty independently-built applications, over ten years, by engineers who never read this document firsthand, are two different guarantees. **The honest gap this section exists to name: this document is necessary but not sufficient.** Consistency at this scale requires the same shift the Enterprise Architecture Audit already named as debt — a real, shared component library (Drawer, Table, Form, Select primitives every application imports rather than reimplements) and a contract-test-suite discipline (Enterprise Foundation §16.6) applied specifically to interaction behavior, not only data correctness — automated checks confirming every table really does sort the same three-state way, every drawer really does close the same way, before a change ships. **Without that enforcement layer, this document is a constitution with no court** — correct, complete, and eventually, quietly, unevenly followed. With it, the "learn once, trust everywhere" promise this entire document exists to keep becomes structurally guaranteed rather than merely well-documented.

---

## The Twenty Interaction Laws of ARUMBU

1. Every reversible action opens in a drawer; every irreversible action opens in a dialog. Never the reverse.
2. Escape always closes the topmost layer, never navigates away.
3. Silence is a valid, calm, correct outcome — never manufactured urgency to fill it.
4. An Act Now item always carries a real verb; a Be Aware item never carries a control.
5. Every Record has a Timeline, a stable URL, and a visible "last updated."
6. History is never edited — only corrected, by a new entry referencing the old one.
7. Institution-configured terminology always wins over generic platform language, everywhere, without exception.
8. Every list, table, and search remembers its own filter and sort, per person.
9. Tamizhi advises through Recommendations only — it never executes, never interrupts, and never gets its own inbox.
10. A permission a person doesn't have is never shown as available only to fail on click.
11. No screen answers more than one question.
12. Every notification is traceable to a real, current, true fact — never fired to prove the system is working.
13. Any select with more than a handful of options is searchable, never a long scroll.
14. Numeric columns use tabular figures and right-alignment, without exception, everywhere.
15. A person's unsaved work is never silently discarded — by a closing drawer, a refresh, or a failed submit.
16. Color never carries meaning alone — every semantic state pairs with an icon or a label.
17. Every application shares one sidebar, one top bar, one Search, one keyboard shortcut to reach it.
18. A Search result always opens the record's real, existing detail experience — never a duplicate view.
19. Skeletons match the shape of what's coming; spinners are reserved for the genuinely unpredictable.
20. A user who has learned one ARUMBU application already knows how every other one behaves — the law every other law exists to serve.
