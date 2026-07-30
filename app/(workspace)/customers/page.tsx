import { requireIdentity } from "@/os/identity/session";
import { mockCommunityProvider } from "@/applications/community/mock-provider";
import { CommunityBoard } from "@/components/os/CommunityBoard";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const ctx = await requireIdentity("/customers");

  const contacts = await mockCommunityProvider.listContacts(ctx.institution.id);
  const active = contacts.filter((c) => c.status === "active");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Community</p>
      <h1 className="mt-2 font-display text-3xl font-medium">Who are we serving?</h1>
      <p className="mt-4 text-muted">
        {active.length === 0
          ? `Nothing recorded yet — everyone ${ctx.institution.name} serves, is supported by, or is supplied by becomes part of its permanent memory the moment they're entered.`
          : `${active.length} recorded ${active.length === 1 ? "contact" : "contacts"}.`}
      </p>

      <CommunityBoard canManage={ctx.permissions.has("community.manage")} initialContacts={contacts} />
    </div>
  );
}
