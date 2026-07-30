import { requireIdentity } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { InviteForm } from "./InviteForm";
import { PendingInvites, type PendingInvite } from "./PendingInvites";
import { PreferencesForm } from "./PreferencesForm";
import { mockPreferencesProvider } from "@/os/preferences/mock-provider";
import { getNavDestinations } from "@/os/navigation";

export default async function SettingsPage() {
  const ctx = await requireIdentity("/settings");

  const [memberships, preferences] = await Promise.all([
    mockIdentityProvider.listMembershipsForInstitution(ctx.institution.id),
    mockPreferencesProvider.getPreferences(ctx.person.id),
  ]);
  const pendingMemberships = memberships.filter((m) => m.status === "invited");
  const pendingPeople = await Promise.all(pendingMemberships.map((m) => mockIdentityProvider.getPerson(m.personId)));
  const pendingInvites: PendingInvite[] = pendingMemberships
    .map((m, i) => (pendingPeople[i] ? { membershipId: m.id, name: pendingPeople[i]!.name, email: pendingPeople[i]!.email, createdAt: m.createdAt, expiresAt: m.expiresAt } : null))
    .filter((p): p is PendingInvite => p !== null);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Settings</p>
      <h1 className="mt-2 font-display text-3xl font-medium">How is this institution configured?</h1>
      <p className="mt-2 text-muted">
        {ctx.institution.name}&apos;s settings live here — who&apos;s part of it, and how it works. Invitations are
        ready today; naming, branding, and business rules are on the way.
      </p>

      <section className="mt-10 rounded-2xl border border-border bg-surface/40 p-6">
        <h2 className="font-display text-lg">Invite someone</h2>
        <p className="mt-1 text-sm text-dim">They&apos;ll get a link to accept and sign in — no password.</p>
        <div className="mt-4">
          <InviteForm canInvite={ctx.permissions.has("members.invite")} />
        </div>
      </section>

      <PendingInvites invites={pendingInvites} canInvite={ctx.permissions.has("members.invite")} />

      <section className="mt-6 rounded-2xl border border-border bg-surface/40 p-6">
        <h2 className="font-display text-lg">Your preferences</h2>
        <p className="mt-1 text-sm text-dim">
          How ARUMBU looks and opens for you specifically — this follows you, not {ctx.institution.name}.
        </p>
        <div className="mt-4">
          <PreferencesForm preferences={preferences} destinations={getNavDestinations(ctx.institution.type)} />
        </div>
      </section>
    </div>
  );
}
