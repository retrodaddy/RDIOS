import Link from "next/link";
import { requireIdentity } from "@/os/identity/session";
import { composeActNow, composeBeAware, composeHistory } from "@/os/attention/engine";
import { timeAgo } from "@/os/attention/timeAgo";
import { composeTamizhiObservations } from "@/engines/tamizhi";
import { TamizhiObservations } from "@/components/os/TamizhiObservations";

export const dynamic = "force-dynamic";

function partOfDay(): string {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

/**
 * Home — the Operating System itself, not a page. Act Now / Be Aware /
 * History, exactly the three tiers the frozen Experience Principles
 * define, nothing else. Every application will eventually contribute here
 * through the Attention Contract (os/attention/engine.ts names the seam);
 * today Identity is the only real contributor, and that's shown honestly
 * — nothing here is invented to make the screen look busier than it is.
 */
export default async function HomePage() {
  const ctx = await requireIdentity();
  const [actNow, beAware, history, tamizhiObservations] = await Promise.all([
    composeActNow(ctx),
    composeBeAware(ctx),
    composeHistory(ctx),
    composeTamizhiObservations(ctx.institution.id),
  ]);
  const firstName = ctx.person.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
        Good {partOfDay()}, {firstName}.
      </h1>
      <p className="mt-3 text-lg text-muted">
        {actNow.length === 0
          ? `The institution is calm this ${partOfDay()}.`
          : `${actNow.length} ${actNow.length === 1 ? "thing needs" : "things need"} you.`}
      </p>

      {/* Act Now */}
      <section className="mt-9">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Act Now</h2>
        {actNow.length === 0 ? (
          <p className="mt-3 rounded-xl border border-border bg-surface/40 px-5 py-6 text-sm text-muted">
            Nothing needs you right now.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
            {actNow.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surface">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text">{item.title}</p>
                    <p className="text-xs text-dim">{item.meta}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-bright">{item.verb}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Be Aware */}
      <section className="mt-12">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Be Aware</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {beAware.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-surface/30 p-4">
              <p className="text-[0.62rem] uppercase tracking-wide text-dim">{item.label}</p>
              <p className="mt-1 font-display text-xl">{item.value}</p>
              <p className="text-xs text-muted">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <TamizhiObservations recommendations={tamizhiObservations} />

      {/* History */}
      <section className="mt-12">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">History</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing has happened yet — it will appear here as it does.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.slice(0, 8).map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-4 border-b border-border pb-2 text-sm last:border-0">
                <span className="text-text">{h.summary}</span>
                <span className="shrink-0 text-xs text-dim">{timeAgo(h.occurredAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
