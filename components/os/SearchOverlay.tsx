"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchAction } from "@/engines/search/actions";
import {
  SEARCH_APPLICATIONS,
  SEARCH_APPLICATION_LABELS,
  type SearchApplication,
  type SearchFilters,
  type SearchResult,
} from "@/engines/search/types";
import { Badge, EmptyState, Skeleton } from "@/components/ui";

/**
 * Universal Search's own UI (M12) — the one overlay every destination on
 * the platform shares, reusing exactly the backdrop/panel shape every
 * create drawer already uses, never a new visual language. Selecting a
 * result never renders anything here beyond the result row itself —
 * clicking navigates straight into the real, existing experience
 * (`result.href`, already a deep link into the owning application's own
 * drawer) and this overlay closes. Search never narrates to History,
 * per the brief — nothing here calls `recordHistory`.
 */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [application, setApplication] = useState<SearchApplication | "">("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults(null);
    setApplication("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const filters: SearchFilters = {
      application: application || null,
      type: null,
      status: status || null,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    };
    const handle = setTimeout(() => {
      start(async () => {
        const r = await searchAction(query, filters);
        setResults(r);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [query, application, status, dateFrom, dateTo, open, start]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const openResult = (r: SearchResult) => {
    onClose();
    router.push(r.href);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-16 sm:pt-24" role="dialog" aria-modal="true" aria-label="Search">
      <div className="os-anim-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="os-anim-sheet relative mx-4 flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-elevated shadow-xl">
        <div className="border-b border-border p-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, work, money, projects, documents…"
            className="w-full bg-transparent text-lg text-text outline-none placeholder:text-dim"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={application}
              onChange={(e) => setApplication(e.target.value as SearchApplication | "")}
              className="rounded-lg border border-border bg-surface/40 px-2 py-1.5 text-xs text-text outline-none focus:border-accent"
            >
              <option value="">All applications</option>
              {SEARCH_APPLICATIONS.map((a) => (
                <option key={a} value={a}>
                  {SEARCH_APPLICATION_LABELS[a]}
                </option>
              ))}
            </select>
            <input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Status — optional"
              className="w-32 rounded-lg border border-border bg-surface/40 px-2 py-1.5 text-xs text-text outline-none focus:border-accent"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From date"
              className="rounded-lg border border-border bg-surface/40 px-2 py-1.5 text-xs text-text outline-none focus:border-accent"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="To date"
              className="rounded-lg border border-border bg-surface/40 px-2 py-1.5 text-xs text-text outline-none focus:border-accent"
            />
            <button type="button" onClick={onClose} className="ml-auto shrink-0 text-xs text-dim hover:text-text">
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {!query.trim() ? (
            <p className="p-4 text-sm text-muted">Start typing to search across this institution — people, work, money, projects, documents, and more.</p>
          ) : pending && results === null ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : results && results.length === 0 ? (
            <div className="p-2">
              <EmptyState title="Nothing found" description="Try a different term, or clear a filter." />
            </div>
          ) : (
            <ul className="space-y-1.5 p-2">
              {(results ?? []).map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => openResult(r)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-accent"
                  >
                    <span className="text-xl" aria-hidden="true">
                      {r.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm text-text">{r.title}</span>
                        <Badge tone="neutral">{r.type}</Badge>
                      </div>
                      {r.description && <p className="truncate text-xs text-dim">{r.description}</p>}
                    </div>
                    <div className="shrink-0 text-right">
                      {r.status && <Badge tone="accent">{r.status}</Badge>}
                      <p className="mt-1 text-[0.65rem] text-dim">{new Date(r.lastUpdatedAt).toLocaleDateString()}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
