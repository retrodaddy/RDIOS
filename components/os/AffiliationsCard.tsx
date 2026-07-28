"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addAffiliationAction, endAffiliationAction } from "@/applications/people/actions";
import type { Affiliation } from "@/applications/people/types";
import type { InstitutionType } from "@/os/identity/types";
import { getTerminology } from "@/os/institution/terminology";

/** Affiliation — a real, non-authority relationship, append-only per the
 *  frozen People Domain Review. Free-text label since Institution
 *  Configuration's type catalogs don't exist yet — the placeholder still
 *  suggests institution-true examples instead of a generic default. */
export function AffiliationsCard({
  personId,
  affiliations,
  institutionType,
}: {
  personId: string;
  affiliations: Affiliation[];
  institutionType: InstitutionType;
}) {
  const terminology = getTerminology(institutionType);
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [pending, start] = useTransition();

  const add = () => {
    if (!label.trim()) return;
    start(async () => {
      const fd = new FormData();
      fd.set("personId", personId);
      fd.set("label", label);
      await addAffiliationAction(fd);
      setLabel("");
      router.refresh();
    });
  };

  const end = (affiliationId: string) => {
    start(async () => {
      const fd = new FormData();
      fd.set("affiliationId", affiliationId);
      await endAffiliationAction(fd);
      router.refresh();
    });
  };

  const current = affiliations.filter((a) => !a.endedAt);
  const past = affiliations.filter((a) => a.endedAt);

  return (
    <section className="mt-10">
      <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Affiliations</h2>

      {current.length === 0 && past.length === 0 ? (
        <p className="mt-3 rounded-xl border border-border bg-surface/40 px-5 py-6 text-sm text-muted">No affiliations yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {current.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <p className="truncate text-sm text-text">{a.label}</p>
              <button type="button" onClick={() => end(a.id)} disabled={pending} className="shrink-0 text-xs text-dim hover:text-text disabled:opacity-50">
                End
              </button>
            </li>
          ))}
          {past.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3.5 opacity-60">
              <p className="truncate text-sm text-text">{a.label}</p>
              <span className="shrink-0 text-xs text-dim">Ended</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={`e.g. ${terminology.affiliationExample}`}
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface/40 px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={add}
          disabled={pending || !label.trim()}
          className="shrink-0 rounded-xl bg-accent px-3 py-2 text-xs font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </section>
  );
}
