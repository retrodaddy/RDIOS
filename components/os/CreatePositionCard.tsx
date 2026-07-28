"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPositionAction } from "@/applications/people/actions";
import type { Position } from "@/applications/people/types";
import type { InstitutionType } from "@/os/identity/types";
import { getTerminology } from "@/os/institution/terminology";

/** Creating a Position is reversible (it can sit unfilled, or be archived
 *  later), so this is a drawer, not a dialog — per the Visual Design
 *  System's rule that dialogs are reserved only for irreversible actions.
 *  Single-parent `reportsToPositionId` only, per M3 scope; the real
 *  Organization Builder graph is M4. */
export function CreatePositionCard({ positions, institutionType }: { positions: Position[]; institutionType: InstitutionType }) {
  const terminology = getTerminology(institutionType);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [reportsTo, setReportsTo] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("reportsToPositionId", reportsTo);
      const r = await createPositionAction(fd);
      if (!r.ok) return setErr(r.error ?? "Could not create position.");
      setName("");
      setReportsTo("");
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-border bg-surface/40 px-4 py-2 text-sm text-text transition-colors hover:bg-surface"
      >
        Add a position
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Add a position">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-border bg-bg p-6 shadow-2xl sm:rounded-2xl">
            <p className="font-display text-lg">Add a position</p>
            <p className="mt-1 text-sm text-dim">A seat someone can hold — a title, and optionally who it reports to.</p>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder={`e.g. ${terminology.positionExample}`}
              className="mt-4 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
            />

            <select
              value={reportsTo}
              onChange={(e) => setReportsTo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
            >
              <option value="">Reports to no one (top-level)</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  Reports to {p.name}
                </option>
              ))}
            </select>

            {err && (
              <p className="mt-2 text-sm text-red-500" role="alert">
                {err}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={save}
                disabled={pending || !name.trim()}
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Adding…" : "Add"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="ml-auto text-xs text-dim hover:text-text">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
