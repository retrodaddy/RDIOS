"use server";

import { getIdentityContext } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { recordHistory, listHistoryForSubject } from "@/os/attention/history-store";
import type { HistoryEntry } from "@/os/attention/types";
import { PERMISSION_LABELS } from "@/engines/authority/types";
import { personCanSatisfyArea } from "@/engines/authority/resolver";
import { mockFinanceProvider } from "./mock-provider";
import { resolveExpenseApprovalArea } from "./policy";
import { ACCOUNT_KINDS, INCOME_SOURCES, PAYMENT_METHODS, type AccountKind, type IncomeSource, type PaymentMethod } from "./types";

export type ActionResult = { ok: boolean; error?: string };

const TRANSACTION_SUBJECT_TYPE = "finance.transaction";
const ASSET_SUBJECT_TYPE = "finance.asset";

function notResponsible(what: string): ActionResult {
  return { ok: false, error: `${what} isn't your responsibility here.` };
}

function parseAmount(raw: FormDataEntryValue | null): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

async function getOwnedAccount(accountId: string | null, institutionId: string) {
  if (!accountId) return null;
  const accounts = await mockFinanceProvider.listAccounts(institutionId);
  return accounts.find((a) => a.id === accountId) ?? null;
}

export async function createAccountAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("finance.manage")) return notResponsible("Managing financial accounts");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const kind = String(formData.get("kind") ?? "");
  if (!(ACCOUNT_KINDS as readonly string[]).includes(kind)) return { ok: false, error: "Choose a valid account type." };
  const description = String(formData.get("description") ?? "").trim() || null;

  const account = await mockFinanceProvider.createAccount({
    institutionId: ctx.institution.id,
    name,
    kind: kind as AccountKind,
    description,
    createdByPersonId: ctx.person.id,
  });
  recordHistory(ctx.institution.id, `${ctx.person.name} added the "${account.name}" account.`);
  return { ok: true };
}

export async function archiveAccountAction(accountId: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("finance.manage")) return notResponsible("Managing financial accounts");

  const account = await getOwnedAccount(accountId, ctx.institution.id);
  if (!account) return { ok: false, error: "Account not found." };

  await mockFinanceProvider.archiveAccount(accountId);
  recordHistory(ctx.institution.id, `${ctx.person.name} archived the "${account.name}" account.`);
  return { ok: true };
}

export async function createExpenseAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("finance.manage")) return notResponsible("Recording expenses");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required." };
  const amount = parseAmount(formData.get("amount"));
  if (amount === null) return { ok: false, error: "Enter a valid amount greater than zero." };
  const date = String(formData.get("date") ?? "").trim();
  if (!date) return { ok: false, error: "Date is required." };
  const category = String(formData.get("category") ?? "").trim();
  if (!category) return { ok: false, error: "Category is required." };
  const paymentMethod = String(formData.get("paymentMethod") ?? "");
  if (!(PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) return { ok: false, error: "Choose a valid payment method." };
  const description = String(formData.get("description") ?? "").trim() || null;
  const payee = String(formData.get("payee") ?? "").trim() || null;
  const accountId = String(formData.get("accountId") ?? "").trim() || null;
  const projectId = String(formData.get("projectId") ?? "").trim() || null;

  if (accountId && !(await getOwnedAccount(accountId, ctx.institution.id))) {
    return { ok: false, error: "That account doesn't belong to this institution." };
  }

  const expense = await mockFinanceProvider.createExpense({
    institutionId: ctx.institution.id,
    title,
    description,
    amount,
    date,
    category,
    paymentMethod: paymentMethod as PaymentMethod,
    payee,
    accountId,
    createdByPersonId: ctx.person.id,
    projectId,
  });
  recordHistory(
    ctx.institution.id,
    `${ctx.person.name} recorded an expense — "${expense.title}" (₹${expense.amount.toLocaleString("en-IN")}).`,
    { subjectType: TRANSACTION_SUBJECT_TYPE, subjectId: expense.id }
  );
  return { ok: true };
}

