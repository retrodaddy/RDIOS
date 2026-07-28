Status: 🟢 Frozen v1 — the visual constitution of RDIOS. A third document alongside the Engineering Constitution (what may be built) and the Experience Principles (how it should feel and behave): this one governs how it looks and communicates. No future screen invents its own visual style; every application inherits this system. Pure product design — no code, no CSS, no components, no mockups, no architecture changes. RDE and the current RDIOS prototype are unmodified by this document.

# RDIOS Visual Design System v1

## Why this document exists

RDIOS is used for eight to twelve hours a day, by people making real decisions about real institutions. At that duration, visual design stops being decoration and becomes a working tool — every unnecessary contrast, every inconsistent spacing gap, every decorative flourish is a small tax paid thousands of times a day. This document exists to make sure RDIOS never charges that tax.

**The operating system should disappear. The institution should become visible.** Every rule below serves that one sentence. Visual weight is a finite budget, spent on the institution's real information — names, numbers, statuses, decisions — never on the chrome around it.

## Cognitive foundations — how this system decides what to show

Before typography or color, the actual design question is: *how do humans recognize meaning without reading?* Three real mechanisms, used deliberately throughout everything below:

**Pre-attentive processing.** Size, contrast, and position are recognized by the eye in under 200 milliseconds, before conscious reading begins. Typography and color are read; size, contrast, and position are simply *seen*. This is why hierarchy in RDIOS is built first from size, contrast, and position — color is always the last, most disposable signal layered on top, never the only one carrying meaning (this is also the accessibility foundation — see below).

**Proximity and grouping (Gestalt).** Things placed close together are read as related; things separated by space are read as distinct, without a border ever being drawn. This is why whitespace in RDIOS is never decorative — it's a semantic signal. A gap between two elements is a claim: *these are not the same thought.*

**Recognition over reading.** A person should know *what needs attention, what's safe, what changed, what requires action, what's complete* by glancing, not by reading a sentence. Each of those five states gets its own consistent visual grammar, defined once in this document, applied everywhere, never reinvented per screen:

- **Needs attention** → largest, topmost, highest-contrast, paired with a verb-labeled control.
- **Safe / complete** → visually recedes — lower contrast, less size, moves toward the bottom or out of view entirely. Completion is relief, not celebration; it should look like *less*, never like a badge or a burst.
- **Changed (recency)** → one brief, temporary emphasis that fades on the next visit. Never a permanent "NEW" tag — those accumulate into noise within weeks.
- **Requires action** → identical grammar to "needs attention," plus the presence of an actual interactive control. The control's existence is itself the signal; its absence on an informational item is what tells a person "nothing to do here, just be aware."

## Typography

**Two families, not one, doing two different jobs.** A workhorse text family — humanist, highly legible at small sizes, a wide range of weights, the kind of face used for interfaces at companies that care about long reading sessions (Inter, IBM Plex Sans, and Public Sans are the right *category* of reference, not a final commitment) — carries essentially everything: labels, body copy, tables, forms, navigation. A second, slightly more expressive display family is reserved for exactly one role: the single most important line on a screen — a greeting, a page title, the one number that matters most on a given card. **Never more than one Display-sized element visible at a time.** The moment a screen has two things fighting for Display weight, neither one actually has it.

**A defined scale, each size with a job, not a free choice per screen:**
- *Display* — the one big thing per screen. Used sparingly enough that seeing it still means something.
- *H1 / H2* — page and section titles. Consistent, predictable, never used for emphasis mid-paragraph.
- *Body* — the workhorse. The vast majority of RDIOS is this size.
- *Small* — secondary metadata, timestamps, captions — always paired with something at Body size nearby, never standing alone as the only text in a region.
- *Micro / Label* — uppercase, wide letter-spacing, low visual weight. Used for category tags ("ACT NOW," "BE AWARE") — already proven correct in the running prototype. Its job is to be present but quiet, like a museum placard, not a headline.

**Numbers get their own rule: tabular figures, always, in any column or table.** Proportional numerals — where a "1" is narrower than an "8" — cause financial and report tables to visually wobble, forcing the eye to re-align on every row. This is non-negotiable for Money, Reports, and any table anywhere; digits must occupy identical width so columns stay physically aligned without the reader doing any work to make them line up.

