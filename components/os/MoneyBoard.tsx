"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addAssetDocumentRefAction,
  addTransactionDocumentRefAction,
  archiveAccountAction,
  archiveTransactionAction,
  createAccountAction,
  createAssetAction,
  createExpenseAction,
  createIncomeAction,
  decideExpenseAction,
  getAssetHistoryAction,
  getTransactionHistoryAction,
  setAssetServiceNotesAction,
  setAssetStatusAction,
  transferCustodianAction,
} from "@/applications/finance/actions";
import { resolveExpenseApprovalArea } from "@/applications/finance/policy";
import {
  ACCOUNT_KIND_LABELS,
  ACCOUNT_KINDS,
  ASSET_STATUS_LABELS,
  ASSET_STATUSES,
  INCOME_SOURCE_LABELS,
  INCOME_SOURCES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  type Asset,
  type AssetStatus,
  type Expense,
  type FinanceTransaction,
  type FinancialAccount,
} from "@/applications/finance/types";
import { PERMISSION_LABELS, type PermissionKey } from "@/engines/authority/types";
import { getPermissionLabel } from "@/os/institution/terminology";
import type { InstitutionType } from "@/os/identity/types";
import type { HistoryEntry } from "@/os/attention/types";
import { Badge, Button, DataTable, EmptyState, useToast, type BadgeTone, type DataTableColumn } from "@/components/ui";

export type MoneyRosterPerson = { id: string; name: string; email: string };

type Tab = "transactions" | "accounts" | "assets";

const ASSET_STATUS_TONE: Record<AssetStatus, BadgeTone> = {
  in_use: "accent",
  in_storage: "neutral",
  under_repair: "warning",
  retired: "neutral",
};

