import { requireIdentity } from "@/os/identity/session";
import { Shell } from "@/components/os/Shell";
import { mockPeopleProvider } from "@/applications/people/mock-provider";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireIdentity();

  const holders = await mockPeopleProvider.listPositionHoldersForPerson(ctx.person.id);
  const currentHolding = holders.find((h) => !h.endedAt);
  const currentPosition = currentHolding ? await mockPeopleProvider.getPosition(currentHolding.positionId) : null;

  return (
    <Shell
      institutionName={ctx.institution.name}
      institutionType={ctx.institution.type}
      personName={ctx.person.name}
      personRole={currentPosition?.name}
    >
      {children}
    </Shell>
  );
}
