import Link from "next/link";
import { requireIdentity } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { mockPeopleProvider } from "@/applications/people/mock-provider";
import { CreatePositionCard } from "@/components/os/CreatePositionCard";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const ctx = await requireIdentity("/people");

  const [memberships, positions] = await Promise.all([
    mockIdentityProvider.listMembershipsForInstitution(ctx.institution.id),
    mockPeopleProvider.listPositions(ctx.institution.id),
  ]);
  const active = memberships.filter((m) => m.status === "active");
  const invited = memberships.filter((m) => m.status === "invited");
  const roster = [...active, ...invited];
  const people = await Promise.all(roster.map((m) => mockIdentityProvider.getPerson(m.personId)));

  const holdersByPosition = await Promise.all(positions.map((p) => mockPeopleProvider.listPositionHolders(p.id)));
  const currentHolder = (positionId: string) => {
    const idx = positions.findIndex((p) => p.id === positionId);
    return holdersByPosition[idx]?.find((h) => !h.endedAt) ?? null;
  };
  const personName = (personId: string) => people.find((p) => p?.id === personId)?.name ?? "Someone";

  const positionForPerson = (personId: string) =>
    positions.find((p) => {
      const holder = currentHolder(p.id);
      return holder?.personId === personId;
    });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">People</p>
      <h1 className="mt-2 font-display text-3xl font-medium">Who makes up {ctx.institution.name}?</h1>
      <p className="mt-4 text-muted">
        {active.length} {active.length === 1 ? "person" : "people"}
        {invited.length > 0 ? `, ${invited.length} invited` : ""}, {positions.length}{" "}
        {positions.length === 1 ? "position" : "positions"}.
      </p>

      <section className="mt-10">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Roster</h2>
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {people.map((person, i) => {
            if (!person) return null;
            const membership = roster[i];
            const position = positionForPerson(person.id);
            return (
              <li key={person.id}>
                <Link href={`/people/${person.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surface">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{person.name}</p>
                    <p className="truncate text-xs text-dim">{person.email}</p>
                  </div>
                  {membership.status === "invited" ? (
                    <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-medium text-dim">Invited</span>
                  ) : (
                    <span className="shrink-0 text-xs text-muted">{position ? position.name : "No position"}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Positions</h2>
          <div className="flex items-center gap-2">
            <Link
              href="/people/organization"
              className="rounded-xl border border-border bg-surface/40 px-4 py-2 text-sm text-text transition-colors hover:bg-surface"
            >
              Organization
            </Link>
            <CreatePositionCard positions={positions} institutionType={ctx.institution.type} />
          </div>
        </div>
        {positions.length === 0 ? (
          <p className="mt-3 rounded-xl border border-border bg-surface/40 px-5 py-6 text-sm text-muted">
            No positions yet — add one to start appointing people to roles.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
            {positions.map((position) => {
              const holder = currentHolder(position.id);
              const reportsTo = positions.filter((p) => position.reportsToPositionIds.includes(p.id));
              return (
                <li key={position.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{position.name}</p>
                    <p className="truncate text-xs text-dim">
                      {reportsTo.length > 0 ? `Reports to ${reportsTo.map((p) => p.name).join(", ")}` : "Top-level"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{holder ? personName(holder.personId) : "Unfilled"}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
