import { requireIdentity } from "@/os/identity/session";
import { supabaseIdentityProvider } from "@/os/identity/supabase-provider";
import { supabaseFinanceProvider } from "@/applications/finance/supabase-provider";
import { MoneyBoard, type MoneyRosterPerson } from "@/components/os/MoneyBoard";

export const dynamic = "force-dynamic";

export default async function MoneyPage({ searchParams }: { searchParams: { open?: string; tab?: string } }) {
  const ctx = await requireIdentity("/money");

  const [memberships, accounts, transactions, assets] = await Promise.all([
    supabaseIdentityProvider.listMembershipsForInstitution(ctx.institution.id),
    supabaseFinanceProvider.listAccounts(ctx.institution.id),
    supabaseFinanceProvider.listTransactions(ctx.institution.id),
    supabaseFinanceProvider.listAssets(ctx.institution.id),
  ]);

  const rosterMemberships = memberships.filter((m) => m.status === "active");
  const rosterPeople = await Promise.all(rosterMemberships.map((m) => supabaseIdentityProvider.getPerson(m.personId)));
  const roster: MoneyRosterPerson[] = rosterPeople.filter((p): p is NonNullable<typeof p> => p !== null);

  const activeTransactions = transactions.filter((t) => t.status !== "archived");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Money</p>
      <h1 className="mt-2 font-display text-3xl font-medium">What is the financial state?</h1>
      <p className="mt-4 text-muted">
        {activeTransactions.length === 0 && assets.length === 0
          ? `Nothing recorded yet — every expense, every rupee of income, and everything ${ctx.institution.name} owns becomes part of its permanent memory the moment it's entered.`
          : `${activeTransactions.length} recorded ${activeTransactions.length === 1 ? "entry" : "entries"}, ${assets.length} registered ${assets.length === 1 ? "asset" : "assets"}.`}
      </p>

      <MoneyBoard
        institutionType={ctx.institution.type}
        currentPersonId={ctx.person.id}
        isFounder={ctx.institution.founderPersonId === ctx.person.id}
        canManageFinance={ctx.permissions.has("finance.manage")}
        canApproveTreasury={ctx.permissions.has("treasury.approve")}
        canManageAssets={ctx.permissions.has("assets.manage")}
        roster={roster}
        initialAccounts={accounts}
        initialTransactions={transactions}
        initialAssets={assets}
        initialTab={searchParams.tab === "assets" ? "assets" : searchParams.tab === "accounts" ? "accounts" : searchParams.open ? "transactions" : undefined}
        initialSelectedId={searchParams.open ?? null}
      />
    </div>
  );
}