**Line height changes with the job, not the screen.** Scanning contexts — tables, lists, dashboards, Act Now cards — use tight line height (roughly 1.2–1.3×) because the eye is moving down a list of short facts, not reading prose; extra vertical air between short lines just makes the list longer to scan. Reading contexts — a document viewer, a long description field, RDIIS-style knowledge content — use generous line height (roughly 1.5–1.65×) because sustained reading needs room for the eye to find the start of the next line without losing its place. Getting this backwards — generous spacing on a dense table, tight spacing on a paragraph — is one of the most common, most fatiguing mistakes in business software, and RDIOS never makes it.

**Screen size changes margins, not type size.** A 32-inch monitor does not get bigger text — it gets more breathing room around the same comfortable reading scale, because text that scales up with screen size stops being about legibility and starts being about filling space. Laptops use the baseline scale. Tablets keep the same reading scale but grow interactive targets (buttons, row height) for touch accuracy. Type size never drops below a genuinely comfortable minimum on any device — RDIOS is used by executives, HR, finance professionals, and operations teams across a wide range of ages and eyesight, and "technically legible" is not the bar.

## Spacing

**A single scale, used everywhere, so relationships stay predictable.** Every gap in RDIOS is a multiple of one base unit, not a value chosen by eye per screen. When every spacing value is a multiple of the same unit, a gap that's twice as large *reads* as twice as separated — the Gestalt grouping principle above only works if the underlying scale is consistent; an inconsistent scale makes proximity meaningless, because a person can no longer trust that a bigger gap means a bigger conceptual break.

**Density: compact by default, never cramped.** RDIOS is used all day by people who value information-per-glance — a sparse, airy layout that looks good in a screenshot costs real scrolling and real fatigue across an eight-hour day. But compact is not the same failure mode as cramped: **compact means the spacing scale is small and consistent; cramped means the spacing is inconsistent or insufficient to support grouping.** A table with tight, *even* row spacing is compact and calm. A table with tight, *uneven* row spacing is cramped and anxious. The difference a person feels is entirely about predictability, not raw pixel count.

**Section rhythm stays constant across the product.** The vertical gap between major sections on Home (Act Now → Be Aware → History) is the same category of gap used between major sections everywhere else RDIOS has major sections — People's roster and its detail panel, Money's snapshot and its transaction list, wherever the pattern recurs. A person should be able to predict, without looking, roughly how far down the page the next section starts, because it's always the same rhythm.

## Layout — reusable rules, not screens

**Home.** Single column, comfortable reading width (never stretched edge-to-edge on a wide monitor — long line lengths are hard to scan). Generous top margin before the greeting; this is the one place in the product where a little extra air is earned, because it's the calmest moment in the day. Act Now always first, always closest to the top, regardless of what else is on the page.

**Sidebar.** Fixed width, icon and label, deliberately *quiet* — lower contrast against the background than the content it leads to, because its job is orientation, not attention. Exactly one method signals the active destination (a single accent treatment — never a glow, a border, and a background tint all stacked on top of each other; pick one, apply it everywhere).

**Top bar.** Minimal height. Houses Search, Notifications, Identity, and nothing else — no marketing chrome, no promotional banners, no "what's new" callouts competing with the sidebar for attention.

**Cards — the primary unit of thought in RDIOS.** One card holds one fact or one decision, never a mix. Every card in the product shares one corner radius, one border treatment (a single hairline, not a heavy drop shadow — shadows read as dated and add visual noise at scale), and one padding rhythm. A card that looks structurally different from every other card in the product is a bug, not a design choice.

**Tables — the accounting- and reports-critical surface.** Tabular figures everywhere, numeric columns right-aligned, text columns left-aligned. **No zebra striping** — alternating row colors are visual noise across a long session; a clean hairline divider between rows, plus a hover highlight for the row currently being scanned, reads calmer over hours than an entire table of competing background tones. Headers stay visible on scroll for any table long enough to need it. Row height is generous enough to scan comfortably without sacrificing rows-per-screen — the same compact-not-cramped discipline as spacing generally, applied specifically here because tables are where founders and finance teams will spend the most concentrated time.

