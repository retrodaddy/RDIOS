import "server-only";
import { db, DbError } from "@/lib/db/client";
import type { FinanceProvider } from "./provider";
import type { Asset, DocumentRef, Expense, FinanceTransaction, FinancialAccount, Income } from "./types";

type AccountRow = {
  id: string;
  institution_id: string;
  name: string;
  kind: FinancialAccount["kind"];
  description: string | null;
  created_by_person_id: string;
  created_at: string;
  archived_at: string | null;
};

function toAccount(row: AccountRow): FinancialAccount {
  return {
    id: row.id,
    institutionId: row.institution_id,
    name: row.name,
    kind: row.kind,
    description: row.description,
    createdByPersonId: row.created_by_person_id,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
  };
}

type TransactionRow = {
  id: string;
  institution_id: string;
  kind: "expense" | "income";
  title: string;
  description: string | null;
  amount: number;
  date: string;
  payment_method: FinanceTransaction["paymentMethod"];
  account_id: string | null;
  document_refs: DocumentRef[];
  status: FinanceTransaction["status"];
  created_by_person_id: string;
  created_at: string;
  project_id: string | null;
  category: string | null;
  payee: string | null;
  approval_status: Expense["approvalStatus"] | null;
  decided_by_person_id: string | null;
  decided_at: string | null;
  source: Income["source"] | null;
  payer: string | null;
};

function toTransaction(row: TransactionRow): FinanceTransaction {
  const base = {
    id: row.id,
    institutionId: row.institution_id,
    title: row.title,
    description: row.description,
    amount: Number(row.amount),
    date: row.date,
    paymentMethod: row.payment_method,
    accountId: row.account_id,
    documentRefs: row.document_refs,
    status: row.status,
    createdByPersonId: row.created_by_person_id,
    createdAt: row.created_at,
    projectId: row.project_id,
  };
  if (row.kind === "expense") {
    return {
      ...base,
      kind: "expense",
      category: row.category ?? "",
      payee: row.payee,
      approvalStatus: row.approval_status ?? "pending",
      decidedByPersonId: row.decided_by_person_id,
      decidedAt: row.decided_at,
    };
  }
  return {
    ...base,
    kind: "income",
    source: row.source as Income["source"],
    payer: row.payer,
  };
}

type AssetRow = {
  id: string;
  institution_id: string;
  name: string;
  category: string;
  description: string | null;
  purchase_date: string | null;
  purchase_value: number | null;
  status: Asset["status"];
  custodian_person_id: string | null;
  location: string | null;
  warranty_expires_at: string | null;
  service_notes: string | null;
  document_refs: DocumentRef[];
  acquired_via_expense_id: string | null;
  created_by_person_id: string;
  created_at: string;
  project_id: string | null;
};

function toAsset(row: AssetRow): Asset {
  return {
    id: row.id,
    institutionId: row.institution_id,
    name: row.name,
    category: row.category,
    description: row.description,
    purchaseDate: row.purchase_date,
    purchaseValue: row.purchase_value !== null ? Number(row.purchase_value) : null,
    status: row.status,
    custodianPersonId: row.custodian_person_id,
    location: row.location,
    warrantyExpiresAt: row.warranty_expires_at,
    serviceNotes: row.service_notes,
    documentRefs: row.document_refs,
    acquiredViaExpenseId: row.acquired_via_expense_id,
    createdByPersonId: row.created_by_person_id,
    createdAt: row.created_at,
    projectId: row.project_id,
  };
}

