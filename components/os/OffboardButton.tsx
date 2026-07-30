"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { offboardPersonAction } from "@/applications/people/actions";
import { Button, useToast } from "@/components/ui";

/** Atomic Offboarding — closes every active Position and Affiliation for
 *  this person in this institution at once. This is the one action on the
 *  profile screen that reads as final to the person doing it, so per the
 *  Visual Design System it's the one thing here presented as a dialog, not
 *  a drawer. */
export function OffboardButton({
  personId,
  personName,
  canOffboard,
}: {
  personId: string;
  personName: string;
  canOffboard: boolean;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const offboard = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("personId", personId);
      const r = await offboardPersonAction(fd);
      if (!r.ok) {
        setErr(r.error ?? "Could not offboard.");
        notify("error", r.error ?? "Could not offboard.");
        return;
      }
      setOpen(false);
      notify("success", `${personName} has been offboarded — their access has ended.`);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!canOffboard}
        title={canOffboard ? undefined : "Offboarding isn't your responsibility here."}
        className="rounded-xl border border-border px-3 py-1.5 text-xs text-dim transition-colors duration-fast ease-os-out hover:border-error/40 hover:text-error disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-dim"
      >
        Offboard
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Offboard">
          <div className="os-anim-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="os-anim-dialog relative w-full max-w-sm rounded-2xl border border-border bg-elevated p-6">
            <p className="font-display text-lg">Offboard {personName}?</p>
            <p className="mt-2 text-sm text-dim">
              Every position and affiliation {personName} currently holds in this institution will be ended at once. This can&apos;t be undone by
              itself — they&apos;d need to be re-appointed individually.
            </p>

            {err && (
              <p className="mt-2 text-sm text-error" role="alert">
                {err}
              </p>
            )}

            <div className="mt-5 flex items-center gap-2">
              <Button variant="danger" onClick={offboard} disabled={pending}>
                {pending ? "Offboarding…" : "Offboard"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="ml-auto">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
