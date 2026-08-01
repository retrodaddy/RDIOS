"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptRecommendationAction, deferRecommendationAction, dismissRecommendationAction } from "@/engines/tamizhi/actions";
import { TAMIZHI_CONFIDENCE_LABELS, type Recommendation, type TamizhiConfidence } from "@/engines/tamizhi/types";
import { Badge, useToast, type BadgeTone } from "@/components/ui";

const CONFIDENCE_TONE: Record<TamizhiConfidence, BadgeTone> = {
  high: "success",
  medium: "warning",
  low: "neutral",
};

/**
 * "Add one new section. Tamizhi Observations. Maximum three visible.
 * Same visual language as Attention." Reuses Act Now's own row shape —
 * no chat window, no avatar, no typing animation, no "How can I help?"
 * Every row is a Recommendation, never an action Tamizhi took; the only
 * verbs a person sees are Accept/Dismiss/Defer, and choosing one only
 * ever records that person's own decision (`engines/tamizhi/actions.ts`)
 * — Tamizhi itself never executes anything.
 */
export function TamizhiObservations({ recommendations }: { recommendations: Recommendation[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();
  const toast = useToast();

  if (recommendations.length === 0) return null;

  const decide = (id: string, action: (id: string) => Promise<{ ok: boolean; error?: string }>, successMessage: string) => {
    setPendingId(id);
    start(async () => {
      const r = await action(id);
      setPendingId(null);
      if (!r.ok) return toast.notify("error", r.error ?? "Could not record that.");
      toast.notify("success", successMessage);
      router.refresh();
    });
  };

  return (
    <section className="mt-12">
      <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Tamizhi Observations</h2>
      <ul className="mt-3 space-y-3">
        {recommendations.map((r) => (
          <li key={r.id} className="rounded-xl border border-border bg-surface/40 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-text">{r.title}</p>
                <p className="mt-1 text-xs text-dim">{r.explanation}</p>
              </div>
              <Badge tone={CONFIDENCE_TONE[r.confidence]}>{TAMIZHI_CONFIDENCE_LABELS[r.confidence]}</Badge>
            </div>

            {r.relatedRecords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.relatedRecords.slice(0, 4).map((rel, i) => (
                  <a
                    key={`${rel.href}-${i}`}
                    href={rel.href}
                    className="truncate rounded-full border border-border px-2.5 py-0.5 text-xs text-dim hover:text-text"
                  >
                    {rel.title}
                  </a>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                disabled={pendingId === r.id}
                onClick={() => decide(r.id, acceptRecommendationAction, "Accepted.")}
                className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-bright hover:bg-accent/20 disabled:opacity-50"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={pendingId === r.id}
                onClick={() => decide(r.id, deferRecommendationAction, "Deferred.")}
                className="rounded-full border border-border px-3 py-1 text-xs text-dim hover:text-text disabled:opacity-50"
              >
                Defer
              </button>
              <button
                type="button"
                disabled={pendingId === r.id}
                onClick={() => decide(r.id, dismissRecommendationAction, "Dismissed.")}
                className="ml-auto rounded-full border border-border px-3 py-1 text-xs text-dim hover:text-error disabled:opacity-50"
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
