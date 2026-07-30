"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/os/identity/actions";
import { Button } from "@/components/ui";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("email", email);
      const r = await loginAction(fd);
      if (r && !r.ok) setErr(r.error ?? "Could not sign in.");
    });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface/40 p-6">
      <label className="block text-xs uppercase tracking-wide text-dim">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && email.trim() && submit()}
        placeholder="you@institution.org"
        autoFocus
        className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
      />
      {err && (
        <p className="text-sm text-error" role="alert">
          {err}
        </p>
      )}
      <Button onClick={submit} disabled={pending || !email.trim()} className="w-full">
        {pending ? "Signing in…" : "Continue"}
      </Button>
      <p className="text-center text-xs text-dim">Just your email for now — no password needed yet.</p>
    </div>
  );
}
