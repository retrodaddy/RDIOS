import { requireIdentity } from "@/os/identity/session";
import { supabaseIdentityProvider } from "@/os/identity/supabase-provider";
import { supabaseReportsProvider } from "@/applications/reports/supabase-provider";
import { computeObservations } from "@/applications/reports/analytics";
import { supabaseProjectsProvider } from "@/applications/projects/supabase-provider";
import { ReportsBoard, type ReportsProjectOption, type ReportsRosterPerson } from "@/components/os/ReportsBoard";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: { open?: string } }) {
  const ctx = await requireIdentity("/reports");

  const [reports, observations, memberships, projects] = await Promise.all([
    supabaseReportsProvider.listReports(ctx.institution.id),
    computeObservations(ctx.institution.id),
    supabaseIdentityProvider.listMembershipsForInstitution(ctx.institution.id),
    supabaseProjectsProvider.listProjects(ctx.institution.id),
  ]);

  const rosterMemberships = memberships.filter((m) => m.status === "active");
  const rosterPeople = await Promise.all(rosterMemberships.map((m) => supabaseIdentityProvider.getPerson(m.personId)));
  const roster: ReportsRosterPerson[] = rosterPeople
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => ({ id: p.id, name: p.name }));

  const projectOptions: ReportsProjectOption[] = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Reports</p>
      <h1 className="mt-2 font-display text-3xl font-medium">What should leadership understand?</h1>
      <p className="mt-4 text-muted">
        {reports.length === 0
          ? `Nothing generated yet — a report is a frozen record of where ${ctx.institution.name} stood, whenever you need one.`
          : `${reports.length} generated ${reports.length === 1 ? "report" : "reports"}.`}
      </p>

      <ReportsBoard
        canManage={ctx.permissions.has("reports.manage")}
        initialReports={reports}
        observations={observations}
        roster={roster}
        projects={projectOptions}
        initialSelectedId={searchParams.open ?? null}
      />
    </div>
  );
}
