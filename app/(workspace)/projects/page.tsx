import { requireIdentity } from "@/os/identity/session";
import { supabaseIdentityProvider } from "@/os/identity/supabase-provider";
import { supabaseProjectsProvider } from "@/applications/projects/supabase-provider";
import { supabaseWorkProvider } from "@/applications/work/supabase-provider";
import { supabaseFinanceProvider } from "@/applications/finance/supabase-provider";
import { supabaseCommunityProvider } from "@/applications/community/supabase-provider";
import { ProjectBoard, type ProjectRosterPerson } from "@/components/os/ProjectBoard";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: { searchParams: { open?: string } }) {
  const ctx = await requireIdentity("/projects");

  const [projects, memberships, workItems, transactions, assets, contacts] = await Promise.all([
    supabaseProjectsProvider.listProjects(ctx.institution.id),
    supabaseIdentityProvider.listMembershipsForInstitution(ctx.institution.id),
    supabaseWorkProvider.listWorkItems(ctx.institution.id),
    supabaseFinanceProvider.listTransactions(ctx.institution.id),
    supabaseFinanceProvider.listAssets(ctx.institution.id),
    supabaseCommunityProvider.listContacts(ctx.institution.id),
  ]);

  const rosterMemberships = memberships.filter((m) => m.status === "active");
  const rosterPeople = await Promise.all(rosterMemberships.map((m) => supabaseIdentityProvider.getPerson(m.personId)));
  const roster: ProjectRosterPerson[] = rosterPeople
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => ({ id: p.id, name: p.name }));

  const active = projects.filter((p) => p.status === "active");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Projects</p>
      <h1 className="mt-2 font-display text-3xl font-medium">What are we delivering?</h1>
      <p className="mt-4 text-muted">
        {active.length === 0
          ? `Nothing underway yet — the real efforts ${ctx.institution.name} carries out, each with a beginning, an end, and someone responsible, will appear here.`
          : `${active.length} active ${active.length === 1 ? "project" : "projects"}.`}
      </p>

      <ProjectBoard
        canManage={ctx.permissions.has("projects.manage")}
        initialProjects={projects}
        roster={roster}
        workItems={workItems}
        transactions={transactions}
        assets={assets}
        contacts={contacts}
        initialSelectedId={searchParams.open ?? null}
      />
    </div>
  );
}
