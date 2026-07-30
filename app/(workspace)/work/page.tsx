import { requireIdentity } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { mockPeopleProvider } from "@/applications/people/mock-provider";
import { mockWorkProvider } from "@/applications/work/mock-provider";
import { WorkBoard, type WorkRosterPerson } from "@/components/os/WorkBoard";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const ctx = await requireIdentity("/work");

  const [memberships, workItems, holdings] = await Promise.all([
    mockIdentityProvider.listMembershipsForInstitution(ctx.institution.id),
    mockWorkProvider.listWorkItems(ctx.institution.id),
    mockPeopleProvider.listPositionHoldersForPerson(ctx.person.id),
  ]);

  const rosterMemberships = memberships.filter((m) => m.status === "active");
  const rosterPeople = await Promise.all(rosterMemberships.map((m) => mockIdentityProvider.getPerson(m.personId)));
  const roster: WorkRosterPerson[] = rosterPeople.filter((p): p is NonNullable<typeof p> => p !== null);
  // Which Positions this person actively holds — needed client-side so the
  // board can tell, before any click, whether an escalated step now
  // includes them, exactly mirroring the server's own eligibility check
  // (engines/authority/resolver.ts's personHoldsPosition) instead of
  // guessing and finding out only after a failed action.
  const myPositionIds = holdings.filter((h) => !h.endedAt).map((h) => h.positionId);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Work</p>
      <h1 className="mt-2 font-display text-3xl font-medium">What work exists?</h1>
      <p className="mt-4 text-muted">
        {workItems.length === 0
          ? `Nothing here yet — it will appear the moment ${ctx.institution.name} has some.`
          : `${workItems.length} ${workItems.length === 1 ? "item" : "items"} total.`}
      </p>

      <WorkBoard
        initialWorkItems={workItems}
        roster={roster}
        currentPersonId={ctx.person.id}
        canManageWork={ctx.permissions.has("work.manage")}
        myAreas={[...ctx.permissions]}
        myPositionIds={myPositionIds}
        institutionType={ctx.institution.type}
        isFounder={ctx.institution.founderPersonId === ctx.person.id}
      />
    </div>
  );
}
