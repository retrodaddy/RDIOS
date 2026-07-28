import { getIdentityContext } from "@/os/identity/session";
import { getNavDestination } from "@/os/navigation";

/** Placeholder for an application not yet built. Resolves its label and
 *  question through the institution's own type, and never describes
 *  itself in implementation terms ("this application hasn't been built")
 *  — a founder reading this screen shouldn't be able to tell it's
 *  unfinished software, only that there's nothing here yet. */
export async function EmptyApplication({ destKey }: { destKey: string }) {
  const ctx = await getIdentityContext();
  const dest = getNavDestination(ctx?.institution.type ?? "company", destKey);
  const label = dest?.label ?? "";
  const question = dest?.question ?? "";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">{label}</p>
      <h1 className="mt-2 font-display text-3xl font-medium">{question}</h1>
      <p className="mt-4 text-muted">
        Nothing here yet — it will appear the moment {ctx?.institution.name ?? "your institution"} has some.
      </p>
    </div>
  );
}