/** Whether the signed-in person can currently decide this expense — the
 *  founder always can (the bootstrap rule every Area follows), otherwise
 *  only whoever the Policy seam (resolveExpenseApprovalArea) currently
 *  names, resolved the same way Work resolves an Approval step. */
async function canDecideExpense(ctx: NonNullable<Awaited<ReturnType<typeof getIdentityContext>>>, expense: { amount: number; category: string }): Promise<boolean> {
  const area = resolveExpenseApprovalArea(expense);
  return personCanSatisfyArea(ctx.institution, ctx.person, area);
}

export async function decideExpenseAction(expenseId: string, decision: "approved" | "rejected"): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const item = await mockFinanceProvider.getTransaction(expenseId);
  if (!item || item.kind !== "expense" || item.institutionId !== ctx.institution.id) return { ok: false, error: "Expense not found." };
  if (item.approvalStatus !== "pending") return { ok: false, error: "This expense is already decided." };

  // Same-actor exclusion (Governance & Responsibility Model v1 §6) — the
  // same permanent rule Work's Approval already enforces: whoever recorded
  // an expense may never also be the one who approves it, regardless of
  // which Areas they personally hold.
  if (item.createdByPersonId === ctx.person.id) {
    return { ok: false, error: "You recorded this expense — you can't also decide it." };
  }

  const area = resolveExpenseApprovalArea(item);
  const canDecide = await canDecideExpense(ctx, item);
  if (!canDecide) return notResponsible(`Deciding the ${PERMISSION_LABELS[area]} step`);

  const result = await mockFinanceProvider.decideExpense(expenseId, ctx.person.id, decision);
  if (!result) return { ok: false, error: "Could not record this decision." };

  recordHistory(
    ctx.institution.id,
    decision === "approved"
      ? `${ctx.person.name} approved the expense "${item.title}".`
      : `${ctx.person.name} rejected the expense "${item.title}".`,
    { subjectType: TRANSACTION_SUBJECT_TYPE, subjectId: expenseId }
  );
  return { ok: true };
}

export async function createIncomeAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("finance.manage")) return notResponsible("Recording income");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required." };
  const amount = parseAmount(formData.get("amount"));
  if (amount === null) return { ok: false, error: "Enter a valid amount greater than zero." };
  const date = String(formData.get("date") ?? "").trim();
  if (!date) return { ok: false, error: "Date is required." };
  const source = String(formData.get("source") ?? "");
  if (!(INCOME_SOURCES as readonly string[]).includes(source)) return { ok: false, error: "Choose a valid source." };
  const paymentMethod = String(formData.get("paymentMethod") ?? "");
  if (!(PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) return { ok: false, error: "Choose a valid payment method." };
  const description = String(formData.get("description") ?? "").trim() || null;
  const payer = String(formData.get("payer") ?? "").trim() || null;
  const accountId = String(formData.get("accountId") ?? "").trim() || null;
  const projectId = String(formData.get("projectId") ?? "").trim() || null;

  if (accountId && !(await getOwnedAccount(accountId, ctx.institution.id))) {
    return { ok: false, error: "That account doesn't belong to this institution." };
  }

  const income = await mockFinanceProvider.createIncome({
    institutionId: ctx.institution.id,
    title,
    description,
    amount,
    date,
    source: source as IncomeSource,
    paymentMethod: paymentMethod as PaymentMethod,
    payer,
    accountId,
    createdByPersonId: ctx.person.id,
    projectId,
  });
  recordHistory(
    ctx.institution.id,
    `${ctx.person.name} recorded income — "${income.title}" (₹${income.amount.toLocaleString("en-IN")}).`,
    { subjectType: TRANSACTION_SUBJECT_TYPE, subjectId: income.id }
  );
  return { ok: true };
}