export const supabaseFinanceProvider: FinanceProvider = {
  async listAccounts(institutionId) {
    const { data, error } = await db()
      .from("financial_accounts")
      .select("*")
      .eq("institution_id", institutionId)
      .order("name", { ascending: true });
    if (error) throw new DbError("listAccounts failed", error);
    return (data as AccountRow[]).map(toAccount);
  },

  async createAccount({ institutionId, name, kind, description, createdByPersonId }) {
    const { data, error } = await db()
      .from("financial_accounts")
      .insert({
        institution_id: institutionId,
        name: name.trim(),
        kind,
        description: description?.trim() || null,
        created_by_person_id: createdByPersonId,
      })
      .select()
      .single();
    if (error) throw new DbError("createAccount failed", error);
    return toAccount(data as AccountRow);
  },

  async archiveAccount(accountId) {
    const { data, error } = await db()
      .from("financial_accounts")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", accountId)
      .select()
      .maybeSingle();
    if (error) throw new DbError("archiveAccount failed", error);
    return data ? toAccount(data as AccountRow) : null;
  },

  async listTransactions(institutionId) {
    const { data, error } = await db()
      .from("finance_transactions")
      .select("*")
      .eq("institution_id", institutionId)
      .order("date", { ascending: false });
    if (error) throw new DbError("listTransactions failed", error);
    return (data as TransactionRow[]).map(toTransaction);
  },

  async getTransaction(id) {
    const { data, error } = await db().from("finance_transactions").select("*").eq("id", id).maybeSingle();
    if (error) throw new DbError("getTransaction failed", error);
    return data ? toTransaction(data as TransactionRow) : null;
  },

  async createExpense({ institutionId, title, description, amount, date, category, paymentMethod, payee, accountId, createdByPersonId, projectId }) {
    const { data, error } = await db()
      .from("finance_transactions")
      .insert({
        institution_id: institutionId,
        kind: "expense",
        title: title.trim(),
        description: description?.trim() || null,
        amount,
        date,
        category: category.trim(),
        payment_method: paymentMethod,
        payee: payee?.trim() || null,
        account_id: accountId,
        document_refs: [],
        status: "recorded",
        approval_status: "pending",
        decided_by_person_id: null,
        decided_at: null,
        created_by_person_id: createdByPersonId,
        project_id: projectId,
      })
      .select()
      .single();
    if (error) throw new DbError("createExpense failed", error);
    return toTransaction(data as TransactionRow) as Expense;
  },

  async decideExpense(expenseId, decidedByPersonId, decision) {
    const { data: existing, error: fetchError } = await db().from("finance_transactions").select("*").eq("id", expenseId).maybeSingle();
    if (fetchError) throw new DbError("decideExpense fetch failed", fetchError);
    if (!existing || existing.kind !== "expense" || existing.approval_status !== "pending") return null;

    // Guard re-checked in the UPDATE itself, not just the SELECT above —
    // a concurrent decision finds 0 matching rows and returns null instead
    // of racing to overwrite the first decision.
    const { data, error } = await db()
      .from("finance_transactions")
      .update({ approval_status: decision, decided_by_person_id: decidedByPersonId, decided_at: new Date().toISOString() })
      .eq("id", expenseId)
      .eq("approval_status", "pending")
      .select()
      .maybeSingle();
    if (error) throw new DbError("decideExpense failed", error);
    return data ? (toTransaction(data as TransactionRow) as Expense) : null;
  },

  async createIncome({ institutionId, title, description, amount, date, source, paymentMethod, payer, accountId, createdByPersonId, projectId }) {
    const { data, error } = await db()
      .from("finance_transactions")
      .insert({
        institution_id: institutionId,
        kind: "income",
        title: title.trim(),
        description: description?.trim() || null,
        amount,
        date,
        source,
        payment_method: paymentMethod,
        payer: payer?.trim() || null,
        account_id: accountId,
        document_refs: [],
        status: "recorded",
        created_by_person_id: createdByPersonId,
        project_id: projectId,
      })
      .select()
      .single();
    if (error) throw new DbError("createIncome failed", error);
    return toTransaction(data as TransactionRow) as Income;
  },

  async archiveTransaction(id) {
    const { data, error } = await db().from("finance_transactions").update({ status: "archived" }).eq("id", id).select().maybeSingle();
    if (error) throw new DbError("archiveTransaction failed", error);
    return data ? toTransaction(data as TransactionRow) : null;
  },

  async addTransactionDocumentRef(id, label) {
    if (!label.trim()) return null;
    const { data, error } = await db().rpc("finance_transactions_add_document_ref", { p_id: id, p_label: label.trim() });
    if (error) throw new DbError("addTransactionDocumentRef failed", error);
    if (!data) return null;
    const documentRefs = (data as TransactionRow).document_refs;
    return documentRefs[documentRefs.length - 1] ?? null;
  },

  async setTransactionProject(id, projectId) {
    const { data, error } = await db().from("finance_transactions").update({ project_id: projectId }).eq("id", id).select().maybeSingle();
    if (error) throw new DbError("setTransactionProject failed", error);
    return data ? toTransaction(data as TransactionRow) : null;
  },

  async listAssets(institutionId) {
    const { data, error } = await db()
      .from("assets")
      .select("*")
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: false });
    if (error) throw new DbError("listAssets failed", error);
    return (data as AssetRow[]).map(toAsset);
  },

  async getAsset(id) {
    const { data, error } = await db().from("assets").select("*").eq("id", id).maybeSingle();
    if (error) throw new DbError("getAsset failed", error);
    return data ? toAsset(data as AssetRow) : null;
  },

  async createAsset({
    institutionId,
    name,
    category,
    description,
    purchaseDate,
    purchaseValue,
    custodianPersonId,
    location,
    warrantyExpiresAt,
    acquiredViaExpenseId,
    createdByPersonId,
    projectId,
  }) {
    const { data, error } = await db()
      .from("assets")
      .insert({
        institution_id: institutionId,
        name: name.trim(),
        category: category.trim(),
        description: description?.trim() || null,
        purchase_date: purchaseDate,
        purchase_value: purchaseValue,
        status: "in_use",
        custodian_person_id: custodianPersonId,
        location: location?.trim() || null,
        warranty_expires_at: warrantyExpiresAt,
        service_notes: null,
        document_refs: [],
        acquired_via_expense_id: acquiredViaExpenseId,
        created_by_person_id: createdByPersonId,
        project_id: projectId,
      })
      .select()
      .single();
    if (error) throw new DbError("createAsset failed", error);
    return toAsset(data as AssetRow);
  },

  async transferCustodian(assetId, custodianPersonId) {
    const { data, error } = await db().from("assets").update({ custodian_person_id: custodianPersonId }).eq("id", assetId).select().maybeSingle();
    if (error) throw new DbError("transferCustodian failed", error);
    return data ? toAsset(data as AssetRow) : null;
  },

  async setAssetStatus(assetId, status) {
    const { data, error } = await db().from("assets").update({ status }).eq("id", assetId).select().maybeSingle();
    if (error) throw new DbError("setAssetStatus failed", error);
    return data ? toAsset(data as AssetRow) : null;
  },

  async setAssetServiceNotes(assetId, serviceNotes) {
    const { data, error } = await db()
      .from("assets")
      .update({ service_notes: serviceNotes.trim() || null })
      .eq("id", assetId)
      .select()
      .maybeSingle();
    if (error) throw new DbError("setAssetServiceNotes failed", error);
    return data ? toAsset(data as AssetRow) : null;
  },

  async addAssetDocumentRef(assetId, label) {
    if (!label.trim()) return null;
    const { data, error } = await db().rpc("assets_add_document_ref", { p_id: assetId, p_label: label.trim() });
    if (error) throw new DbError("addAssetDocumentRef failed", error);
    if (!data) return null;
    const documentRefs = (data as AssetRow).document_refs;
    return documentRefs[documentRefs.length - 1] ?? null;
  },

  async setAssetProject(assetId, projectId) {
    const { data, error } = await db().from("assets").update({ project_id: projectId }).eq("id", assetId).select().maybeSingle();
    if (error) throw new DbError("setAssetProject failed", error);
    return data ? toAsset(data as AssetRow) : null;
  },
};
