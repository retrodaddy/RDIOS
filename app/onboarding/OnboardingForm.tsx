"use client";

import { useState, useTransition } from "react";
import { createInstitutionAction } from "@/os/identity/actions";
import { INSTITUTION_TYPES, INSTITUTION_TYPE_LABELS } from "@/os/identity/types";
import type { InstitutionType } from "@/os/identity/types";
import { getTerminology } from "@/os/institution/terminology";

export function OnboardingForm() {
  const [institutionName, setInstitutionName] = useState("");
  const [institutionType, setInstitutionType] = useState<InstitutionType>("company");
  const terminology = getTerminology(institutionType);
  const [purpose, setPurpose] = useState("");
  const [founderName, setFounderName] = useState("");
  const [founderEmail, setFounderEmail] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("institutionName", institutionName);
      fd.set("institutionType", institutionType);
      fd.set("purpose", purpose);
      fd.set("founderName", founderName);
      fd.set("founderEmail", founderEmail);
      const r = await createInstitutionAction(fd);
      if (r && !r.ok) setErr(r.error ?? "Could not create your institution.");
    });
  };

  const field = "w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-accent";

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface/40 p-6">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-dim">Institution name</label>
        <input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder={terminology.institutionNameExample} className={field} autoFocus />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-dim">Institution type</label>
        <select value={institutionType} onChange={(e) => setInstitutionType(e.target.value as InstitutionType)} className={field}>
          {INSTITUTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {INSTITUTION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-dim">Purpose <span className="normal-case text-dim">— optional</span></label>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Why does this institution exist? You can always add this later."
          rows={2}
          className={`${field} resize-none`}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-dim">Your name</label>
        <input value={founderName} onChange={(e) => setFounderName(e.target.value)} placeholder="Your name" className={field} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-dim">Your email</label>
        <input type="email" value={founderEmail} onChange={(e) => setFounderEmail(e.target.value)} placeholder="you@institution.org" className={field} />
      </div>

      {err && (
        <p className="text-sm text-red-500" role="alert">
          {err}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={pending || !institutionName.trim() || !founderName.trim() || !founderEmail.trim()}
        className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Setting up…" : "Create institution"}
      </button>
    </div>
  );
}
