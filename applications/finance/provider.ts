import "server-only";
import type {
  Asset,
  AssetStatus,
  DocumentRef,
  Expense,
  FinanceTransaction,
  FinancialAccount,
  Income,
  IncomeSource,
  PaymentMethod,
} from "./types";

/** The swappable contract Finance is built behind — the same discipline as
 *  every prior application's provider. Backed today by an in-memory mock;
 *  a real provider implements this exact interface later. */
export interface FinanceProvider {
  listAccounts(institutionId: string): Promise<FinancialAccount[]>;
  createAccount(input: {
    institutionId: string;
    name: string;
    kind: FinancialAccount["kind"];
    description: string | null;
    createdByPersonId: string;
  }): Promise<FinancialAccount>;
  archiveAccount(accountId: string): Promise<FinancialAccount | null>;

  listTransactions(institutionId: string): Promise<FinanceTransaction[]>;
  getTransaction(id: string): Promise<FinanceTransaction | null>;

  createExpense(input: {
    institutionId: string;
    title: string;
    description: string | null;
    amount: number;
    date: string;
    category: string;
    paymentMethod: PaymentMethod;
    payee: string | null;
    accountId: string | null;
    createdByPersonId: string;
    projectId: string | null;
  }): Promise<Expense>;
  /** Records a decision on an Expense's single approval gate. Part 8's
   *  policy extension point (applications/finance/policy.ts) decides
   *  *who* must decide; this only ever records the outcome. */
  decideExpense(expenseId: string, decidedByPersonId: string, decision: "approved" | "rejected"): Promise<Expense | null>;

  createIncome(input: {
    institutionId: string;
    title: string;
    description: string | null;
    amount: number;
    date: string;
    source: IncomeSource;
    paymentMethod: PaymentMethod;
    payer: string | null;
    accountId: string | null;
    createdByPersonId: string;
    projectId: string | null;
  }): Promise<Income>;

  archiveTransaction(id: string): Promise<FinanceTransaction | null>;
  addTransactionDocumentRef(id: string, label: string): Promise<DocumentRef | null>;
  setTransactionProject(id: string, projectId: string | null): Promise<FinanceTransaction | null>;

  listAssets(institutionId: string): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | null>;
  createAsset(input: {
    institutionId: string;
    name: string;
    category: string;
    description: string | null;
    purchaseDate: string | null;
    purchaseValue: number | null;
    custodianPersonId: string | null;
    location: string | null;
    warrantyExpiresAt: string | null;
    acquiredViaExpenseId: string | null;
    createdByPersonId: string;
    projectId: string | null;
  }): Promise<Asset>;
  transferCustodian(assetId: string, custodianPersonId: string | null): Promise<Asset | null>;
  setAssetStatus(assetId: string, status: AssetStatus): Promise<Asset | null>;
  setAssetServiceNotes(assetId: string, serviceNotes: string): Promise<Asset | null>;
  addAssetDocumentRef(assetId: string, label: string): Promise<DocumentRef | null>;
  setAssetProject(assetId: string, projectId: string | null): Promise<Asset | null>;
}
