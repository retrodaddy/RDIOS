> **ARUMBU is the product name introduced after this document was written.** Everything below was written under, and refers throughout to, the internal engineering name "RDIOS." That reasoning is preserved exactly as frozen — nothing in this document has been altered or renamed. "RDIOS" remains the correct internal/engineering term for the underlying platform this document describes; "ARUMBU" is what that platform is now called on every customer-facing screen.

Status: 🟢 M7 Complete — smallest usable slice of Finance & Assets, live and verified
Scope: Financial Accounts · Expense Records · Income Records · Asset Registry · Attention · History · Authority · Policy seams · Document placeholders

---

## 1. What this is

Not an accounting application bolted onto the side of ARUMBU — the institutional memory for everything that has financial value, composed with Identity, People, Work, Authority, and History the same way every prior milestone composed with what came before it. Expense and Income share one underlying shape (`FinanceTransaction`, a discriminated union exactly like `applications/work/types.ts`'s `Task | Approval`) — the "shared transaction spine" this engagement has been steering toward since Finance was first discussed. Assets are a separate registry, deliberately not modeled as a transaction, with one real seam (`acquiredViaExpenseId`) connecting the two where that composition is genuinely true.

Built as the fifth Application Layer module (`applications/finance/`), following the exact discipline of Work (M6) and People (M3): types → provider interface → in-memory mock provider → server actions → UI, with Authority, Attention, and History wired in at the end rather than bolted on.

---

## 2. What was implemented

### Part 1 — Financial Accounts
`applications/finance/types.ts`'s `FinancialAccount` — a lightweight bucket (Cash, Bank Account, Income, Expense, Asset, Liability, Equity/Institution Fund), institution-neutral by construction: no double-entry ledger, no computed balances, no company-specific account types. An Expense or Income record can optionally name which account the money actually moved through — the one deliberate link between Part 1 and Parts 2/3, not three disconnected feature lists. Built and verified live: created a "Hundi Cash Box" account for a temple.

### Part 2 — Expense Records
Every field the founder listed: Title, Description, Amount, Date, Category (free text — no hardcoded category list, since none was given and a fixed enum would be exactly the "company accounting assumption" the brief warned against), Payment Method, Vendor/Payee, a Document reference placeholder, a lifecycle Status (`recorded`/`archived`), a separate Approval Status (`pending`/`approved`/`rejected`), History, and Creator. Approval is single-gate (Treasury), resolved through a Policy seam (§8 below), with the same-actor exclusion already frozen for Work's Approvals (Governance & Responsibility Model v1 §6) applied here too — verified live: the founder could not approve their own expense.

### Part 3 — Income Records
The founder's exact list — Donation, Sales, Grant, Membership Fee, Service Income, Rental, Other — as a real fixed enum, since these were given explicitly rather than invented. Deliberately **no approval workflow**: recording a donation documents something that already happened; nobody needs permission for a gift already received. This is a conscious asymmetry with Expense, not an oversight — checked against "would this make sense for a temple recording a devotee's donation?" and the answer was clearly no approval needed.

### Part 4 — Asset Registry
Every field requested: Name, Category (free text), Description, Purchase Date, Purchase Value, Status (In Use / In Storage / Under Repair / Retired), Custodian (a real Person), Location, Warranty, Service Notes, Document placeholders, History. No depreciation, no maintenance scheduling — exactly as scoped. Verified live: registered a "Brass Temple Bell" under category "Ritual Items," with the Act Now nudge correctly firing for "in use, no custodian."

### Part 5 — Attention
Wired into `os/attention/engine.ts` alongside Work's existing contributions, real decisions only:
- **Act Now:** a pending expense the signed-in person can actually decide (same eligibility logic as Work's Approval steps, same-actor excluded); an asset in active use with nobody accountable for it; an asset whose warranty expires within 30 days.
- **Be Aware:** a "Money" line (recorded income in / expense out, entry count) and an "Assets" line (count, how many are unaccounted for).

Nothing artificial was added — no manufactured "large expense" nudge, no threshold that wasn't explicitly requested.

### Part 6 — History
Every meaningful event calls the existing `recordHistory` — no new history mechanism. Verified live, narrated exactly as real events: *"Ravi Sharma recorded an expense — 'Flowers and Prasadam' (₹2,500)," "Lakshmi Iyer approved the expense 'Flowers and Prasadam',"* *"Ravi Sharma registered the asset 'Brass Temple Bell'."*

### Part 7 — Authority
Three new Areas of Responsibility added to the existing catalog (`engines/authority/types.ts`), noun-based, exactly the founder's own examples:

| Key | Label | What it governs |
|---|---|---|
| `finance.manage` | Manage finances | Record expenses and income, manage financial accounts |
| `treasury.approve` | Approve spending | Decide a pending expense — the institution's real check on spending |
| `assets.manage` | Manage assets | Register assets, transfer custodianship, edit records |

No new permission mechanism, no per-button gating — these plug into the same `PositionSidePanel` responsibility checklist every existing Area already uses, with zero code changes needed there (it maps over the catalog dynamically). Verified live: created a "Treasurer" position, granted it "Approve spending," appointed a second person, and confirmed her Home screen surfaced exactly the one pending expense she — and only she — could decide.

### Part 8 — Policy extension points
No Policy Engine was built, per the explicit instruction. `applications/finance/policy.ts` names the two real seams as single-caller functions rather than inlining assumptions into `actions.ts`:
- `resolveExpenseApprovalArea(expense)` — today always returns `treasury.approve`; the seam for future "approval limits by amount" or "purchase thresholds" logic.
- `accountCreationRequiresApproval()` — today always `false`; the seam for future account-level budget controls.

Both are documented as honest placeholders — "this constant IS the policy until a real engine exists" — not disguised as finished rules.

### Part 9 — Documents
No Documents application was built. `DocumentRef` (`{ id, label, addedAt }`) is a named-reference placeholder on both Expense/Income and Asset — a person can type "Receipt #4521" today; the real Documents application replaces the input with genuine uploads later without this section needing to change shape.

---

## 3. What was deliberately deferred

- **Depreciation and maintenance scheduling** on Assets — explicitly out of scope.
- **Multi-step Approval chains for Expense** — Work's Approval engine supports arbitrary chains of Areas in sequence; Expense approval here is a single gate (Treasury). Reusing the full chain mechanism for what is, today, always a one-step decision would have been complexity without a real requirement behind it. The seam to route Expense approval through a real Work Approval later exists (`resolveExpenseApprovalArea` could return a sequence instead of one Area) but wasn't built speculatively.
- **A real Policy Engine** — named as an explicit non-goal; only the extension seams were built.
- **A real Documents application** — placeholders only, per Part 9.
- **Double-entry bookkeeping / computed account balances** — Financial Accounts are buckets a transaction can reference, not a ledger that reconciles itself. Real running balances are a natural Phase 2, not attempted here.
- **Multi-currency** — one implicit currency (₹) throughout, matching every other numeric field in ARUMBU today; no currency field was requested and none was added.
- **A standalone Vendor/Payee entity** — vendor and payer stay free-text fields on the transaction, the same "smallest implementation that satisfies the frozen concept" discipline used everywhere else in this engagement.

---

## 4. Verification performed

1. **Typecheck** — `npx tsc --noEmit`: clean, exit 0.
2. **Lint** — `npx next lint`: "✔ No ESLint warnings or errors."
3. **Production build** — clean `.next`, `npx next build`: compiled successfully, all 17 routes generated, `/money` at 8.57 kB / 98.3 kB First Load JS.
4. **Live walkthrough — Temple** ("Sri Venkateswara Temple"): created a Financial Account, an Expense, an Income record, and an Asset; confirmed same-actor exclusion blocked the founder from approving their own expense; created a "Treasurer" position, granted it "Approve spending," invited and appointed a second real person ("Lakshmi Iyer"); confirmed her Home screen's Act Now surfaced exactly the one pending expense she was eligible to decide, approved it as her, and confirmed both Home's History and Be Aware ("Money," "Assets") updated correctly on both accounts' sessions afterward.
5. **Live walkthrough — Hospital** ("Aurora General Hospital"): confirmed `/money` renders correctly and reads naturally with hospital terminology and a different founder identity; confirmed `/work` and `/people` are unaffected.
6. **Console check** — zero console errors across both institutions and both live sessions.
7. **Institution-type reasoning** — every Finance copy string reads through `ctx.institution.name`/generic language, never a hardcoded type assumption; the only type-sensitive pieces already in the platform (nav labels, Position responsibility labels) were confirmed to compose correctly with the three new Areas without requiring any per-type overrides, since "Manage finances"/"Approve spending"/"Manage assets" already read naturally across company, temple, hospital, school, and NGO contexts — checked directly against the "would this make sense for a temple / hospital / school?" test throughout, not only at the end.

## 5. Regression testing

- `/work`: Needs Your Action / Everything lists still render correctly; unaffected by Finance's changes to `os/attention/engine.ts` (additive only, no existing logic touched).
- `/people`: roster and position tables render correctly on a fresh institution.
- Existing themes, typography, DataTable, Toast, and focus-ring behavior: reused as-is by Finance's UI (no new primitives were introduced) — `MoneyBoard.tsx` composes `Badge`/`Button`/`DataTable`/`EmptyState`/`useToast` exactly as `WorkBoard.tsx` and `PositionsTable.tsx` already do.
- The Authority Engine's bootstrap rule (founder always holds every Area) and the Governance Model's same-actor exclusion were both exercised live, not just inspected — both held.

## 6. Honest assessment of Finance readiness

This is a real, working vertical slice — not a form collection. An expense genuinely can't be approved by the person who filed it; an asset genuinely surfaces on Home when nobody's accountable for it; every financial event genuinely becomes part of the institution's permanent, narrated History. It composes with People (custodians, approvers are real people), Work's Authority Engine (no parallel permission system), and Home's Attention Engine (no artificial nudges) rather than sitting beside them.

What it is **not** yet: a system a real institution could run its books on. There's no reconciliation, no real ledger, no multi-currency, no vendor management, no receipts actually stored, and expense approval is a single gate rather than the configurable threshold-based workflow real institutions will eventually want. Those are named, honest gaps (§3), not hidden ones — and every one of them has a seam already built (Policy extension points, `DocumentRef`, `acquiredViaExpenseId`) so Phase 2 extends this foundation rather than replacing it.

M7 is ready to build on. It is not ready to be mistaken for a finished Finance module.