function money(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Finance & Assets' board (M7) — three tabs over one shared institution,
 *  mirroring WorkBoard's list-plus-drawer discipline exactly: nothing here
 *  is a separate visual language, just a different domain. Expense and
 *  Income share one table (the transaction spine made visible), Accounts
 *  and Assets get their own. */
export function MoneyBoard({
  institutionType,
  currentPersonId,
  isFounder,
  canManageFinance,
  canApproveTreasury,
  canManageAssets,
  roster,
  initialAccounts,
  initialTransactions,
  initialAssets,
  initialTab,
  initialSelectedId,
}: {
  institutionType: InstitutionType;
  currentPersonId: string;
  isFounder: boolean;
  canManageFinance: boolean;
  canApproveTreasury: boolean;
  canManageAssets: boolean;
  roster: MoneyRosterPerson[];
  initialAccounts: FinancialAccount[];
  initialTransactions: FinanceTransaction[];
  initialAssets: Asset[];
  /** Universal Search's own deep-link (M12) — opens straight to a
   *  specific transaction or asset's existing drawer, never a duplicate
   *  screen. Undefined for every ordinary visit to `/money`. */
  initialTab?: Tab;
  initialSelectedId?: string | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab ?? "transactions");
  const refresh = () => router.refresh();

  // Universal Search (M12) navigates here client-side with a new
  // `?tab=`/`?open=` pair while this board stays mounted — see
  // WorkBoard's identical effect for why a `useState` initializer alone
  // isn't enough for a second search result opened back-to-back.
  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  const areaLabel = (key: PermissionKey) => getPermissionLabel(institutionType, key, PERMISSION_LABELS[key]);
  const personName = (id: string | null) => {
    if (!id) return null;
    if (id === currentPersonId) return "You";
    return roster.find((p) => p.id === id)?.name ?? "Someone";
  };

  const canDecideExpense = (item: Expense) => {
    if (item.createdByPersonId === currentPersonId) return false;
    if (isFounder) return true;
    const area = resolveExpenseApprovalArea(item);
    return area === "treasury.approve" ? canApproveTreasury : false;
  };

  const activeAccounts = initialAccounts.filter((a) => !a.archivedAt);

  const TABS: { key: Tab; label: string }[] = [
    { key: "transactions", label: "Expenses & Income" },
    { key: "accounts", label: "Accounts" },
    { key: "assets", label: "Assets" },
  ];

  return (
    <div className="mt-8">
      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-1 pb-3 text-sm transition-colors duration-fast ease-os-out ${
              tab === t.key ? "border-accent text-text" : "border-transparent text-dim hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "transactions" && (
          <TransactionsPanel
            transactions={initialTransactions}
            accounts={activeAccounts}
            currentPersonId={currentPersonId}
            canManageFinance={canManageFinance}
            canDecideExpense={canDecideExpense}
            areaLabel={areaLabel}
            personName={personName}
            onChanged={refresh}
            initialSelectedId={initialSelectedId ?? null}
          />
        )}
        {tab === "accounts" && (
          <AccountsPanel accounts={initialAccounts} canManageFinance={canManageFinance} onChanged={refresh} />
        )}
        {tab === "assets" && (
          <AssetsPanel
            assets={initialAssets}
            transactions={initialTransactions}
            roster={roster}
            canManageAssets={canManageAssets}
            personName={personName}
            onChanged={refresh}
            initialSelectedId={initialSelectedId ?? null}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Accounts ---------------------------------- */

function AccountsPanel({
  accounts,
  canManageFinance,
  onChanged,
}: {
  accounts: FinancialAccount[];
  canManageFinance: boolean;
  onChanged: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();

  const archive = (account: FinancialAccount) => {
    start(async () => {
      const r = await archiveAccountAction(account.id);
      if (!r.ok) return toast.notify("error", r.error ?? "Could not archive that account.");
      toast.notify("success", `"${account.name}" archived.`);
      onChanged();
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Financial accounts</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCreating(true)}
          disabled={!canManageFinance}
          title={canManageFinance ? undefined : "Managing financial accounts isn't your responsibility here."}
        >
          New account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="No financial accounts yet"
            description="Cash boxes, bank accounts, and the institution's broader Income/Expense/Asset/Liability/Equity buckets all live here."
          />
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-text">{a.name}</p>
                {a.description && <p className="truncate text-xs text-dim">{a.description}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge tone={a.archivedAt ? "neutral" : "accent"}>{ACCOUNT_KIND_LABELS[a.kind]}</Badge>
                {!a.archivedAt && canManageFinance && (
                  <button type="button" disabled={pending} onClick={() => archive(a)} className="text-xs text-dim hover:text-error disabled:opacity-50">
                    Archive
                  </button>
                )}
                {a.archivedAt && <span className="text-xs text-dim">Archived</span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating && <CreateAccountDrawer onClose={() => setCreating(false)} onCreated={() => { setCreating(false); onChanged(); }} />}
    </div>
  );
}

function CreateAccountDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<(typeof ACCOUNT_KINDS)[number]>("cash");
  const [description, setDescription] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("kind", kind);
      fd.set("description", description);
      const r = await createAccountAction(fd);
      if (!r.ok) return setErr(r.error ?? "Could not create.");
      onCreated();
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="New financial account">
      <div className="os-anim-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="os-anim-sheet relative w-full max-w-md overflow-hidden rounded-t-2xl border border-border bg-elevated p-6 sm:rounded-2xl">
        <p className="font-display text-lg">New account</p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          placeholder="Name — e.g. Main Cash Box, HDFC Operations"
          className="mt-4 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as (typeof ACCOUNT_KINDS)[number])}
          className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        >
          {ACCOUNT_KINDS.map((k) => (
            <option key={k} value={k}>
              {ACCOUNT_KIND_LABELS[k]}
            </option>
          ))}
        </select>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description — optional"
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />

        {err && <p className="mt-2 text-sm text-error" role="alert">{err}</p>}

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={submit} disabled={pending || !name.trim()}>
            {pending ? "Creating…" : "Create"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Transactions -------------------------------- */

function TransactionsPanel({
  transactions,
  accounts,
  currentPersonId,
  canManageFinance,
  canDecideExpense,
  areaLabel,
  personName,
  onChanged,
  initialSelectedId,
}: {
  transactions: FinanceTransaction[];
  accounts: FinancialAccount[];
  currentPersonId: string;
  canManageFinance: boolean;
  canDecideExpense: (item: Expense) => boolean;
  areaLabel: (key: PermissionKey) => string;
  personName: (id: string | null) => string | null;
  onChanged: () => void;
  initialSelectedId?: string | null;
}) {
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);
  const active = useMemo(() => transactions.filter((t) => t.status !== "archived"), [transactions]);
  const selected = transactions.find((t) => t.id === selectedId) ?? null;

  const columns: DataTableColumn<FinanceTransaction>[] = [
    { key: "date", header: "Date", sortable: true, sortValue: (r) => r.date, render: (r) => r.date },
    { key: "title", header: "Title", render: (r) => r.title },
    {
      key: "kind",
      header: "Type",
      render: (r) => <Badge tone={r.kind === "expense" ? "error" : "success"}>{r.kind === "expense" ? "Expense" : "Income"}</Badge>,
    },
    { key: "categorySource", header: "Category / Source", render: (r) => (r.kind === "expense" ? r.category : INCOME_SOURCE_LABELS[r.source]) },
    { key: "amount", header: "Amount", align: "right", sortable: true, sortValue: (r) => r.amount, render: (r) => money(r.amount) },
    {
      key: "status",
      header: "Status",
      render: (r) =>
        r.kind === "expense" ? (
          <Badge tone={r.approvalStatus === "approved" ? "success" : r.approvalStatus === "rejected" ? "error" : "accent"}>
            {r.approvalStatus === "pending" ? "Pending approval" : r.approvalStatus === "approved" ? "Approved" : "Rejected"}
          </Badge>
        ) : (
          <Badge tone="success">Recorded</Badge>
        ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">
          {active.length} recorded {active.length === 1 ? "entry" : "entries"}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCreating(true)}
          disabled={!canManageFinance}
          title={canManageFinance ? undefined : "Recording expenses and income isn't your responsibility here."}
        >
          New
        </Button>
      </div>

      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={active}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelectedId(r.id)}
          emptyTitle="Nothing recorded yet"
          emptyDescription="Every expense and every rupee of income this institution records becomes part of its permanent memory."
        />
      </div>

      {creating && (
        <CreateTransactionDrawer accounts={accounts} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); onChanged(); }} />
      )}

      {selected && (
        <TransactionDetailDrawer
          item={selected}
          currentPersonId={currentPersonId}
          canManageFinance={canManageFinance}
          canDecide={selected.kind === "expense" ? canDecideExpense(selected) : false}
          areaLabel={areaLabel}
          personName={personName}
          onClose={() => setSelectedId(null)}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}

function CreateTransactionDrawer({
  accounts,
  onClose,
  onCreated,
}: {
  accounts: FinancialAccount[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("");
  const [source, setSource] = useState<(typeof INCOME_SOURCES)[number]>("donation");
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>("cash");
  const [counterparty, setCounterparty] = useState("");
  const [accountId, setAccountId] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("description", description);
      fd.set("amount", amount);
      fd.set("date", date);
      fd.set("paymentMethod", paymentMethod);
      fd.set("accountId", accountId);
      const r =
        kind === "expense"
          ? (fd.set("category", category), fd.set("payee", counterparty), await createExpenseAction(fd))
          : (fd.set("source", source), fd.set("payer", counterparty), await createIncomeAction(fd));
      if (!r.ok) return setErr(r.error ?? "Could not record that.");
      onCreated();
    });
  };

  const valid = title.trim() && Number(amount) > 0 && date && (kind === "income" || category.trim());

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="New expense or income">
      <div className="os-anim-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="os-anim-sheet relative w-full max-w-md overflow-y-auto overflow-x-hidden rounded-t-2xl border border-border bg-elevated p-6 sm:max-h-[85vh] sm:rounded-2xl">
        <p className="font-display text-lg">New record</p>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setKind("expense")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${kind === "expense" ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setKind("income")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${kind === "income" ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
          >
            Income
          </button>
        </div>

        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="Title" className="mt-4 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description — optional" rows={2} className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />

        <div className="mt-2 grid grid-cols-2 gap-2">
          <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        </div>

        {kind === "expense" ? (
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category — e.g. Utilities, Supplies" list="expense-category-suggestions" className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        ) : (
          <select value={source} onChange={(e) => setSource(e.target.value as (typeof INCOME_SOURCES)[number])} className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent">
            {INCOME_SOURCES.map((s) => (
              <option key={s} value={s}>
                {INCOME_SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
        )}
        <datalist id="expense-category-suggestions">
          <option value="Operations" />
          <option value="Salaries" />
          <option value="Utilities" />
          <option value="Maintenance" />
          <option value="Supplies" />
          <option value="Travel" />
          <option value="Programs" />
        </datalist>

        <input value={counterparty} onChange={(e) => setCounterparty(e.target.value)} placeholder={kind === "expense" ? "Vendor / payee — optional" : "Payer / donor — optional"} className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />

        <div className="mt-2 grid grid-cols-2 gap-2">
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as (typeof PAYMENT_METHODS)[number])} className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent">
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent">
            <option value="">No account linked</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {err && <p className="mt-2 text-sm text-error" role="alert">{err}</p>}

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={submit} disabled={pending || !valid}>
            {pending ? "Recording…" : "Record"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function TransactionDetailDrawer({
  item,
  currentPersonId,
  canManageFinance,
  canDecide,
  areaLabel,
  personName,
  onClose,
  onChanged,
}: {
  item: FinanceTransaction;
  currentPersonId: string;
  canManageFinance: boolean;
  canDecide: boolean;
  areaLabel: (key: PermissionKey) => string;
  personName: (id: string | null) => string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [docLabel, setDocLabel] = useState("");
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const toast = useToast();

  useEffect(() => {
    setHistory(null);
    getTransactionHistoryAction(item.id).then(setHistory);
  }, [item.id]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, successMessage?: string) => {
    setErr(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) return setErr(r.error ?? "Could not complete that.");
      if (successMessage) toast.notify("success", successMessage);
      onChanged();
      getTransactionHistoryAction(item.id).then(setHistory);
    });
  };

  const area = item.kind === "expense" ? resolveExpenseApprovalArea(item) : null;

  return (
    <div className="fixed inset-0 z-[75] flex justify-end" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="os-anim-backdrop absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="os-anim-drawer-right relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-elevated p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">{item.kind === "expense" ? "Expense" : "Income"}</p>
            <h2 className="mt-1 font-display text-xl font-medium">{item.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-xs text-dim hover:text-text">
            Close
          </button>
        </div>

        {item.description && <p className="mt-2 text-sm text-muted">{item.description}</p>}

        <section className="mt-6 space-y-3 text-sm">
          <Row label="Amount" value={money(item.amount)} />
          <Row label="Date" value={item.date} />
          <Row label={item.kind === "expense" ? "Category" : "Source"} value={item.kind === "expense" ? item.category : INCOME_SOURCE_LABELS[item.source]} />
          <Row label="Payment method" value={PAYMENT_METHOD_LABELS[item.paymentMethod]} />
          <Row label={item.kind === "expense" ? "Vendor / payee" : "Payer"} value={(item.kind === "expense" ? item.payee : item.payer) ?? "—"} />
          <Row label="Recorded by" value={personName(item.createdByPersonId) ?? "Someone"} />
        </section>

        {item.kind === "expense" && (
          <section className="mt-6">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Approval</h3>
            <div className="mt-1.5">
              <Badge tone={item.approvalStatus === "approved" ? "success" : item.approvalStatus === "rejected" ? "error" : "accent"}>
                {item.approvalStatus === "pending" ? `Awaiting ${area ? areaLabel(area) : "approval"}` : item.approvalStatus === "approved" ? "Approved" : "Rejected"}
              </Badge>
            </div>
            {item.decidedByPersonId && (
              <p className="mt-1.5 text-xs text-dim">
                {item.approvalStatus === "approved" ? "Approved" : "Decided"} by {personName(item.decidedByPersonId)}
              </p>
            )}
            {item.approvalStatus === "pending" && (
              <div className="mt-3">
                {canDecide ? (
                  <div className="flex items-center gap-2">
                    <Button disabled={pending} onClick={() => run(() => decideExpenseAction(item.id, "approved"), "Expense approved.")}>
                      Approve
                    </Button>
                    <Button variant="secondary" disabled={pending} onClick={() => run(() => decideExpenseAction(item.id, "rejected"), "Expense rejected.")}>
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm text-muted">
                    {item.createdByPersonId === currentPersonId
                      ? "You recorded this expense — you can't also decide it."
                      : `Deciding the ${area ? areaLabel(area) : "approval"} step isn't your responsibility here.`}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {err && (
          <p className="mt-3 text-sm text-error" role="alert">
            {err}
          </p>
        )}

        <DocumentRefsSection
          refs={item.documentRefs}
          label={docLabel}
          setLabel={setDocLabel}
          pending={pending}
          canManage={canManageFinance}
          onAdd={() => run(() => addTransactionDocumentRefAction(item.id, docLabel).then((r) => { if (r.ok) setDocLabel(""); return r; }))}
        />

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Related records</h3>
          <p className="mt-1.5 text-sm text-muted">
            Community, Work, and Projects will be able to point here once they&apos;re ready to. Nothing to connect yet.
          </p>
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Timeline</h3>
          {history === null ? (
            <p className="mt-2 text-sm text-muted">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nothing recorded yet — this record&apos;s own history starts here.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <p className="text-text">{h.summary}</p>
                  <p className="text-xs text-dim">{new Date(h.occurredAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {item.status !== "archived" && canManageFinance && (
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => run(() => archiveTransactionAction(item.id), "Archived.")}
            className="mt-6 self-start text-dim hover:text-error"
          >
            Archive this record
          </Button>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------- Assets ----------------------------------- */

function AssetsPanel({
  assets,
  transactions,
  roster,
  canManageAssets,
  personName,
  onChanged,
  initialSelectedId,
}: {
  assets: Asset[];
  transactions: FinanceTransaction[];
  roster: MoneyRosterPerson[];
  canManageAssets: boolean;
  personName: (id: string | null) => string | null;
  onChanged: () => void;
  initialSelectedId?: string | null;
}) {
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);
  const selected = assets.find((a) => a.id === selectedId) ?? null;
  const expenses = useMemo(() => transactions.filter((t): t is Expense => t.kind === "expense"), [transactions]);

  const columns: DataTableColumn<Asset>[] = [
    { key: "name", header: "Name", sortable: true, sortValue: (r) => r.name, render: (r) => r.name },
    { key: "category", header: "Category", render: (r) => r.category },
    { key: "status", header: "Status", render: (r) => <Badge tone={ASSET_STATUS_TONE[r.status]}>{ASSET_STATUS_LABELS[r.status]}</Badge> },
    { key: "custodian", header: "Custodian", render: (r) => personName(r.custodianPersonId) ?? <span className="text-dim">Unassigned</span> },
    { key: "location", header: "Location", render: (r) => r.location ?? "—" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">
          {assets.length} registered {assets.length === 1 ? "asset" : "assets"}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCreating(true)}
          disabled={!canManageAssets}
          title={canManageAssets ? undefined : "Registering assets isn't your responsibility here."}
        >
          New asset
        </Button>
      </div>

      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={assets}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelectedId(r.id)}
          emptyTitle="Nothing registered yet"
          emptyDescription="Everything this institution owns — from a single chair to a piece of equipment — belongs here, with someone accountable for it."
        />
      </div>

      {creating && (
        <CreateAssetDrawer roster={roster} expenses={expenses} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); onChanged(); }} />
      )}

      {selected && (
        <AssetDetailDrawer
          asset={selected}
          roster={roster}
          canManageAssets={canManageAssets}
          personName={personName}
          onClose={() => setSelectedId(null)}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}

function CreateAssetDrawer({
  roster,
  expenses,
  onClose,
  onCreated,
}: {
  roster: MoneyRosterPerson[];
  expenses: Expense[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [custodianPersonId, setCustodianPersonId] = useState("");
  const [location, setLocation] = useState("");
  const [warrantyExpiresAt, setWarrantyExpiresAt] = useState("");
  const [acquiredViaExpenseId, setAcquiredViaExpenseId] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("category", category);
      fd.set("description", description);
      fd.set("purchaseDate", purchaseDate);
      fd.set("purchaseValue", purchaseValue);
      fd.set("custodianPersonId", custodianPersonId);
      fd.set("location", location);
      fd.set("warrantyExpiresAt", warrantyExpiresAt);
      fd.set("acquiredViaExpenseId", acquiredViaExpenseId);
      const r = await createAssetAction(fd);
      if (!r.ok) return setErr(r.error ?? "Could not register that.");
      onCreated();
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="New asset">
      <div className="os-anim-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="os-anim-sheet relative w-full max-w-md overflow-y-auto overflow-x-hidden rounded-t-2xl border border-border bg-elevated p-6 sm:max-h-[85vh] sm:rounded-2xl">
        <p className="font-display text-lg">Register an asset</p>

        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Name" className="mt-4 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category — e.g. Furniture, Equipment" className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description — optional" rows={2} className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />

        <div className="mt-2 grid grid-cols-2 gap-2">
          <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} placeholder="Purchase date" className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
          <input type="number" min="0" step="0.01" value={purchaseValue} onChange={(e) => setPurchaseValue(e.target.value)} placeholder="Purchase value" className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        </div>

        <select value={custodianPersonId} onChange={(e) => setCustodianPersonId(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent">
          <option value="">No custodian yet</option>
          {roster.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location — optional" className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        <div className="mt-2">
          <label className="text-xs text-dim">Warranty expires — optional</label>
          <input type="date" value={warrantyExpiresAt} onChange={(e) => setWarrantyExpiresAt(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        </div>

        {expenses.length > 0 && (
          <select value={acquiredViaExpenseId} onChange={(e) => setAcquiredViaExpenseId(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent">
            <option value="">Not linked to a recorded expense</option>
            {expenses.map((e) => (
              <option key={e.id} value={e.id}>
                Bought via: {e.title} ({money(e.amount)})
              </option>
            ))}
          </select>
        )}

        {err && <p className="mt-2 text-sm text-error" role="alert">{err}</p>}

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={submit} disabled={pending || !name.trim() || !category.trim()}>
            {pending ? "Registering…" : "Register"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function AssetDetailDrawer({
  asset,
  roster,
  canManageAssets,
  personName,
  onClose,
  onChanged,
}: {
  asset: Asset;
  roster: MoneyRosterPerson[];
  canManageAssets: boolean;
  personName: (id: string | null) => string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [custodianId, setCustodianId] = useState(asset.custodianPersonId ?? "");
  const [serviceNotes, setServiceNotes] = useState(asset.serviceNotes ?? "");
  const [docLabel, setDocLabel] = useState("");
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const toast = useToast();

  useEffect(() => {
    setHistory(null);
    getAssetHistoryAction(asset.id).then(setHistory);
  }, [asset.id]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, successMessage?: string) => {
    setErr(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) return setErr(r.error ?? "Could not complete that.");
      if (successMessage) toast.notify("success", successMessage);
      onChanged();
      getAssetHistoryAction(asset.id).then(setHistory);
    });
  };

  return (
    <div className="fixed inset-0 z-[75] flex justify-end" role="dialog" aria-modal="true" aria-label={asset.name}>
      <div className="os-anim-backdrop absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="os-anim-drawer-right relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-elevated p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">{asset.category}</p>
            <h2 className="mt-1 font-display text-xl font-medium">{asset.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-xs text-dim hover:text-text">
            Close
          </button>
        </div>

        {asset.description && <p className="mt-2 text-sm text-muted">{asset.description}</p>}

        <section className="mt-6 space-y-3 text-sm">
          {asset.purchaseDate && <Row label="Purchased" value={asset.purchaseDate} />}
          {asset.purchaseValue !== null && <Row label="Purchase value" value={money(asset.purchaseValue)} />}
          {asset.warrantyExpiresAt && <Row label="Warranty expires" value={asset.warrantyExpiresAt} />}
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Status</h3>
          <select
            value={asset.status}
            disabled={!canManageAssets || pending}
            onChange={(e) => run(() => setAssetStatusAction(asset.id, e.target.value))}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent disabled:opacity-50"
          >
            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ASSET_STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <h3 className="mt-4 text-[0.65rem] uppercase tracking-[0.2em] text-dim">Custodian</h3>
          <div className="mt-1.5 flex items-center gap-2">
            <select
              value={custodianId}
              onChange={(e) => setCustodianId(e.target.value)}
              disabled={!canManageAssets}
              className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent disabled:opacity-50"
            >
              <option value="">Unassigned</option>
              {roster.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              size="sm"
              disabled={pending || !canManageAssets}
              onClick={() => run(() => transferCustodianAction(asset.id, custodianId || null), "Custodian updated.")}
              className="shrink-0"
            >
              Save
            </Button>
          </div>
          {!asset.custodianPersonId && <p className="mt-1.5 text-xs text-dim">Nobody is currently accountable for this asset.</p>}
        </section>

        {asset.location && (
          <section className="mt-4">
            <Row label="Location" value={asset.location} />
          </section>
        )}

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Service notes</h3>
          <textarea
            value={serviceNotes}
            onChange={(e) => setServiceNotes(e.target.value)}
            disabled={!canManageAssets}
            rows={2}
            placeholder="Condition, repairs, anything worth remembering — optional"
            className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent disabled:opacity-50"
          />
          {canManageAssets && (
            <Button variant="secondary" size="sm" disabled={pending} onClick={() => run(() => setAssetServiceNotesAction(asset.id, serviceNotes), "Saved.")} className="mt-1.5">
              Save notes
            </Button>
          )}
        </section>

        {err && (
          <p className="mt-3 text-sm text-error" role="alert">
            {err}
          </p>
        )}

        <DocumentRefsSection
          refs={asset.documentRefs}
          label={docLabel}
          setLabel={setDocLabel}
          pending={pending}
          canManage={canManageAssets}
          onAdd={() => run(() => addAssetDocumentRefAction(asset.id, docLabel).then((r) => { if (r.ok) setDocLabel(""); return r; }))}
        />

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Related records</h3>
          <p className="mt-1.5 text-sm text-muted">
            Community, Work, and Projects will be able to point here once they&apos;re ready to. Nothing to connect yet.
          </p>
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Timeline</h3>
          {history === null ? (
            <p className="mt-2 text-sm text-muted">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nothing recorded yet — this asset&apos;s own history starts here.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <p className="text-text">{h.summary}</p>
                  <p className="text-xs text-dim">{new Date(h.occurredAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------------------------------- Shared ---------------------------------- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-dim">{label}</span>
      <span className="text-right text-text">{value}</span>
    </div>
  );
}

/** Part 9 — a document is a named reference today, not a real upload; the
 *  real Documents application replaces the input below with genuine
 *  attachments without this section needing to change shape. */
function DocumentRefsSection({
  refs,
  label,
  setLabel,
  pending,
  canManage,
  onAdd,
}: {
  refs: { id: string; label: string }[];
  label: string;
  setLabel: (v: string) => void;
  pending: boolean;
  canManage: boolean;
  onAdd: () => void;
}) {
  return (
    <section className="mt-6">
      <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Documents</h3>
      {refs.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No documents referenced yet.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {refs.map((r) => (
            <li key={r.id} className="rounded-lg border border-border px-3 py-2 text-sm text-text">
              {r.label}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <div className="mt-2 flex items-center gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Reference a document — e.g. Receipt #4521"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
          <Button size="sm" disabled={pending || !label.trim()} onClick={onAdd} className="shrink-0">
            Add
          </Button>
        </div>
      )}
    </section>
  );
}
