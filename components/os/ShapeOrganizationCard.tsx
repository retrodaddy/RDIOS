"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { shapeOrganizationAction, skipOrganizationShapeAction } from "@/os/attention/actions";
import type { AttentionItem } from "@/os/attention/types";

/**
 * "Shape your organization" — the smallest real implementation of the
 * frozen Act Now card. Opens inline, not a new page — per the Visual
 * Design System's drawer-over-navigation default and the Experience
 * Principles' Interruption Rule (asks for attention, never seizes it: the
 * background stays visible, closing loses nothing). No Organizational
 * Builder, no drag-and-drop — one free-text field, save or skip.
 */
export function ShapeOrganizationCard({ item }: { item: AttentionItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("description", description);
      const r = await shapeOrganizationAction(fd);
      if (!r.ok) return setErr(r.error ?? "Could not save.");
      setOpen(false);
      router.refresh();
    });
  };

  const skip = () => {
    setErr(null);
    start(async () => {
      const r = await skipOrganizationShapeAction();
      if (!r.ok) return setErr(r.error ?? "Could not skip.");
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface"
      >
        <div className="min-w-0">
          <p className="truncate text-sm text-text">{item.title}</p>
          <p className="text-xs text-dim">{item.meta}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-bright">{item.verb}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Shape your organization">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-t-2xl border border-border bg-bg p-6 shadow-2xl sm:rounded-2xl">
            <p className="font-display text-lg">Who reports to whom?</p>
            <p className="mt-1 text-sm text-dim">A rough shape is enough for now — names, roles, or a simple line like &quot;Priest reports to Trustees.&quot; You can always refine this later.</p>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              autoFocus
              placeholder="Describe how your institution is organized…"
              className="mt-4 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
            />

            {err && (
              <p className="mt-2 text-sm text-red-500" role="alert">
                {err}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={save}
                disabled={pending || !description.trim()}
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={skip} disabled={pending} className="px-3 py-2.5 text-sm text-dim hover:text-text disabled:opacity-50">
                Skip for now
              </button>
              <button type="button" onClick={() => setOpen(false)} className="ml-auto text-xs text-dim hover:text-text">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