export async function archiveTransactionAction(id: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("finance.manage")) return notResponsible("Managing financial records");

  const item = await mockFinanceProvider.getTransaction(id);
  if (!item || item.institutionId !== ctx.institution.id) return { ok: false, error: "Not found." };

  await mockFinanceProvider.archiveTransaction(id);
  recordHistory(ctx.institution.id, `${ctx.person.name} archived "${item.title}".`, {
    subjectType: TRANSACTION_SUBJECT_TYPE,
    subjectId: id,
  });
  return { ok: true };
}

export async function addTransactionDocumentRefAction(id: string, label: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!label.trim()) return { ok: false, error: "Enter a document reference." };

  const item = await mockFinanceProvider.getTransaction(id);
  if (!item || item.institutionId !== ctx.institution.id) return { ok: false, error: "Not found." };
  if (!ctx.permissions.has("finance.manage")) return notResponsible("Attaching documents");

  await mockFinanceProvider.addTransactionDocumentRef(id, label);
  return { ok: true };
}

/** Attaches or detaches a Transaction to/from a Project — the thin seam
 *  Finance exposes for M9's convergence, never a duplicate of Finance's
 *  own record-keeping. */
export async function setTransactionProjectAction(id: string, projectId: string | null): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("finance.manage")) return notResponsible("Managing financial records");

  const item = await mockFinanceProvider.getTransaction(id);
  if (!item || item.institutionId !== ctx.institution.id) return { ok: false, error: "Not found." };

  await mockFinanceProvider.setTransactionProject(id, projectId);
  recordHistory(
    ctx.institution.id,
    projectId ? `${ctx.person.name} linked "${item.title}" to a project.` : `${ctx.person.name} unlinked "${item.title}" from its project.`,
    { subjectType: TRANSACTION_SUBJECT_TYPE, subjectId: id }
  );
  return { ok: true };
}

/** A Transaction's own Timeline — the same filtered-History read pattern
 *  Community, Work, and People's Positions all now use. */
export async function getTransactionHistoryAction(id: string): Promise<HistoryEntry[]> {
  const ctx = await getIdentityContext();
  if (!ctx) return [];
  const item = await mockFinanceProvider.getTransaction(id);
  if (!item || item.institutionId !== ctx.institution.id) return [];
  return listHistoryForSubject(ctx.institution.id, TRANSACTION_SUBJECT_TYPE, id);
}

export async function createAssetAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("assets.manage")) return notResponsible("Registering assets");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const category = String(formData.get("category") ?? "").trim();
  if (!category) return { ok: false, error: "Category is required." };
  const description = String(formData.get("description") ?? "").trim() || null;
  const purchaseDate = String(formData.get("purchaseDate") ?? "").trim() || null;
  const purchaseValueRaw = String(formData.get("purchaseValue") ?? "").trim();
  const purchaseValue = purchaseValueRaw ? parseAmount(purchaseValueRaw) : null;
  if (purchaseValueRaw && purchaseValue === null) return { ok: false, error: "Enter a valid purchase value." };
  const custodianPersonId = String(formData.get("custodianPersonId") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const warrantyExpiresAt = String(formData.get("warrantyExpiresAt") ?? "").trim() || null;
  const acquiredViaExpenseId = String(formData.get("acquiredViaExpenseId") ?? "").trim() || null;
  const projectId = String(formData.get("projectId") ?? "").trim() || null;

  if (acquiredViaExpenseId) {
    const linked = await mockFinanceProvider.getTransaction(acquiredViaExpenseId);
    if (!linked || linked.kind !== "expense" || linked.institutionId !== ctx.institution.id) {
      return { ok: false, error: "That expense doesn't belong to this institution." };
    }
  }

  const asset = await mockFinanceProvider.createAsset({
    institutionId: ctx.institution.id,
    name,
    category,
    description,
    purchaseDate,
    purchaseValue,
    custodianPersonId,
    location,
    warrantyExpiresAt,
    acquiredViaExpenseId,
    createdByPersonId: ctx.person.id,
    projectId,
  });
  recordHistory(ctx.institution.id, `${ctx.person.name} registered the asset "${asset.name}".`, {
    subjectType: ASSET_SUBJECT_TYPE,
    subjectId: asset.id,
  });
  return { ok: true };
}