**Lists.** Same one-fact-per-item discipline as cards, but without card chrome — a consistent divider between items is enough separation once the list itself establishes rhythm; wrapping every list item in its own bordered card is unnecessary weight.

**Timelines, Activity, History.** Chronological, newest first — already correct in the running prototype. Each entry is one calm sentence and a relative timestamp. No per-event-type iconography — a different icon for every kind of thing that can happen is exactly the kind of decoration that accumulates into noise; plain, well-written sentences already carry the meaning, proven live this engagement ("Ganesh Bhatt joined").

**Drawers — the default for anything that isn't destructive.** Slide from the edge the content is conceptually attached to. The background behind a drawer stays visibly, dimly present — never a solid black overlay — because the whole point of a drawer over a full page is that the person never truly left where they were.

**Dialogs — reserved for irreversible actions only.** Delete, offboard, anything that cannot be undone with an "undo" toast. Never used for routine data entry; that overuse is one of the most common sources of interruption-fatigue in business software, and it directly violates the frozen Interruption Rule.

**Forms.** Labels sit above their field, always — never floating labels, which reduce scanability and frequently fail accessibility once a field has content in it. One column by default; two columns only for tightly related short fields (City / State, not Name / Email). Validation appears as calm text beneath the field, never as a red border alone — color-only error signaling fails both the accessibility bar and the "never rely on color alone" rule above.

**Empty states.** A calm sentence plus one primary action, centered, generous surrounding whitespace. Never illustration-heavy, never a mascot — decoration that exists to soften bad news is still decoration for its own sake, and the Product Readiness Review already established the honest, direct version of this pattern works better.

**Charts and graphs.** Minimal by default — no 3D, no heavy gradients, no chart-junk. Label data directly on the chart where possible rather than forcing a separate legend, which costs a back-and-forth glance every single time. Tabular figures on every axis. Most charts use one accent hue plus neutrals; the full semantic palette (success/warning/error) is reserved specifically for charts that are actually about status, never spent on a general trend line just because color is available.

**Widgets (Be Aware content).** Label, a value sized clearly below Display weight, one line of context. Every widget on Home shares this exact shape, so the eye never has to re-learn a new widget layout — recognizing the *pattern* is what lets a person process five widgets as fast as one.

**Search.** One global entry point, command-palette in spirit — already proven correct in the current build. Results grouped by plain-language type, never an internal name. Small result counts per group with a clear "show more," never an unbounded scrolling wall.

**Notifications.** Quiet by default — a small, neutral or accent-colored badge, not a pulsing red dot. Red is reserved specifically for things that are actually errors or warnings; using it for ordinary unread-count is a common, wrong pattern that trains people to feel alarmed by normal activity, which is exactly the opposite of calm.

## How Act Now / Be Aware / History communicate without relying on color

Color is the last layer applied, never the only one carrying the message — every tier is fully legible in grayscale:

| | Size | Position | Contrast | Rhythm | Interactivity |
|---|---|---|---|---|---|
| **Act Now** | Largest among peers | Always topmost | Highest against background | Tight — urgency reads as closeness | A verb-labeled control is present |
| **Be Aware** | Mid-size | Always below Act Now | Soft — muted background tint, not a raised card | Generous — calm, unhurried | No control at all; the absence *is* the signal |
| **History** | Smallest | Bottom, or behind a scroll/click | Quietest — muted text, never primary | Left-aligned, evenly spaced | None — settled, past-tense, safe |

A colorblind person, or anyone with their monitor in grayscale, reads the identical hierarchy from this table alone. Color, when applied, only ever confirms what size, position, contrast, and interactivity already established.

## Color — five complete visual experiences, one language

Not five palettes bolted onto one layout — five atmospheres, each fully specified across the same categories, each following every rule above identically. Only the emotional register changes.

