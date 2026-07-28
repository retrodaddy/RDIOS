import { requireIdentity } from "@/os/identity/session";
import { Shell } from "@/components/os/Shell";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireIdentity();

  return (
    <Shell institutionName={ctx.institution.name} personName={ctx.person.name}>
      {children}
    </Shell>
  );
}