export async function transferCustodianAction(assetId: string, custodianPersonId: string | null): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("assets.manage")) return notResponsible("Managing assets");

  const asset = await mockFinanceProvider.getAsset(assetId);
  if (!asset || asset.institutionId !== ctx.institution.id) return { ok: false, error: "Asset not found." };

  await mockFinanceProvider.transferCustodian(assetId, custodianPersonId);
  const name = custodianPersonId ? (await mockIdentityProvider.getPerson(custodianPersonId))?.name ?? "Someone" : null;
  recordHistory(
    ctx.institution.id,
    name
      ? `${ctx.person.name} made ${name} the custodian of "${asset.name}".`
      : `${ctx.person.name} removed the custodian from "${asset.name}".`,
    { subjectType: ASSET_SUBJECT_TYPE, subjectId: assetId }
  );
  return { ok: true };
}

export async function setAssetStatusAction(assetId: string, status: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("assets.manage")) return notResponsible("Managing assets");

  const asset = await mockFinanceProvider.getAsset(assetId);
  if (!asset || asset.institutionId !== ctx.institution.id) return { ok: false, error: "Asset not found." };

  await mockFinanceProvider.setAssetStatus(assetId, status as Parameters<typeof mockFinanceProvider.setAssetStatus>[1]);
  recordHistory(ctx.institution.id, `${ctx.person.name} updated "${asset.name}" to ${status.replace("_", " ")}.`, {
    subjectType: ASSET_SUBJECT_TYPE,
    subjectId: assetId,
  });
  return { ok: true };
}

export async function setAssetServiceNotesAction(assetId: string, serviceNotes: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("assets.manage")) return notResponsible("Managing assets");

  const asset = await mockFinanceProvider.getAsset(assetId);
  if (!asset || asset.institutionId !== ctx.institution.id) return { ok: false, error: "Asset not found." };

  await mockFinanceProvider.setAssetServiceNotes(assetId, serviceNotes);
  recordHistory(ctx.institution.id, `${ctx.person.name} updated "${asset.name}"'s service notes.`, {
    subjectType: ASSET_SUBJECT_TYPE,
    subjectId: assetId,
  });
  return { ok: true };
}

export async function addAssetDocumentRefAction(assetId: string, label: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!label.trim()) return { ok: false, error: "Enter a document reference." };

  const asset = await mockFinanceProvider.getAsset(assetId);
  if (!asset || asset.institutionId !== ctx.institution.id) return { ok: false, error: "Asset not found." };
  if (!ctx.permissions.has("assets.manage")) return notResponsible("Attaching documents");

  await mockFinanceProvider.addAssetDocumentRef(assetId, label);
  return { ok: true };
}

/** Attaches or detaches an Asset to/from a Project — the same thin seam
 *  Transactions expose. */
export async function setAssetProjectAction(assetId: string, projectId: string | null): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("assets.manage")) return notResponsible("Managing assets");

  const asset = await mockFinanceProvider.getAsset(assetId);
  if (!asset || asset.institutionId !== ctx.institution.id) return { ok: false, error: "Asset not found." };

  await mockFinanceProvider.setAssetProject(assetId, projectId);
  recordHistory(
    ctx.institution.id,
    projectId ? `${ctx.person.name} linked "${asset.name}" to a project.` : `${ctx.person.name} unlinked "${asset.name}" from its project.`,
    { subjectType: ASSET_SUBJECT_TYPE, subjectId: assetId }
  );
  return { ok: true };
}

/** An Asset's own Timeline — the same filtered-History read pattern every
 *  other Record type now uses. */
export async function getAssetHistoryAction(assetId: string): Promise<HistoryEntry[]> {
  const ctx = await getIdentityContext();
  if (!ctx) return [];
  const asset = await mockFinanceProvider.getAsset(assetId);
  if (!asset || asset.institutionId !== ctx.institution.id) return [];
  return listHistoryForSubject(ctx.institution.id, ASSET_SUBJECT_TYPE, assetId);
}
