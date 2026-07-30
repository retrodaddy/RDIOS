"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createReportAction,
  deleteReportAction,
  getReportHistoryAction,
  updateReportDetailsAction,
} from "@/applications/reports/actions";
import {
  REPORT_CATEGORIES,
  REPORT_CATEGORY_LABELS,
  type Report,
  type ReportCategory,
  type ReportChart,
} from "@/applications/reports/types";
import type { Observation } from "@/applications/reports/analytics";
import type { HistoryEntry } from "@/os/attention/types";
import { Badge, Button, DataTable, EmptyState, useToast, type BadgeTone, type DataTableColumn } from "@/components/ui";

export type ReportsRosterPerson = { id: string; name: string };
export type ReportsProjectOption = { id: string; name: string };

const OBSERVATION_TONE: Record<Observation["category"], BadgeTone> = {
  people: "accent",
  work: "warning",
  finance: "error",
  community: "info",
  projects: "warning",
  documents: "error",
};

/** A single, minimal horizontal bar chart — the one visual shape every
 *  Report chart renders as, regardless of its declared `kind`. "Keep
 *  charts minimal... Numbers first, charts second," per the brief; a
 *  real bar is honest and legible for every count-shaped fact this
 *  domain produces, so a second and third renderer for line/pie were
 *  judged not worth the added surface for what a founder actually needs
 *  today. No chart library — plain inline SVG. */
