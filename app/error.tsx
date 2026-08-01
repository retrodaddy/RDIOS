"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/** The universal backstop for anything thrown below the root layout —
 *  most concretely, a real Postgres failure (connection drop, timeout)
 *  bubbling up from a provider that previously could never fail (the
 *  mock stores were synchronous, in-memory, and could not error). Every
 *  primary write action still handles its own DbError inline and returns
 *  a friendly `{ ok: false, error }` for the toast; this exists for
 *  whatever isn't caught there — a transient failure during a page's own
 *  data load, or any error class this pass didn't anticipate — so a
 *  person always sees a coherent, on-brand message and a way back, never
 *  Next.js's raw digest page. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled error reached the root boundary:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">Something went wrong</p>
      <h1 className="mt-2 font-display text-2xl font-medium">That didn&apos;t save correctly</h1>
      <p className="mt-3 text-sm text-muted">
        A connection problem interrupted this. Nothing you had open is lost — try again, and if it keeps happening,
        let your team know.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="primary" onClick={() => reset()}>
          Try again
        </Button>
        <Button variant="secondary" onClick={() => (window.location.href = "/home")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
