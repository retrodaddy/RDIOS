"use client";

import { useState, useTransition } from "react";
import { acceptInvitationAction } from "@/os/identity/actions";
import { Button } from "@/components/ui";

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
      <Button onClick={accept} disabled={pending} className="px-6">
        {pending ? "Joining…" : "Accept & sign in"}
      </Button>
      {err && (
        <p className="mt-3 text-sm text-error" role="alert">
          {err}
        </p>
      )}
    </div>
  );
}
