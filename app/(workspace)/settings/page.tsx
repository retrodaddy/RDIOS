import { requireIdentity } from "@/os/identity/session";
import { InviteForm } from "./InviteForm";

export default async function SettingsPage() {
  const ctx = await requireIdentity("/settings");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Settings</p>
      <h1 className="mt-2 font-display text-3xl font-medium">How is this institution configured?</h1>
      <p className="mt-2 text-muted">
        {ctx.institution.name} — everything here is configuration, not code, per the frozen Institution
        Configuration Layer. Only invitations are real today; terminology, branding, and business rules arrive with
        the People and Settings applications.
      </p>

      <section className="mt-10 rounded-2xl border border-border bg-surface/40 p-6">
        <h2 className="font-display text-lg">Invite someone</h2>
        <p className="mt-1 text-sm text-dim">They&apos;ll get a link to accept and sign in — no password.</p>
        <div className="mt-4">
          <InviteForm />
        </div>
      </section>
    </div>
  );
}