Every theme defines, and holds itself to, the same structure: a **Base** canvas, a **Surface** tone one step up (cards, panels), an **Elevated** tone one step further up (drawers, dialogs), a hairline **Border/Divider**, three text tones (**Primary / Muted / Dim**, matching the hierarchy already proven in the running prototype), one **Accent**, and the four semantic states — **Success, Warning, Error, Info**. Sidebar and top bar always sit at Surface tone, slightly recessed from Base, reinforcing that they are orientation, not content. Tables sit at Base with hairline dividers. Charts draw primarily from Accent plus neutrals. Forms use Base or Surface fields with Border outlines, Accent appearing only on focus.

**Semantic states keep their conventional hue family in every theme** — success reads as some shade of green, warning as amber, error as some shade of red, info as blue, in Slate and in Midnight Executive alike. Breaking that convention for the sake of brand consistency would cost real recognition speed for a genuinely small aesthetic gain; the *tone* and *saturation* of each shifts to suit the theme's overall register, the *hue family* never does.

### Theme 1 — Slate (Default)

The calm, neutral baseline — follows the system's own light/dark preference automatically, because the default should feel like it's not making a statement at all. Desaturated cool grays throughout; a confident indigo-violet accent (already prototyped, already proven to read as calm and trustworthy rather than corporate-blue-generic or alarming). This is the theme for someone who has never thought about themes and shouldn't have to.

### Theme 2 — Light

Not simply "Slate in light mode" — a deliberately bright, high-key theme built for offices with real ambient daylight, where subtle low-contrast borders wash out entirely. Cleaner, slightly warmer whites than Slate's neutral gray-white; more clearly defined borders and dividers than Slate needs, because bright ambient light genuinely reduces perceived contrast. A confident, familiar blue accent — the color of an environment that wants to feel unmistakably professional and legible under office lighting.

### Theme 3 — Dark

Comfort-first, built specifically for long, uninterrupted sessions with reduced eye strain — this is the theme for someone living in RDIOS eight-plus hours a day. Warm dark grays, deliberately never pure black — true black against bright text is itself a source of eye fatigue over hours, a well-documented display-ergonomics issue. Slightly reduced contrast between the three text tones compared to Light, and a muted, lower-saturation accent (a soft teal or blue rather than anything neon) — brightness that's comfortable for four minutes becomes fatiguing across four hours, and Dark is tuned for the four-hour case.

### Theme 4 — Forest

Warm, organic, human — genuinely well-suited to NGOs, schools, temples, environmental and community institutions, and available to anyone who simply prefers it. **One caution worth stating directly: this theme should never be assumed from institution type.** Offering it as a natural fit for certain institutions is different from defaulting a temple into green because it's a temple — that would be a stereotype dressed as a feature. Forest stays a free choice, always, for every institution type. Visually: warmer neutrals than Slate's cool grays (a gentle yellow-brown undertone rather than blue-gray), cream-toned base in its light rendering, deep green-black in its dark rendering, a genuine moss or forest-green accent. The overall feeling is handmade and human rather than corporate-efficient — the deliberate opposite end of the spectrum from Midnight Executive.

### Theme 5 — Midnight Executive

Premium, elegant, high-contrast — built for founders, finance, operations, and anything resembling a control room, where the feeling of the software itself should communicate that real stakes live here. True near-black base, crisp near-white text, maximum contrast between them. One signature accent — a muted gold or brass reads as "executive" without tipping into gaudy — used sparingly, almost exclusively on the highest-stakes interactive moments (an Act Now decision, a critical approval), so it stays genuinely special rather than becoming wallpaper. This is the one theme where restraint in *where* the accent appears is as important as the accent itself.

## Accessibility — part of the language, not a checklist after it

Every theme above meets WCAG AA contrast minimums as a baseline, non-negotiable floor: at least 4.5:1 for body text against its background, at least 3:1 for large text and interactive UI elements. This is checked per theme, not assumed from one "primary" theme and hoped for elsewhere.

