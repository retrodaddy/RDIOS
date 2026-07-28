"use client";

import { useState, useTransition } from "react";
import { acceptInvitationAction } from "@/os/identity/actions";

export function AcceptButton({ membershipId }: { membershipId: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const accept = () => {
    setErr(null);
    start(async () => {
      const r = await acceptInvitationAction(membershipId);
      if (r && !r.ok) setErr(r.error ?? "Could not accept this invitation.");
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={accept}
        disabled={pending}
        className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Joining…" : "Accept & sign in"}
      </button>
      {err && (
        <p className="mt-3 text-sm text-red-500" role="alert">
          {err}
        </p>
      )}
    </div>
  );
}
