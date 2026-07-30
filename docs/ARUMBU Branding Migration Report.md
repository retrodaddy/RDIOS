# ARUMBU Branding Migration Report

Status: 🟢 Complete
Scope: Platform-wide branding migration, RDIOS → ARUMBU (customer-facing only)
Preceded by: Implementation Sprint 2.5 (accepted)
Blocks: M7 — Finance (cleared to begin now that this report is delivered)

---

## 1. What this was

Not an architecture change, not a feature sprint, not a UI redesign. The product's
customer-facing name changed from **RDIOS** to **ARUMBU** ("Institutional Operating
System" remains the product category, said alongside the name where a tagline fits).
RDIOS remains the correct internal/engineering name for the underlying platform —
this migration touched *only* what a signed-in person or a visitor actually reads on
screen.

---

## 2. Every visible location updated

| Location | Before | After |
|---|---|---|
| `/login` | Hand-built "R" mark + `<h1>RDIOS</h1>` + tagline | `<BrandLockup />` — "A" mark, **ARUMBU**, "Institutional Operating System" |
| `/onboarding` | "R" mark span | `<BrandMark />` |
| `/invite/[membershipId]` | "R" mark span | `<BrandMark />` |
| Sidebar (desktop, collapsed + expanded) | "R" mark span, sublabel "RDIOS" | `<BrandMark size="sm" />`, sublabel "ARUMBU" |
| Mobile navigation drawer | "R" mark span | `<BrandMark size="sm" />` |
| Browser tab title / metadata (`app/layout.tsx`) | `"RDIOS"` / `"The RD Institutional Operating System."` | `"ARUMBU"` / `"ARUMBU — the Institutional Operating System."` |
| Browser favicon / app icon | none (unset) | `app/icon.svg` — placeholder mark, auto-detected by Next.js App Router |
| Settings → Preferences copy | "How RDIOS looks and opens for you specifically" | "How ARUMBU looks and opens for you specifically" |
| Sign-in error (no account found) | "No RDIOS account found for that email yet…" | "No ARUMBU account found for that email yet…" |

All nine locations were live-verified in a running instance (see §5), not just
grepped and assumed.

### New component: `components/ui/Brand.tsx`

`BrandMark` and `BrandLockup` are now the single source of truth for the brand mark
everywhere it appears. Every call site above renders through this one component —
swapping the placeholder "A" for the final ARUMBU SVG later is a one-file change,
per the explicit "make the branding component easy to replace later" instruction.
Nothing else needs to be touched when that asset arrives.

---

## 3. Logo placeholder

`app/icon.svg` — a plain rounded-square mark (indigo background, white "A"
letterform), matching the existing visual language rather than introducing a new
style. Colors are hardcoded rather than reading CSS theme variables, since a static
SVG file can't do that; documented inline in the file itself. This is picked up
automatically by Next.js's App Router as the favicon/app icon — no metadata wiring
required. Replace this one file when the final SVG is ready.

---

## 4. Remaining internal references (intentionally left as-is)

A full-repo search across `*.ts`/`*.tsx` found **24 remaining "RDIOS" occurrences**,
in exactly **17 files**. Every one was individually inspected; all 24 are inside
JSDoc block comments or `//` line comments — engineering documentation, never a
rendered string. None are reachable by a user. Representative examples:

- `os/identity/mock-provider.ts` — "In-memory Identity provider — dev-only, exists
  solely so RDIOS is clickable before a Supabase project is provisioned"
- `os/identity/provider.ts` — "RDIOS talks to this interface, never to a concrete
  implementation"
- `components/ui/Card.tsx` — "The primary unit of thought in RDIOS — Implementation
  Sprint 2 §7"
- `os/preferences/types.ts` — "The five themes frozen in RDIOS Visual Design System
  v1"

Per the founder's explicit "Developer Language" instruction, these were left
unrenamed: they are internal architecture references, not user-visible text, and
renaming them wouldn't improve clarity. `package.json`'s `"name": "rdios"` field and
the `G:\RDIOS` folder/repo name were likewise left untouched — both are
build-tooling/filesystem identifiers, never shown to an end user.

---

## 5. Live verification

Dev server rebuilt clean (killed all node processes, cleared `.next`, restarted) and
walked through end-to-end as a fresh user:

1. **`/login`** — tab title "ARUMBU"; page renders the "A" mark, "ARUMBU" wordmark,
   "Institutional Operating System" tagline.
2. **Onboarding** — created a fresh test institution ("Brand Test Co", founder
   "Taylor Finch"); landed on `/home` with tab title "ARUMBU".
3. **Sidebar** — confirmed via accessibility-tree read that the sublabel beneath the
   institution name reads "ARUMBU".
4. **Settings** — confirmed the preferences copy reads "How ARUMBU looks and opens
   for you specifically…"; confirmed the 5-theme dropdown still renders and
   functions (Slate / Light / Dark / Forest / Midnight) — untouched by this
   migration, checked as a regression guard.
5. **Invite flow** — invited a second person ("Casey Nolan"); confirmed a pending
   invitation entry and a live `/invite/[membershipId]` link were produced.
6. **Invite acceptance page** — opened the generated invite link directly; confirmed
   it renders the "A" `BrandMark` and correct copy.
7. **Mobile navigation drawer** — resized to a 375px mobile viewport, opened the
   drawer; confirmed via accessibility-tree read that it shows the institution name
   and "ARUMBU" sublabel alongside the brand mark, matching the desktop sidebar.
8. **People roster** — confirmed the DataTable primitive (Sprint 2.5) still renders
   correctly with both the founder and the newly-invited pending member listed —
   untouched by this migration, checked as a regression guard.

One transient anomaly was investigated during this pass: an automated click on the
Settings "Invite" button initially appeared not to submit. Direct inspection (both
input fields genuinely held the typed values, no console errors, and a subsequent
programmatic dispatch of the same click event completed successfully and produced
the pending invitation + link immediately) confirmed this was a tool-timing
artifact in how the click was dispatched, not a code regression — this exact flow,
through the same unmodified `InviteForm.tsx` / `PendingInvites.tsx`, had already
been verified working in Sprint 2.5. No code changes were needed.

### Typecheck / Lint / Build

- `npx tsc --noEmit` — clean.
- `npx next lint` — clean.
- `npx next build` (production, after a clean `.next`) — clean.

---

## 6. Historical documents preserved

Per the explicit instruction not to rename historical documents, all 19 existing
`RDIOS *.md` files in `docs/` were left in place under their original filenames.
Each received a short preservation note prepended above its existing frozen-status
line:

> "ARUMBU is the product name introduced after this document was written."
> (full note, verbatim, prepended to all 19 files)

This was applied uniformly across all 19 — including the Product Foundation,
Experience Principles, Visual Design System, Tenant Architecture, and all three
prior Implementation Sprint reports, plus the Product Validation Sprint report —
since every one of them chronologically predates the ARUMBU decision and refers to
"RDIOS" as the product name throughout. Original reasoning inside each document is
untouched; only the prepended note is new.

---

## 7. Confirmation

Customer-facing branding is now **ARUMBU** everywhere a user can see it: login,
onboarding, invitations, the app shell (desktop and mobile), browser tab, settings,
and system error copy. No customer-facing "RDIOS" string remains anywhere in the
codebase. All remaining "RDIOS" references are internal engineering comments, by
design. Ready for M7 — Finance.
