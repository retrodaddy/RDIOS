import { requireIdentity } from "@/os/identity/session";
import { supabaseIdentityProvider } from "@/os/identity/supabase-provider";
import { supabaseDocumentsProvider } from "@/applications/documents/supabase-provider";
import type { DocumentRelationshipType } from "@/applications/documents/types";
import { supabaseProjectsProvider } from "@/applications/projects/supabase-provider";
import { supabaseWorkProvider } from "@/applications/work/supabase-provider";
import { supabaseFinanceProvider } from "@/applications/finance/supabase-provider";
import { supabaseCommunityProvider } from "@/applications/community/supabase-provider";
import { DocumentsBoard, type DocumentsRosterPerson, type RelationshipCandidate } from "@/components/os/DocumentsBoard";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({ searchParams }: { searchParams: { open?: string } }) {
  const ctx = await requireIdentity("/documents");

  const [documents, memberships, projects, workItems, transactions, assets, contacts] = await Promise.all([
    supabaseDocumentsProvider.listDocuments(ctx.institution.id),
    supabaseIdentityProvider.listMembershipsForInstitution(ctx.institution.id),
    supabaseProjectsProvider.listProjects(ctx.institution.id),
    supabaseWorkProvider.listWorkItems(ctx.institution.id),
    supabaseFinanceProvider.listTransactions(ctx.institution.id),
    supabaseFinanceProvider.listAssets(ctx.institution.id),
    supabaseCommunityProvider.listContacts(ctx.institution.id),
  ]);

  const rosterMemberships = memberships.filter((m) => m.status === "active");
  const rosterPeople = await Promise.all(rosterMemberships.map((m) => supabaseIdentityProvider.getPerson(m.personId)));
  const roster: DocumentsRosterPerson[] = rosterPeople
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => ({ id: p.id, name: p.name }));

  const relationshipCandidates: Record<DocumentRelationshipType, RelationshipCandidate[]> = {
    person: roster.map((p) => ({ id: p.id, label: p.name })),
    project: projects.map((p) => ({ id: p.id, label: p.name })),
    transaction: transactions.map((t) => ({ id: t.id, label: t.title })),
    contact: contacts.map((c) => ({ id: c.id, label: c.name })),
    work_item: workItems.map((w) => ({ id: w.id, label: w.title })),
    asset: assets.map((a) => ({ id: a.id, label: a.name })),
  };

  const active = documents.filter((d) => d.status !== "archived");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Documents</p>
      <h1 className="mt-2 font-display text-3xl font-medium">What institutional knowledge exists?</h1>
      <p className="mt-4 text-muted">
        {active.length === 0
          ? `Nothing kept yet — the policies, contracts, and records ${ctx.institution.name} needs to be able to find again will appear here.`
          : `${active.length} kept ${active.length === 1 ? "document" : "documents"}.`}
      </p>

      <DocumentsBoard
        canManage={ctx.permissions.has("documents.manage")}
        initialDocuments={documents}
        roster={roster}
        relationshipCandidates={relationshipCandidates}
        initialSelectedId={searchParams.open ?? null}
      />
    </div>
  );
}
