import Link from "next/link";
import { requireIdentity } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { mockPeopleProvider } from "@/applications/people/mock-provider";
import { OrganizationCanvas } from "@/components/os/OrganizationCanvas";
import type { RosterPerson } from "@/components/os/PositionSidePanel";

export const dynamic = "force-dynamic";

export default async function OrganizationPage() {
  const ctx = await requireIdentity("/people/organization");

  const [memberships, positions] = await Promise.all([
    mockIdentityProvider.listMembershipsForInstitution(ctx.institution.id),
    mockPeopleProvider.listPositions(ctx.institution.id),
  ]);

  const rosterMemberships = memberships.filter((m) => m.status === "active" || m.status === "invited");
  const rosterPeople = await Promise.all(rosterMemberships.map((m) => mockIdentityProvider.getPerson(m.personId)));
  const roster: RosterPerson[] = rosterPeople
    .map((person, i) => (person ? { ...person, status: rosterMemberships[i].status as "active" | "invited" } : null))
    .filter((p): p is RosterPerson => p !== null);

  const holdersEntries = await Promise.all(
    positions.map(async (p) => [p.id, await mockPeopleProvider.listPositionHolders(p.id)] as const)
  );
  const holdersByPosition = Object.fromEntries(holdersEntries);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Organization</p>
          <h1 className="mt-1 font-display text-2xl font-medium">How is {ctx.institution.name} structured?</h1>
        </div>
        <Link href="/people" className="shrink-0 text-sm text-dim hover:text-text">
          Back to People
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">
        {ctx.permissions.has("organization.manage")
          ? "Drag a position to move it. Drag from the small handle on top of a position to the seat it reports to — drag again to disconnect. Click empty space to add a position. Click any position to see and edit its details."
          : "You can look around and tidy the layout, but managing positions and people here isn't your responsibility. Click any position to see its details."}
      </p>

      <div className="mt-6">
        <OrganizationCanvas
          initialPositions={positions}
          holdersByPosition={holdersByPosition}
          roster={roster}
          canManage={ctx.permissions.has("organization.manage")}
          isFounder={ctx.institution.founderPersonId === ctx.person.id}
          institutionType={ctx.institution.type}
        />
      </div>
    </div>
  );
}
