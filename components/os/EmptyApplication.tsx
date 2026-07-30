import { getIdentityContext } from "@/os/identity/session";
import { getNavDestination } from "@/os/navigation";

/** Placeholder for an application not yet built. Resolves its label,
 *  question, and description through the institution's own type, and
 *  never describes itself in implementation terms ("this application
 *  hasn't been built") — a founder reading this screen shouldn't be able
 *  to tell it's unfinished software, only what belongs here, why it
 *  matters, and that it fills in the moment there's real data
 *  (Implementation Sprint 2 §8). */
export async function EmptyApplication({ destKey }: { destKey: string }) {
  const ctx = await getIdentityContext();
  const dest = getNavDestination(ctx?.institution.type ?? "company", destKey);
  const label = dest?.label ?? "";
  const question = dest?.question ?? "";
  const description = dest?.description ?? "";
  const institutionName = ctx?.institution.name ?? "your institution";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">{label}</p>
      <h1 className="mt-2 font-display text-3xl font-medium">{question}</h1>
      {description && <p className="mt-3 text-muted">{description}</p>}
      <p className="mt-4 text-sm text-dim">
        Nothing here yet — the moment {institutionName} has some, it appears here on its own. Nothing to set up first.
      </p>
    </div>
  );
}
