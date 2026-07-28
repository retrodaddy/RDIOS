"use client";

import { useState, useTransition } from "react";
import { inviteAction } from "@/os/identity/actions";

export function InviteForm({ canInvite }: { canInvite: boolean }) {
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
      if (!r.ok) return setErr(r.error ?? "Could not send the invitation.");
      setName("");
      setEmail("");
      setLink(`${window.location.origin}/invite/${r.membershipId}`);
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
        <button
          type="button"
          onClick={submit}
          disabled={pending || !email.trim() || !canInvite}
          className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Inviting…" : "Invite"}
        </button>
      </div>
      {!canInvite && <p className="mt-2 text-sm text-dim">Inviting new people isn&apos;t your responsibility here.</p>}
      {err && (
        <p className="mt-2 text-sm text-red-500" role="alert">
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
