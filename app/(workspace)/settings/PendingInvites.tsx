"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelInvitationAction } from "@/os/identity/actions";
import { timeAgo } from "@/os/attention/timeAgo";
import { useToast } from "@/components/ui";

export type PendingInvite = {
  membershipId: string;
  name: string;
  email: string;
  createdAt: string;
  expiresAt: string | null;
};

/** Every invite link the founder has ever generated used to exist only in
 *  the instant it was created — gone from the screen the moment a second
 *  person was invited. This is where they all stay findable, per
 *  Implementation Sprint 1 §1: a founder inviting several people in one
 *  sitting shouldn't lose track of the ones they haven't sent yet. */
export function PendingInvites({ invites, canInvite }: { invites: PendingInvite[]; canInvite: boolean }) {
  const router = useRouter();
  const { notify } = useToast();
  const [pending, start] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (invites.length === 0) return null;

  const copy = (membershipId: string) => {
    const link = `${window.location.origin}/invite/${membershipId}`;
    navigator.clipboard?.writeText(link).then(() => {
      setCopiedId(membershipId);
      setTimeout(() => setCopiedId((id) => (id === membershipId ? null : id)), 1600);
    });
  };

  const cancel = (membershipId: string, name: string) => {
    setErr(null);
    start(async () => {
      const r = await cancelInvitationAction(membershipId);
      if (!r.ok) {
        setErr(r.error ?? "Could not cancel this invitation.");
        notify("error", r.error ?? "Could not cancel this invitation.");
        return;
      }
      notify("info", `${name}'s invitation was cancelled.`);
      router.refresh();
    });
  };

  return (
    <section className="mt-6 rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="font-display text-lg">Pending invitations</h2>
      <p className="mt-1 text-sm text-dim">Not yet accepted — the link still works until you cancel it or it expires.</p>
      <ul className="mt-4 space-y-2">
        {invites.map((invite) => {
          const expired = invite.expiresAt ? new Date(invite.expiresAt).getTime() < Date.now() : false;
          return (
            <li key={invite.membershipId} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-text">{invite.name}</p>
                <p className="truncate text-xs text-dim">
                  {invite.email} · invited {timeAgo(invite.createdAt)}
                  {expired ? " · expired" : invite.expiresAt ? ` · expires ${new Date(invite.expiresAt).toLocaleDateString()}` : ""}
                </p>
              </div>
              {canInvite && (
                <div className="flex shrink-0 items-center gap-3 text-xs">
                  <button type="button" onClick={() => copy(invite.membershipId)} className="text-dim hover:text-text">
                    {copiedId === invite.membershipId ? "Copied" : "Copy link"}
                  </button>
                  <button type="button" disabled={pending} onClick={() => cancel(invite.membershipId, invite.name)} className="text-dim hover:text-error disabled:opacity-50">
                    Cancel
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {err && (
        <p className="mt-2 text-sm text-error" role="alert">
          {err}
        </p>
      )}
    </section>
  );
}
