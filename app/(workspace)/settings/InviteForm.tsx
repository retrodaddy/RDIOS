"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteAction } from "@/os/identity/actions";
import { Button, useToast } from "@/components/ui";

export function InviteForm({ canInvite }: { canInvite: boolean }) {
  const router = useRouter();
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const field = "flex-1 min-w-[10rem] rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-accent";

  const submit = () => {
    setErr(null);
    setLink(null);
    start(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("email", email);
      const r = await inviteAction(fd);
      if (!r.ok) {
        setErr(r.error ?? "Could not send the invitation.");
        notify("error", r.error ?? "Could not send the invitation.");
        return;
      }
      const invitedName = name || email;
      setName("");
      setEmail("");
      setLink(`${window.location.origin}/invite/${r.membershipId}`);
      notify("success", `${invitedName} invited — link ready below.`);
      // The new invite needs to show up in Pending invitations right away —
      // without this, a founder inviting several people in one sitting
      // would see the link but not the person until they happened to
      // reload, exactly the "does this follow through" trust question this
      // sprint is about.
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Their name"
          disabled={!canInvite}
          className={`${field} disabled:opacity-50`}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="their@email.com"
          disabled={!canInvite}
          className={`${field} disabled:opacity-50`}
        />
        <Button onClick={submit} disabled={pending || !email.trim() || !canInvite} className="shrink-0">
          {pending ? "Inviting…" : "Invite"}
        </Button>
      </div>
      {!canInvite && <p className="mt-2 text-sm text-dim">Inviting new people isn&apos;t your responsibility here.</p>}
      {err && (
        <p className="mt-2 text-sm text-error" role="alert">
          {err}
        </p>
      )}
      {link && (
        <p className="mt-2 text-sm text-muted">
          No email delivery yet — share this link directly:{" "}
          <a href={link} className="text-accent-bright hover:underline">
            {link}
          </a>
        </p>
      )}
    </div>
  );
}
