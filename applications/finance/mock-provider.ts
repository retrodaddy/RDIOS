import "server-only";
import { randomUUID } from "crypto";
import type { FinanceProvider } from "./provider";
import type { Asset, DocumentRef, Expense, FinanceTransaction, FinancialAccount } from "./types";

/** In-memory, dev-only — same `globalThis` singleton guard as every other
 *  mock provider this engagement. */
type Store = {
  accounts: Map<string, FinancialAccount>;
  transactions: Map<string, FinanceTransaction>;
  assets: Map<string, Asset>;
};

const g = globalThis as unknown as { __rdiosFinanceStore?: Store };

function store(): Store {
  if (!g.__rdiosFinanceStore) {
    g.__rdiosFinanceStore = { accounts: new Map(), transactions: new Map(), assets: new Map() };
  }
  return g.__rdiosFinanceStore;
}

function newDocumentRef(label: string): DocumentRef {
  return { id: randomUUID(), label: label.trim(), addedAt: new Date().toISOString() };
}

export const mockFinanceProvider: FinanceProvider = {
  async listAccounts(institutionId) {
    return [...store().accounts.values()]
      .filter((a) => a.institutionId === institutionId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async createAccount({ institutionId, name, kind, description, createdByPersonId }) {
    const account: FinancialAccount = {
      id: randomUUID(),
      institutionId,
      name: name.trim(),
      kind,
      description: description?.trim() || null,
      createdByPersonId,
      createdAt: new Date().toISOString(),
      archivedAt: null,
    };
    store().accounts.set(account.id, account);
    return account;
  },

  async archiveAccount(accountId) {
    const account = store().accounts.get(accountId);
    if (!account) return null;
    account.archivedAt = new Date().toISOString();
    return account;
  },

  async listTransactions(institutionId) {
    return [...store().transactions.values()]
      .filter((t) => t.institutionId === institutionId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getTransaction(id) {
    return store().transactions.get(id) ?? null;
  },

  async createExpense({ institutionId, title, description, amount, date, category, paymentMethod, payee, accountId, createdByPersonId }) {
    const expense: Expense = {
      id: randomUUID(),
      kind: "expense",
      institutionId,
      title: title.trim(),
      description: description?.trim() || null,
      amount,
      date,
      category: category.trim(),
      paymentMethod,
      payee: payee?.trim() || null,
      accountId,
      documentRefs: [],
      status: "recorded",
      approvalStatus: "pending",
      decidedByPersonId: null,
      decidedAt: null,
      createdByPersonId,
      createdAt: new Date().toISOString(),
    };
    store().transactions.set(expense.id, expense);
    return expense;
  },

  async decideExpense(expenseId, decidedByPersonId, decision) {
    const item = store().transactions.get(expenseId);
    if (!item || item.kind !== "expense" || item.approvalStatus !== "pending") return null;
    item.approvalStatus = decision;
    item.decidedByPersonId = decidedByPersonId;
    item.decidedAt = new Date().toISOString();
    return item;
  },

  async createIncome({ institutionId, title, description, amount, date, source, paymentMethod, payer, accountId, createdByPersonId }) {
    const income = {
      id: randomUUID(),
      kind: "income" as const,
      institutionId,
      title: title.trim(),
      description: description?.trim() || null,
      amount,
      date,
      source,
      paymentMethod,
      payer: payer?.trim() || null,
      accountId,
      documentRefs: [],
      status: "recorded" as const,
      createdByPersonId,
      createdAt: new Date().toISOString(),
    };
    store().transactions.set(income.id, income);
    return income;
  },

  async archiveTransaction(id) {
    const item = store().transactions.get(id);
    if (!item) return null;
    item.status = "archived";
    return item;
  },

  async addTransactionDocumentRef(id, label) {
    const item = store().transactions.get(id);
    if (!item || !label.trim()) return null;
    const ref = newDocumentRef(label);
    item.documentRefs.push(ref);
    return ref;
  },

  async listAssets(institutionId) {
    return [...store().assets.values()]
      .filter((a) => a.institutionId === institutionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAsset(id) {
    return store().assets.get(id) ?? null;
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
  }) {
    const asset: Asset = {
      id: randomUUID(),
      institutionId,
      name: name.trim(),
      category: category.trim(),
      description: description?.trim() || null,
      purchaseDate,
      purchaseValue,
      status: "in_use",
      custodianPersonId,
      location: location?.trim() || null,
      warrantyExpiresAt,
      serviceNotes: null,
      documentRefs: [],
      acquiredViaExpenseId,
      createdByPersonId,
      createdAt: new Date().toISOString(),
    };
    store().assets.set(asset.id, asset);
    return asset;
  },

  async transferCustodian(assetId, custodianPersonId) {
    const asset = store().assets.get(assetId);
    if (!asset) return null;
    asset.custodianPersonId = custodianPersonId;
    return asset;
  },

  async setAssetStatus(assetId, status) {
    const asset = store().assets.get(assetId);
    if (!asset) return null;
    asset.status = status;
    return asset;
  },

  async setAssetServiceNotes(assetId, serviceNotes) {
    const asset = store().assets.get(assetId);
    if (!asset) return null;
    asset.serviceNotes = serviceNotes.trim() || null;
    return asset;
  },

  async addAssetDocumentRef(assetId, label) {
    const asset = store().assets.get(assetId);
    if (!asset || !label.trim()) return null;
    const ref = newDocumentRef(label);
    asset.documentRefs.push(ref);
    return ref;
  },
};