function MiniBarChart({ chart }: { chart: ReportChart }) {
  const max = Math.max(1, ...chart.points.map((p) => p.value));
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs font-medium text-text">{chart.title}</p>
      <div className="mt-2 space-y-1.5">
        {chart.points.map((p) => (
          <div key={p.label} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 truncate text-dim">{p.label}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface/60">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(p.value / max) * 100}%` }} />
            </div>
            <span className="w-10 shrink-0 text-right tabular-nums text-text">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Reports & Analytics' board (M11) — two things, kept visibly separate
 *  the way the brief kept them conceptually separate: Analytics
 *  (observations, read-only, computed live) above, Reports (the saved,
 *  frozen list — the exact list/create-drawer/detail-drawer shape every
 *  prior board already established) below. */
export function ReportsBoard({
  canManage,
  initialReports,
  observations,
  roster,
  projects,
}: {
  canManage: boolean;
  initialReports: Report[];
  observations: Observation[];
  roster: ReportsRosterPerson[];
  projects: ReportsProjectOption[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const refresh = () => router.refresh();

  const selected = initialReports.find((r) => r.id === selectedId) ?? null;

  const personName = (id: string | null) => (id ? roster.find((p) => p.id === id)?.name ?? "Someone" : null);

  const columns: DataTableColumn<Report>[] = [
    { key: "title", header: "Title", sortable: true, sortValue: (r) => r.title, render: (r) => r.title },
    { key: "category", header: "Category", render: (r) => <Badge tone="neutral">{REPORT_CATEGORY_LABELS[r.category]}</Badge> },
    { key: "generatedAt", header: "Generated", sortable: true, sortValue: (r) => r.generatedAt, render: (r) => new Date(r.generatedAt).toLocaleString() },
    { key: "generatedBy", header: "By", render: (r) => personName(r.generatedByPersonId) ?? "Someone" },
  ];

  return (
    <div className="mt-8 space-y-10">
      <section>
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Analytics</h2>
        <p className="mt-1 text-sm text-muted">What deserves attention right now — observable facts, never opinions.</p>
        {observations.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing stands out right now.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {observations.map((o) => (
              <li key={o.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <Badge tone={OBSERVATION_TONE[o.category]}>{o.category}</Badge>
                <span className="text-text">{o.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">
            {initialReports.length} {initialReports.length === 1 ? "report" : "reports"}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCreating(true)}
            disabled={!canManage}
            title={canManage ? undefined : "Generating reports isn't your responsibility here."}
          >
            New report
          </Button>
        </div>

        <div className="mt-3">
          <DataTable
            columns={columns}
            rows={initialReports}
            rowKey={(r) => r.id}
            onRowClick={(r) => setSelectedId(r.id)}
            emptyTitle="Nothing generated yet"
            emptyDescription="A report is a frozen snapshot of what already happened — generate one whenever you need a record of where things stood."
          />
        </div>
      </section>

      {creating && (
        <CreateReportDrawer roster={roster} projects={projects} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); refresh(); }} />
      )}

      {selected && (
        <ReportDetailDrawer report={selected} canManage={canManage} personName={personName} onClose={() => setSelectedId(null)} onChanged={refresh} />
      )}
    </div>
  );
}

/* -------------------------------- Create drawer -------------------------------- */

function CreateReportDrawer({
  roster,
  projects,
  onClose,
  onCreated,
}: {
  roster: ReportsRosterPerson[];
  projects: ReportsProjectOption[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [category, setCategory] = useState<ReportCategory>("institution_overview");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [personId, setPersonId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("category", category);
      fd.set("title", title);
      fd.set("description", description);
      fd.set("dateFrom", dateFrom);
      fd.set("dateTo", dateTo);
      fd.set("personId", personId);
      fd.set("projectId", projectId);
      fd.set("status", status);
      fd.set("type", type);
      const r = await createReportAction(fd);
      if (!r.ok) return setErr(r.error ?? "Could not generate that report.");
      onCreated();
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="New report">
      <div className="os-anim-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="os-anim-sheet relative w-full max-w-md overflow-y-auto overflow-x-hidden rounded-t-2xl border border-border bg-elevated p-6 sm:max-h-[85vh] sm:rounded-2xl">
        <p className="font-display text-lg">New report</p>

        <label className="mt-4 block text-xs text-dim">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ReportCategory)}
          className="mt-1.5 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        >
          {REPORT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {REPORT_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title — optional, defaults to category + date"
          className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description — optional"
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />

        <p className="mt-4 text-xs text-dim">Filters — all optional</p>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="From date" className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="To date" className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        </div>
        <select value={personId} onChange={(e) => setPersonId(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent">
          <option value="">Any person</option>
          {roster.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent">
          <option value="">Any project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status — optional" className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
          <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Type — optional" className="w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent" />
        </div>

        {err && <p className="mt-2 text-sm text-error" role="alert">{err}</p>}

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={submit} disabled={pending}>
            {pending ? "Generating…" : "Generate"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Detail drawer -------------------------------- */

function ReportDetailDrawer({
  report,
  canManage,
  personName,
  onClose,
  onChanged,
}: {
  report: Report;
  canManage: boolean;
  personName: (id: string | null) => string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const toast = useToast();

  useEffect(() => {
    getReportHistoryAction(report.id).then(setHistory);
  }, [report.id]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, successMessage?: string, after?: () => void) => {
    setErr(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) return setErr(r.error ?? "Could not complete that.");
      if (successMessage) toast.notify("success", successMessage);
      onChanged();
      if (after) after();
      else getReportHistoryAction(report.id).then(setHistory);
    });
  };

  const appliedFilters = Object.entries(report.filters).filter(([, v]) => v);

  return (
    <div className="fixed inset-0 z-[75] flex justify-end" role="dialog" aria-modal="true" aria-label={report.title}>
      <div className="os-anim-backdrop absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="os-anim-drawer-right relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-elevated p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone="neutral">{REPORT_CATEGORY_LABELS[report.category]}</Badge>
            <h2 className="mt-1.5 font-display text-xl font-medium">{report.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-xs text-dim hover:text-text">
            Close
          </button>
        </div>

        {report.description && <p className="mt-2 text-sm text-muted">{report.description}</p>}

        <p className="mt-3 text-xs text-dim">
          Generated {new Date(report.generatedAt).toLocaleString()} by {personName(report.generatedByPersonId) ?? "someone"} — this snapshot is frozen and never
          regenerates.
        </p>

        {appliedFilters.length > 0 && (
          <p className="mt-1.5 text-xs text-dim">
            Filters: {appliedFilters.map(([k, v]) => `${k}: ${v}`).join(", ")}
          </p>
        )}

        {err && (
          <p className="mt-3 text-sm text-error" role="alert">
            {err}
          </p>
        )}

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Snapshot</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {report.snapshot.metrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-border p-3">
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-dim">{m.label}</p>
                <p className="mt-1 font-display text-lg">{m.value}</p>
                {m.sub && <p className="text-xs text-dim">{m.sub}</p>}
              </div>
            ))}
          </div>

          {report.snapshot.charts.length > 0 && (
            <div className="mt-2 space-y-2">
              {report.snapshot.charts.map((c) => (
                <MiniBarChart key={c.title} chart={c} />
              ))}
            </div>
          )}

          {report.snapshot.recentHistory.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-text">Recent events</p>
              <ul className="mt-1.5 space-y-1.5">
                {report.snapshot.recentHistory.map((h) => (
                  <li key={h.id} className="text-sm">
                    <p className="text-text">{h.summary}</p>
                    <p className="text-xs text-dim">{new Date(h.occurredAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Timeline</h3>
          {history === null ? (
            <p className="mt-2 text-sm text-muted">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nothing recorded yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <p className="text-text">{h.summary}</p>
                  <p className="text-xs text-dim">{new Date(h.occurredAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {editing ? (
          <section className="mt-6 border-t border-border pt-4">
            <EditReportForm
              report={report}
              pending={pending}
              onCancel={() => setEditing(false)}
              onSave={(fd) =>
                run(async () => {
                  const r = await updateReportDetailsAction(report.id, fd);
                  if (r.ok) setEditing(false);
                  return r;
                }, "Saved.")
              }
            />
          </section>
        ) : (
          canManage && (
            <div className="mt-6 flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
              {confirmingDelete ? (
                <>
                  <span className="ml-auto text-xs text-dim">Delete this report?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => run(() => deleteReportAction(report.id), "Deleted.", onClose)}
                    className="text-error hover:underline"
                  >
                    Confirm delete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)} className="ml-auto text-dim hover:text-error">
                  Delete
                </Button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EditReportForm({
  report,
  pending,
  onCancel,
  onSave,
}: {
  report: Report;
  pending: boolean;
  onCancel: () => void;
  onSave: (fd: FormData) => void;
}) {
  const [title, setTitle] = useState(report.title);
  const [description, setDescription] = useState(report.description ?? "");

  const submit = () => {
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    onSave(fd);
  };

  return (
    <>
      <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Edit</h3>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description" className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" disabled={pending || !title.trim()} onClick={submit}>
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </>
  );
}
