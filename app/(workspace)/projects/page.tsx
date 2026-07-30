import { requireIdentity } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { mockProjectsProvider } from "@/applications/projects/mock-provider";
import { mockWorkProvider } from "@/applications/work/mock-provider";
import { mockFinanceProvider } from "@/applications/finance/mock-provider";
import { mockCommunityProvider } from "@/applications/community/mock-provider";
import { ProjectBoard, type ProjectRosterPerson } from "@/components/os/ProjectBoard";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const ctx = await requireIdentity("/projects");

  const [projects, memberships, workItems, transactions, assets, contacts] = await Promise.all([
    mockProjectsProvider.listProjects(ctx.institution.id),
    mockIdentityProvider.listMembershipsForInstitution(ctx.institution.id),
    mockWorkProvider.listWorkItems(ctx.institution.id),
    mockFinanceProvider.listTransactions(ctx.institution.id),
    mockFinanceProvider.listAssets(ctx.institution.id),
    mockCommunityProvider.listContacts(ctx.institution.id),
  ]);

  const rosterMemberships = memberships.filter((m) => m.status === "active");
  const rosterPeople = await Promise.all(rosterMemberships.map((m) => mockIdentityProvider.getPerson(m.personId)));
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
      />
    </div>
  );
}
