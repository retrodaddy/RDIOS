"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { offboardPersonAction } from "@/applications/people/actions";

/** Atomic Offboarding — closes every active Position and Affiliation for
 *  this person in this institution at once. This is the one action on the
 *  profile screen that reads as final to the person doing it, so per the
 *  Visual Design System it's the one thing here presented as a dialog, not
 *  a drawer. */
export function OffboardButton({ personId, personName }: { personId: string; personName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const offboard = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("personId", personId);
      const r = await offboardPersonAction(fd);
      if (!r.ok) return setErr(r.error ?? "Could not offboard.");
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-border px-3 py-1.5 text-xs text-dim transition-colors hover:border-red-500/40 hover:text-red-500"
      >
        Offboard
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Offboard">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-bg p-6 shadow-2xl">
            <p className="font-display text-lg">Offboard {personName}?</p>
            <p className="mt-2 text-sm text-dim">
              Every position and affiliation {personName} currently holds in this institution will be ended at once. This can&apos;t be undone by
              itself — they&apos;d need to be re-appointed individually.
            </p>

            {err && (
              <p className="mt-2 text-sm text-red-500" role="alert">
                {err}
              </p>
            )}

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={offboard}
                disabled={pending}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Offboarding…" : "Offboard"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="ml-auto text-xs text-dim hover:text-text">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
