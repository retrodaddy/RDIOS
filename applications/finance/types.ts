/**
 * Finance & Assets — M7, the first Institution Application built on top of
 * the frozen platform rather than proving a platform mechanism. Per the
 * founder's own framing, this is institutional memory for everything that
 * has financial value — not an accounting module bolted on beside People
 * and Work, but composed with them the same way Work composed with
 * Identity and Authority.
 *
 * Expense and Income converge on one shared shape, `FinanceTransactionBase`,
 * the same discriminated-union discipline `applications/work/types.ts`
 * already used for Task | Approval. This is deliberate, not incidental: any
 * future financial entity (a transfer, a reimbursement) extends the same
 * spine instead of inventing a parallel one — "money is memory," one
 * memory, not several disconnected logs that happen to both hold amounts.
 *
 * Assets are not transactions — they're things the institution owns, not
 * money moving — so `Asset` stays its own shape. `acquiredViaExpenseId` is
 * the one deliberate seam between the two: an asset MAY name the expense
 * that bought it, composing Parts 2 and 4 instead of leaving them as two
 * unrelated feature lists.
 */
import type { PermissionKey } from "@/engines/authority/types";

export const ACCOUNT_KINDS = ["cash", "bank", "income", "expense", "asset", "liability", "equity"] as const;
export type AccountKind = (typeof ACCOUNT_KINDS)[number];

/** Institution-neutral on purpose — every institution type (company,
 *  temple, hospital, school, NGO) has cash, a bank account, and an
 *  institution fund, even if what they call the fund differs. No
 *  company-accounting assumptions (no "accounts receivable," no "COGS")
 *  are baked in here. */
export const ACCOUNT_KIND_LABELS: Record<AccountKind, string> = {
  cash: "Cash",
  bank: "Bank Account",
  income: "Income",
  expense: "Expense",
  asset: "Asset",
  liability: "Liability",
  equity: "Equity / Institution Fund",
};

/** A single bucket in the institution's financial structure (Part 1) — a
 *  specific cash box, a specific bank account, or one of the broader
 *  categories (Income/Expense/Asset/Liability/Equity) an entry can belong
 *  to. Deliberately not a double-entry ledger with computed balances —
 *  the smallest structure that lets an Expense or Income record say
 *  *which* cash or bank account the money actually moved through. */
export type FinancialAccount = {
  id: string;
  institutionId: string;
  name: string;
  kind: AccountKind;
  description: string | null;
  createdByPersonId: string;
  createdAt: string;
  archivedAt: string | null;
};

export const PAYMENT_METHODS = ["cash", "bank_transfer", "cheque", "card", "upi", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
  card: "Card",
  upi: "UPI",
  other: "Other",
};

/** The founder's own explicit list (Part 3) — the one place in this
 *  domain a fixed enum is honest rather than a hidden assumption, since
 *  these were named directly rather than invented here. */
export const INCOME_SOURCES = ["donation", "sales", "grant", "membership_fee", "service_income", "rental", "other"] as const;
export type IncomeSource = (typeof INCOME_SOURCES)[number];
export const INCOME_SOURCE_LABELS: Record<IncomeSource, string> = {
  donation: "Donation",
  sales: "Sales",
  grant: "Grant",
  membership_fee: "Membership Fee",
  service_income: "Service Income",
  rental: "Rental",
  other: "Other",
};

/** A placeholder reference to a future institutional document (Part 9) —
 *  a label a person types now, not a real upload. The real Documents
 *  application replaces this with genuine attachments later; nothing here
 *  should need to change shape when it does, since this already models
 *  "a named reference," just without a `documents` table backing it yet. */
export type DocumentRef = { id: string; label: string; addedAt: string };

export const TRANSACTION_STATUSES = ["recorded", "archived"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type TransactionApprovalStatus = (typeof APPROVAL_STATUSES)[number];

type FinanceTransactionBase = {
  id: string;
  institutionId: string;
  title: string;
  description: string | null;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  /** Which Financial Account the money actually moved through — nullable
   *  since an institution may not have set up accounts yet; strongly
   *  encouraged, never required, so Parts 2/3 are never blocked on Part 1
   *  being finished first. */
  accountId: string | null;
  documentRefs: DocumentRef[];
  status: TransactionStatus;
  createdByPersonId: string;
  createdAt: string;
};

/** Category is deliberately free text, not a fixed enum — unlike Income's
 *  sources (given explicitly by the founder), no expense category list
 *  was named, and a hardcoded list here would be exactly the "company
 *  accounting assumption" Part 1 says not to bake in. A temple's
 *  categories (Puja Items, Prasadam) and a hospital's (Medical Supplies,
 *  Equipment Maintenance) shouldn't have to fit one shared enum. */
export type Expense = FinanceTransactionBase & {
  kind: "expense";
  category: string;
  /** Vendor or payee — who the institution paid. */
  payee: string | null;
  approvalStatus: TransactionApprovalStatus;
  decidedByPersonId: string | null;
  decidedAt: string | null;
};

/** Income deliberately has no approval workflow — recording a donation or
 *  a grant documents something that already happened; it doesn't need
 *  someone's permission to have happened. Would this still make sense for
 *  a temple recording a devotee's donation? Yes — nobody needs to approve
 *  a gift already received. */
export type Income = FinanceTransactionBase & {
  kind: "income";
  source: IncomeSource;
  /** Donor, customer, or funder — who the money came from. */
  payer: string | null;
};

export type FinanceTransaction = Expense | Income;

export const ASSET_STATUSES = ["in_use", "in_storage", "under_repair", "retired"] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  in_use: "In Use",
  in_storage: "In Storage",
  under_repair: "Under Repair",
  retired: "Retired",
};

/** The Asset Registry (Part 4) — every institution owns things, from a
 *  temple's ritual vessels to a hospital's imaging equipment to a
 *  school's furniture. No depreciation, no maintenance scheduling — only
 *  the registry itself, per the founder's explicit scope line. */
export type Asset = {
  id: string;
  institutionId: string;
  name: string;
  /** Free text, same reasoning as Expense.category — an institution's
   *  asset categories aren't one universal list. */
  category: string;
  description: string | null;
  purchaseDate: string | null;
  purchaseValue: number | null;
  status: AssetStatus;
  custodianPersonId: string | null;
  location: string | null;
  warrantyExpiresAt: string | null;
  serviceNotes: string | null;
  documentRefs: DocumentRef[];
  /** The expense that paid for this asset, if any — the one deliberate
   *  seam between the Asset Registry and the transaction spine. */
  acquiredViaExpenseId: string | null;
  createdByPersonId: string;
  createdAt: string;
};

/** The Areas of Responsibility Finance introduces (Part 7) — noun-based,
 *  never permission-per-button, exactly the founder's own examples:
 *  Finance, Treasury, Assets. Re-exported here for convenience; the
 *  catalog itself lives in engines/authority/types.ts alongside every
 *  other Area. */
export type FinanceAreaKey = Extract<PermissionKey, "finance.manage" | "treasury.approve" | "assets.manage">;
