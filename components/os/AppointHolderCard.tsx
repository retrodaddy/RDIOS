"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { appointHolderAction, endHolderAction } from "@/applications/people/actions";
import { APPOINTMENT_TYPES, APPOINTMENT_TYPE_LABELS } from "@/applications/people/types";
import type { AppointmentType, Position, PositionHolder } from "@/applications/people/types";

type Holding = { holder: PositionHolder; position: Position | null };

/** Appointing/ending is the append-only history the frozen People Domain
 *  Review requires — ending never deletes, it closes. Reversible in the
 *  sense that a new appointment can always follow, so this stays a drawer
 *  control, not a confirmation dialog. */
export function AppointHolderCard({
  personId,
  availablePositions,
  current,
  past,
}: {
  personId: string;
  availablePositions: Position[];
  current: Holding[];
  past: Holding[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [positionId, setPositionId] = useState("");
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("permanent");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const appoint = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("personId", personId);
      fd.set("positionId", positionId);
      fd.set("appointmentType", appointmentType);
      const r = await appointHolderAction(fd);
      if (!r.ok) return setErr(r.error ?? "Could not appoint.");
      setPositionId("");
      setOpen(false);
      router.refresh();
    });
  };

  const end = (holderId: string) => {
    start(async () => {
      const fd = new FormData();
      fd.set("holderId", holderId);
      await endHolderAction(fd);
      router.refresh();
    });
  };

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Positions</h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-border bg-surface/40 px-3 py-1.5 text-xs text-text transition-colors hover:bg-surface"
        >
          Appoint
        </button>
      </div>

      {current.length === 0 && past.length === 0 ? (
        <p className="mt-3 rounded-xl border border-border bg-surface/40 px-5 py-6 text-sm text-muted">Holds no position yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {current.map(({ holder, position }) => (
            <li key={holder.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-text">{position?.name ?? "Unknown position"}</p>
                <p className="text-xs text-dim">{APPOINTMENT_TYPE_LABELS[holder.appointmentType]}</p>
              </div>
              <button type="button" onClick={() => end(holder.id)} disabled={pending} className="shrink-0 text-xs text-dim hover:text-text disabled:opacity-50">
                End
              </button>
            </li>
          ))}
          {past.map(({ holder, position }) => (
            <li key={holder.id} className="flex items-center justify-between gap-4 px-5 py-3.5 opacity-60">
              <div className="min-w-0">
                <p className="truncate text-sm text-text">{position?.name ?? "Unknown position"}</p>
                <p className="text-xs text-dim">Ended</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Appoint to a position">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-border bg-bg p-6 shadow-2xl sm:rounded-2xl">
            <p className="font-display text-lg">Appoint to a position</p>

            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              autoFocus
              className="mt-4 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
            >
              <option value="">Choose a position…</option>
              {availablePositions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
              className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
            >
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {APPOINTMENT_TYPE_LABELS[t]}
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
                onClick={appoint}
                disabled={pending || !positionId}
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Appointing…" : "Appoint"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="ml-auto text-xs text-dim hover:text-text">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
