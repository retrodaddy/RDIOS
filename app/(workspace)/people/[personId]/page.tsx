import { notFound } from "next/navigation";
import { requireIdentity } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { mockPeopleProvider } from "@/applications/people/mock-provider";
import { AppointHolderCard } from "@/components/os/AppointHolderCard";
import { AffiliationsCard } from "@/components/os/AffiliationsCard";
import { CapabilitiesCard } from "@/components/os/CapabilitiesCard";
import { OffboardButton } from "@/components/os/OffboardButton";

export const dynamic = "force-dynamic";

export default async function PersonProfilePage({ params }: { params: { personId: string } }) {
  const ctx = await requireIdentity(`/people/${params.personId}`);

  const membership = await mockIdentityProvider.getMembership(params.personId, ctx.institution.id);
  const person = membership ? await mockIdentityProvider.getPerson(params.personId) : null;
  if (!membership || !person) notFound();

  const [holders, affiliations, capabilities, allPositions] = await Promise.all([
    mockPeopleProvider.listPositionHoldersForPerson(person.id),
    mockPeopleProvider.listAffiliationsForPerson(person.id),
    mockPeopleProvider.listCapabilitiesForPerson(person.id),
    mockPeopleProvider.listPositions(ctx.institution.id),
  ]);

  const positionById = new Map(allPositions.map((p) => [p.id, p]));
  const holdings = holders
    .filter((h) => positionById.has(h.positionId))
    .map((holder) => ({ holder, position: positionById.get(holder.positionId) ?? null }));
  const current = holdings.filter((h) => !h.holder.endedAt);
  const past = holdings.filter((h) => h.holder.endedAt);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Person</p>
      <h1 className="mt-2 font-display text-3xl font-medium">{person.name}</h1>
      <p className="mt-1 text-muted">
        {person.email}
        {membership.status === "invited" ? " — invited, hasn't signed in yet" : ""}
      </p>

      <AppointHolderCard personId={person.id} availablePositions={allPositions} current={current} past={past} />
      <AffiliationsCard personId={person.id} affiliations={affiliations} institutionType={ctx.institution.type} />
      <CapabilitiesCard personId={person.id} capabilities={capabilities} institutionType={ctx.institution.type} />

      <section className="mt-14 rounded-xl border border-border/60 p-5">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Offboarding</h2>
        <p className="mt-2 text-sm text-muted">
          If {person.name} is leaving {ctx.institution.name}, offboarding ends every position and affiliation they
          currently hold, all at once.
        </p>
        <div className="mt-3">
          <OffboardButton personId={person.id} personName={person.name} />
        </div>
      </section>
    </div>
  );
}
