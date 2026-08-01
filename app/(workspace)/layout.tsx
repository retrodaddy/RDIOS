import { requireIdentity } from "@/os/identity/session";
import { Shell } from "@/components/os/Shell";
import { supabasePeopleProvider } from "@/applications/people/supabase-provider";
import { supabasePreferencesProvider } from "@/os/preferences/supabase-provider";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireIdentity();

  const [holders, preferences] = await Promise.all([
    supabasePeopleProvider.listPositionHoldersForPerson(ctx.person.id),
    supabasePreferencesProvider.getPreferences(ctx.person.id),
  ]);
  const currentHolding = holders.find((h) => !h.endedAt);
  const currentPosition = currentHolding ? await supabasePeopleProvider.getPosition(currentHolding.positionId) : null;

  return (
    <Shell
      institutionName={ctx.institution.name}
      institutionType={ctx.institution.type}
      personName={ctx.person.name}
      personRole={currentPosition?.name}
      initialSidebarCollapsed={preferences.sidebarCollapsed}
    >
      {children}
    </Shell>
  );
}