Because hierarchy is built first from size, position, and contrast rather than color alone (see Cognitive Foundations), every theme already carries meaningful color-blindness resilience without special-casing — the semantic states additionally never rely on hue alone where the distinction matters most (an icon or label accompanies color in genuinely critical contexts, such as a financial approval's success/error state). Focus indicators are always visible, in every theme, and are never suppressed for aesthetic reasons — a founder tabbing through a form and a keyboard-dependent user are the same accessibility requirement, not two different ones. Touch targets meet a comfortable minimum size on tablet regardless of theme. Text remains resizable by the user without breaking layout. Motion respects a reduced-motion preference, detailed below.

RDIOS is used by executives, HR, finance professionals, operations teams, and people across a wide range of ages and eyesight — "technically compliant" is the floor this document sets, not the ceiling it aims for.

## Motion — communicates, never entertains

**Duration.** Micro-interactions — hover, focus, a control's pressed state — are fast enough to feel instant, roughly the range that registers as "immediate" rather than "an animation happened" (on the order of 150–250ms). Larger transitions — a drawer sliding in, a panel expanding — run slightly longer (roughly 250–350ms) so the eye can track what moved and where it went. Nothing in RDIOS runs long enough to be waited for; if a person notices they're waiting on an animation, it's already too slow.

**Easing carries meaning.** Things entering the screen decelerate into place (ease-out) — it reads as arriving, settling. Things leaving accelerate away (ease-in) — it reads as dismissed, done. This isn't a stylistic flourish; using the same easing for both directions quietly removes a signal a person could otherwise read for free.

**Drawers slide from the edge they belong to**, background dimmed but never opaque, exactly as described under Layout — motion here exists to reinforce "you didn't leave," not to impress.

**Loading states favor skeletons over spinners wherever the incoming content has a predictable shape.** A card-shaped placeholder that resolves into the actual card preserves layout stability — nothing jumps when the real content arrives — and it communicates *what kind of thing* is coming, which a generic spinner cannot. Spinners are reserved for actions with no predictable shape, such as a button's own pending state, already proven correct in the current build.

**Never:** bouncing or elastic overshoot, celebratory particle or confetti effects, parallax scrolling, autoplaying video or animated illustration. All of it is entertainment, not communication, and all of it is explicitly out of register for an institutional operating system used for real decisions.

## Visual consistency across every application

People, Work, Money, Projects, Customers, Documents, Reports, and Settings all draw from this one vocabulary — the same card shape, the same type scale, the same spacing scale, the same three-tier attention grammar. The difference between any two applications should live entirely in *what data they show*, never in *how the containers, type, or spacing around that data look*. This is already a proven pattern, not a hope — a single Entity Timeline shape was validated across five independent screens earlier in this engagement precisely because it was allowed to prove itself before becoming a rule. This document extends that same discipline to the whole product, upfront, so every future application starts already consistent rather than earning consistency screen by screen.

## Leaving room for Tamizhi, without designing it

Tamizhi is not designed here — but this system already has two honest homes for it to arrive into later, without a single existing screen needing to change shape:

1. **Through Search.** A command-palette-style entry point already exists and is already the natural place someone goes to ask for something rather than navigate to it. An assistant answering a typed question is a natural extension of a surface that already does that job, not a new paradigm bolted beside it.
2. **Through the Attention Contract.** If Tamizhi ever recommends a decision, that recommendation is just another contributor to Act Now, following the identical card, verb, and tiering rules every other Act Now item already follows. It would never need its own chat-bubble-in-the-corner treatment, which is the generic pattern this system deliberately avoids — a bolted-on widget would break the calm, card-based language this whole document exists to protect.

Nothing about this visual system needs to change when Tamizhi arrives. That was the test.

## The final test, applied

*If someone used RDIOS every day for the next ten years, would this visual system become mentally effortless?*

Every rule in this document was chosen to pass that test specifically — not "does it look good in a first screenshot," which is a completely different and much easier question. A compact, predictable spacing scale is chosen because inconsistency is what a ten-year user would eventually notice and resent, not because it's fashionable today. Skeleton loading over spinners is chosen because layout stability compounds in value over thousands of page loads, not one. The single-accent restraint in Midnight Executive is chosen because a color used everywhere stops meaning anything by month two. Nothing here was chosen for how it demos. Everything here was chosen for how it wears.

---

Nothing implemented. This document becomes the visual constitution every future screen inherits — People, Work, Money, and everything after — once frozen.
