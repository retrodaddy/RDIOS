"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { grantCapabilityAction, revokeCapabilityAction } from "@/applications/people/actions";
import type { Capability } from "@/applications/people/types";
import type { InstitutionType } from "@/os/identity/types";
import { getTerminology } from "@/os/institution/terminology";

/** Capability — current qualification, deliberately NOT append-only per the
 *  frozen Capability Domain Reconsideration. Revoking removes it outright,
 *  no "ended" state to preserve. */
export function CapabilitiesCard({
  personId,
  capabilities,
  institutionType,
}: {
  personId: string;
  capabilities: Capability[];
  institutionType: InstitutionType;
}) {
  const terminology = getTerminology(institutionType);
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [pending, start] = useTransition();

  const grant = () => {
    if (!label.trim()) return;
    start(async () => {
      const fd = new FormData();
      fd.set("personId", personId);
      fd.set("label", label);
      await grantCapabilityAction(fd);
      setLabel("");
      router.refresh();
    });
  };

  const revoke = (capabilityId: string) => {
    start(async () => {
      const fd = new FormData();
      fd.set("capabilityId", capabilityId);
      await revokeCapabilityAction(fd);
      router.refresh();
    });
  };

  return (
    <section className="mt-10">
      <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Capabilities</h2>

      {capabilities.length === 0 ? (
        <p className="mt-3 rounded-xl border border-border bg-surface/40 px-5 py-6 text-sm text-muted">No capabilities recorded yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {capabilities.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <p className="truncate text-sm text-text">{c.label}</p>
              <button type="button" onClick={() => revoke(c.id)} disabled={pending} className="shrink-0 text-xs text-dim hover:text-text disabled:opacity-50">
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={`e.g. ${terminology.capabilityExample}`}
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface/40 px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={grant}
          disabled={pending || !label.trim()}
          className="shrink-0 rounded-xl bg-accent px-3 py-2 text-xs font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Grant
        </button>
      </div>
    </section>
  );
}
