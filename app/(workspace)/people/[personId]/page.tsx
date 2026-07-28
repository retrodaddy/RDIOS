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
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium">{person.name}</h1>
          <p className="mt-1 text-muted">{person.email}</p>
        </div>
        <OffboardButton personId={person.id} personName={person.name} />
      </div>

      <AppointHolderCard personId={person.id} availablePositions={allPositions} current={current} past={past} />
      <AffiliationsCard personId={person.id} affiliations={affiliations} />
      <CapabilitiesCard personId={person.id} capabilities={capabilities} />
    </div>
  );
}
