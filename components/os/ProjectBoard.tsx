"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addProjectMemberAction,
  archiveProjectAction,
  completeProjectAction,
  createProjectAction,
  getProjectHistoryAction,
  removeProjectMemberAction,
  setProjectHealthAction,
  setProjectOwnerAction,
  setProjectStageAction,
  updateProjectDetailsAction,
} from "@/applications/projects/actions";
import {
  DEFAULT_PROJECT_STAGES,
  PROJECT_HEALTHS,
  PROJECT_HEALTH_LABELS,
  PROJECT_MEMBER_ROLES,
  PROJECT_MEMBER_ROLE_LABELS,
  PROJECT_PRIORITIES,
  PROJECT_PRIORITY_LABELS,
  type Project,
  type ProjectHealth,
  type ProjectMemberRole,
  type ProjectPriority,
} from "@/applications/projects/types";
import { setWorkItemProjectAction } from "@/applications/work/actions";
import type { WorkItem } from "@/applications/work/types";
import { setAssetProjectAction, setTransactionProjectAction } from "@/applications/finance/actions";
import type { Asset, FinanceTransaction } from "@/applications/finance/types";
import { setContactProjectAction } from "@/applications/community/actions";
import type { Contact } from "@/applications/community/types";
import type { HistoryEntry } from "@/os/attention/types";
import { Badge, Button, DataTable, EmptyState, useToast, type BadgeTone, type DataTableColumn } from "@/components/ui";

export type ProjectRosterPerson = { id: string; name: string };

const HEALTH_TONE: Record<ProjectHealth, BadgeTone> = {
  on_track: "success",
  at_risk: "warning",
  off_track: "error",
};

const PRIORITY_TONE: Record<ProjectPriority, BadgeTone> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  critical: "error",
};

function stageTone(stage: string): BadgeTone {
  if (stage === "Blocked") return "error";
  if (stage === "Completed" || stage === "Archived") return "neutral";
  return "accent";
}

/** Projects' board (M9) — the exact shape CommunityBoard/WorkBoard/
 *  MoneyBoard already established: one list, one create drawer, one
 *  detail drawer. The one real addition every prior board didn't need is
 *  the "What's happening" section — the live, functional convergence the
 *  M9 brief asks for, not a placeholder: existing Work Items, Transactions,
 *  Assets, and Contacts can be attached to or detached from a Project
 *  right here, without duplicating any of those applications' own
 *  create/manage flows. */
export function ProjectBoard({
  canManage,
  initialProjects,
  roster,
  workItems,
  transactions,
  assets,
  contacts,
  initialSelectedId,
}: {
  canManage: boolean;
  initialProjects: Project[];
  roster: ProjectRosterPerson[];
  workItems: WorkItem[];
  transactions: FinanceTransaction[];
  assets: Asset[];
  contacts: Contact[];
  /** Universal Search's own deep-link (M12) — opens straight to this
   *  Project's existing drawer, never a duplicate screen. */
  initialSelectedId?: string | null;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);

  // Universal Search (M12) — see WorkBoard's identical effect for why
  // this is needed beyond the useState initializer.
  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);
  const refresh = () => router.refresh();

  const active = initialProjects.filter((p) => p.status === "active");
  const selected = initialProjects.find((p) => p.id === selectedId) ?? null;

  const personName = (id: string | null) => (id ? roster.find((p) => p.id === id)?.name ?? "Someone" : null);

  const columns: DataTableColumn<Project>[] = [
    { key: "name", header: "Name", sortable: true, sortValue: (r) => r.name, render: (r) => r.name },
    { key: "stage", header: "Stage", render: (r) => <Badge tone={stageTone(r.stage)}>{r.stage}</Badge> },
    { key: "priority", header: "Priority", render: (r) => <Badge tone={PRIORITY_TONE[r.priority]}>{PROJECT_PRIORITY_LABELS[r.priority]}</Badge> },
    { key: "health", header: "Health", render: (r) => <Badge tone={HEALTH_TONE[r.health]}>{PROJECT_HEALTH_LABELS[r.health]}</Badge> },
    { key: "owner", header: "Owner", render: (r) => personName(r.ownerPersonId) ?? <span className="text-dim">Unassigned</span> },
    {
      key: "targetDate",
      header: "Target",
      render: (r) => (r.targetDate ? new Date(r.targetDate).toLocaleDateString() : <span className="text-dim">—</span>),
    },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">
          {active.length} active {active.length === 1 ? "project" : "projects"}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCreating(true)}
          disabled={!canManage}
          title={canManage ? undefined : "Managing projects isn't your responsibility here."}
        >
          New project
        </Button>
      </div>

      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={active}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelectedId(r.id)}
          emptyTitle="Nothing underway yet"
          emptyDescription="The real efforts this institution is carrying out — each with a beginning, an end, and someone responsible for getting from one to the other — belong here."
        />
      </div>

      {creating && (
        <CreateProjectDrawer roster={roster} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); refresh(); }} />
      )}

      {selected && (
        <ProjectDetailDrawer
          project={selected}
          canManage={canManage}
          roster={roster}
          workItems={workItems}
          transactions={transactions}
          assets={assets}
          contacts={contacts}
          onClose={() => setSelectedId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

/* -------------------------------- Create drawer -------------------------------- */

function CreateProjectDrawer({
  roster,
  onClose,
  onCreated,
}: {
  roster: ProjectRosterPerson[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>("medium");
  const [ownerPersonId, setOwnerPersonId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("description", description);
      fd.set("purpose", purpose);
      fd.set("priority", priority);
      fd.set("ownerPersonId", ownerPersonId);
      fd.set("startDate", startDate);
      fd.set("targetDate", targetDate);
      const r = await createProjectAction(fd);
      if (!r.ok) return setErr(r.error ?? "Could not start that project.");
      onCreated();
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="New project">
      <div className="os-anim-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="os-anim-sheet relative w-full max-w-md overflow-y-auto overflow-x-hidden rounded-t-2xl border border-border bg-elevated p-6 sm:max-h-[85vh] sm:rounded-2xl">
        <p className="font-display text-lg">New project</p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          placeholder="Name — e.g. Annual Festival"
          className="mt-4 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description — optional"
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Purpose — why this matters, one sentence — optional"
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />

        <p className="mt-4 text-xs text-dim">Priority</p>
        <div className="mt-1.5 grid grid-cols-4 gap-2">
          {PROJECT_PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded-lg px-2 py-1.5 text-xs font-medium ${priority === p ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
            >
              {PROJECT_PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs text-dim">Owner — optional</label>
        <select
          value={ownerPersonId}
          onChange={(e) => setOwnerPersonId(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        >
          <option value="">No owner yet</option>
          {roster.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-dim">Start date — optional</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-dim">Target date — optional</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
            />
          </div>
        </div>

        {err && <p className="mt-2 text-sm text-error" role="alert">{err}</p>}

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={submit} disabled={pending || !name.trim()}>
            {pending ? "Starting…" : "Start"}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-dim">{label}</span>
      <span className="text-right text-text">{value}</span>
    </div>
  );
}

function ProjectDetailDrawer({
  project,
  canManage,
  roster,
  workItems,
  transactions,
  assets,
  contacts,
  onClose,
  onChanged,
}: {
  project: Project;
  canManage: boolean;
  roster: ProjectRosterPerson[];
  workItems: WorkItem[];
  transactions: FinanceTransaction[];
  assets: Asset[];
  contacts: Contact[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<ProjectMemberRole>("member");
  const [attachWorkId, setAttachWorkId] = useState("");
  const [attachTransactionId, setAttachTransactionId] = useState("");
  const [attachAssetId, setAttachAssetId] = useState("");
  const [attachContactId, setAttachContactId] = useState("");
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const toast = useToast();

  useEffect(() => {
    getProjectHistoryAction(project.id).then(setHistory);
  }, [project.id]);

  const personName = (id: string | null) => (id ? roster.find((p) => p.id === id)?.name ?? "Someone" : null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, successMessage?: string) => {
    setErr(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) return setErr(r.error ?? "Could not complete that.");
      if (successMessage) toast.notify("success", successMessage);
      onChanged();
      getProjectHistoryAction(project.id).then(setHistory);
    });
  };

  const linkedWork = workItems.filter((w) => w.projectId === project.id);
  const availableWork = workItems.filter((w) => !w.projectId);
  const linkedTransactions = transactions.filter((t) => t.projectId === project.id);
  const availableTransactions = transactions.filter((t) => !t.projectId);
  const linkedAssets = assets.filter((a) => a.projectId === project.id);
  const availableAssets = assets.filter((a) => !a.projectId);
  const linkedContacts = contacts.filter((c) => c.projectId === project.id);
  const availableContacts = contacts.filter((c) => !c.projectId);

  return (
    <div className="fixed inset-0 z-[75] flex justify-end" role="dialog" aria-modal="true" aria-label={project.name}>
      <div className="os-anim-backdrop absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="os-anim-drawer-right relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-elevated p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Badge tone={stageTone(project.stage)}>{project.stage}</Badge>
              <Badge tone={PRIORITY_TONE[project.priority]}>{PROJECT_PRIORITY_LABELS[project.priority]}</Badge>
              <Badge tone={HEALTH_TONE[project.health]}>{PROJECT_HEALTH_LABELS[project.health]}</Badge>
            </div>
            <h2 className="mt-1.5 font-display text-xl font-medium">{project.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-xs text-dim hover:text-text">
            Close
          </button>
        </div>

        {project.description && <p className="mt-2 text-sm text-muted">{project.description}</p>}
        {project.purpose && (
          <p className="mt-2 text-sm italic text-dim">&ldquo;{project.purpose}&rdquo;</p>
        )}

        <section className="mt-6 space-y-3 text-sm">
          <Row label="Owner" value={personName(project.ownerPersonId) ?? "Unassigned"} />
          <Row label="Start" value={project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"} />
          <Row label="Target" value={project.targetDate ? new Date(project.targetDate).toLocaleDateString() : "—"} />
          <Row label="Completed" value={project.completedAt ? new Date(project.completedAt).toLocaleDateString() : "—"} />
        </section>

        {canManage && (
          <section className="mt-6">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Stage</h3>
            <input
              defaultValue={project.stage}
              list="project-stage-suggestions"
              disabled={pending}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== project.stage) run(() => setProjectStageAction(project.id, v));
              }}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
            />
            <datalist id="project-stage-suggestions">
              {DEFAULT_PROJECT_STAGES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>

            <h3 className="mt-4 text-[0.65rem] uppercase tracking-[0.2em] text-dim">Health</h3>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {PROJECT_HEALTHS.map((h) => (
                <button
                  key={h}
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => setProjectHealthAction(project.id, h))}
                  className={`rounded-lg px-2 py-1.5 text-xs font-medium ${project.health === h ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
                >
                  {PROJECT_HEALTH_LABELS[h]}
                </button>
              ))}
            </div>

            <h3 className="mt-4 text-[0.65rem] uppercase tracking-[0.2em] text-dim">Owner</h3>
            <select
              defaultValue={project.ownerPersonId ?? ""}
              disabled={pending}
              onChange={(e) => run(() => setProjectOwnerAction(project.id, e.target.value || null))}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
            >
              <option value="">Unassigned</option>
              {roster.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </section>
        )}

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Members</h3>
            {canManage && (
              <button type="button" onClick={() => setAddingMember((v) => !v)} className="text-xs text-accent-bright hover:underline">
                + Add
              </button>
            )}
          </div>
          {project.members.length === 0 ? (
            <p className="mt-1.5 text-sm text-muted">No members yet, beyond the owner.</p>
          ) : (
            <ul className="mt-1.5 space-y-1.5">
              {project.members.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge tone={m.role === "observer" ? "neutral" : "accent"}>{PROJECT_MEMBER_ROLE_LABELS[m.role]}</Badge>
                    <span className="truncate text-text">{personName(m.personId)}</span>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => removeProjectMemberAction(project.id, m.id), "Removed.")}
                      className="shrink-0 text-xs text-dim hover:text-error disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {addingMember && (
            <div className="mt-2 rounded-lg border border-border p-2.5">
              <select
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
              >
                <option value="">Choose a person</option>
                {roster
                  .filter((p) => p.id !== project.ownerPersonId && !project.members.some((m) => m.personId === p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  {PROJECT_MEMBER_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewMemberRole(r)}
                      className={`rounded-lg px-2 py-1.5 text-xs font-medium ${newMemberRole === r ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
                    >
                      {PROJECT_MEMBER_ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  disabled={pending || !newMemberId}
                  onClick={() =>
                    run(async () => {
                      const r = await addProjectMemberAction(project.id, newMemberId, newMemberRole);
                      if (r.ok) {
                        setNewMemberId("");
                        setAddingMember(false);
                      }
                      return r;
                    })
                  }
                  className="ml-auto shrink-0"
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </section>

        {err && (
          <p className="mt-3 text-sm text-error" role="alert">
            {err}
          </p>
        )}

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">What&apos;s happening</h3>
          <p className="mt-1 text-xs text-dim">Work, money, and relationships this project is coordinating — organized here, never duplicated.</p>

          <LinkedGroup
            label="Work"
            linked={linkedWork.map((w) => ({ id: w.id, label: w.title, sub: w.kind === "task" ? w.status.replace("_", " ") : w.status }))}
            available={availableWork.map((w) => ({ id: w.id, label: w.title }))}
            canManage={canManage}
            pending={pending}
            attachValue={attachWorkId}
            setAttachValue={setAttachWorkId}
            onAttach={(id) => run(() => setWorkItemProjectAction(id, project.id))}
            onDetach={(id) => run(() => setWorkItemProjectAction(id, null))}
          />
          <LinkedGroup
            label="Money"
            linked={linkedTransactions.map((t) => ({ id: t.id, label: t.title, sub: `₹${t.amount.toLocaleString("en-IN")}` }))}
            available={availableTransactions.map((t) => ({ id: t.id, label: t.title }))}
            canManage={canManage}
            pending={pending}
            attachValue={attachTransactionId}
            setAttachValue={setAttachTransactionId}
            onAttach={(id) => run(() => setTransactionProjectAction(id, project.id))}
            onDetach={(id) => run(() => setTransactionProjectAction(id, null))}
          />
          <LinkedGroup
            label="Assets"
            linked={linkedAssets.map((a) => ({ id: a.id, label: a.name, sub: a.status.replace("_", " ") }))}
            available={availableAssets.map((a) => ({ id: a.id, label: a.name }))}
            canManage={canManage}
            pending={pending}
            attachValue={attachAssetId}
            setAttachValue={setAttachAssetId}
            onAttach={(id) => run(() => setAssetProjectAction(id, project.id))}
            onDetach={(id) => run(() => setAssetProjectAction(id, null))}
          />
          <LinkedGroup
            label="Community"
            linked={linkedContacts.map((c) => ({ id: c.id, label: c.name }))}
            available={availableContacts.map((c) => ({ id: c.id, label: c.name }))}
            canManage={canManage}
            pending={pending}
            attachValue={attachContactId}
            setAttachValue={setAttachContactId}
            onAttach={(id) => run(() => setContactProjectAction(id, project.id))}
            onDetach={(id) => run(() => setContactProjectAction(id, null))}
          />
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Related records</h3>
          <p className="mt-1.5 text-sm text-muted">
            Documents and Governance will be able to point here once they&apos;re ready to. Nothing more to connect yet.
          </p>
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Timeline</h3>
          {history === null ? (
            <p className="mt-2 text-sm text-muted">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nothing recorded yet — this project&apos;s own history starts here.</p>
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
          <EditProjectForm
            project={project}
            pending={pending}
            onCancel={() => setEditing(false)}
            onSave={(fd) =>
              run(async () => {
                const r = await updateProjectDetailsAction(project.id, fd);
                if (r.ok) setEditing(false);
                return r;
              }, "Saved.")
            }
          />
        ) : (
          canManage && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
              {project.stage !== "Completed" && !project.completedAt && (
                <Button size="sm" disabled={pending} onClick={() => run(() => completeProjectAction(project.id), "Completed.")}>
                  Complete
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => run(() => archiveProjectAction(project.id), "Archived.")}
                className="ml-auto text-dim hover:text-error"
              >
                Archive
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/** One row of "attach an existing record" + the records already attached —
 *  shared shape across Work/Money/Assets/Community so the four sections
 *  read as one pattern, not four bespoke widgets. */
function LinkedGroup({
  label,
  linked,
  available,
  canManage,
  pending,
  attachValue,
  setAttachValue,
  onAttach,
  onDetach,
}: {
  label: string;
  linked: { id: string; label: string; sub?: string }[];
  available: { id: string; label: string }[];
  canManage: boolean;
  pending: boolean;
  attachValue: string;
  setAttachValue: (v: string) => void;
  onAttach: (id: string) => void;
  onDetach: (id: string) => void;
}) {
  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-text">{label}</p>
      {linked.length === 0 ? (
        <p className="mt-1 text-xs text-dim">Nothing linked yet.</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {linked.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs">
              <span className="min-w-0 truncate text-text">
                {item.label}
                {item.sub && <span className="ml-1.5 text-dim">— {item.sub}</span>}
              </span>
              {canManage && (
                <button type="button" disabled={pending} onClick={() => onDetach(item.id)} className="shrink-0 text-dim hover:text-error disabled:opacity-50">
                  Unlink
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && available.length > 0 && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <select
            value={attachValue}
            onChange={(e) => setAttachValue(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface/40 px-2 py-1.5 text-xs text-text outline-none focus:border-accent"
          >
            <option value="">Attach existing…</option>
            {available.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={pending || !attachValue}
            onClick={() => {
              onAttach(attachValue);
              setAttachValue("");
            }}
            className="shrink-0"
          >
            Link
          </Button>
        </div>
      )}
    </div>
  );
}

function EditProjectForm({
  project,
  pending,
  onCancel,
  onSave,
}: {
  project: Project;
  pending: boolean;
  onCancel: () => void;
  onSave: (fd: FormData) => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [purpose, setPurpose] = useState(project.purpose ?? "");
  const [priority, setPriority] = useState<ProjectPriority>(project.priority);
  const [startDate, setStartDate] = useState(project.startDate ?? "");
  const [targetDate, setTargetDate] = useState(project.targetDate ?? "");

  const submit = () => {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("description", description);
    fd.set("purpose", purpose);
    fd.set("priority", priority);
    fd.set("startDate", startDate);
    fd.set("targetDate", targetDate);
    onSave(fd);
  };

  return (
    <section className="mt-6 border-t border-border pt-4">
      <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Edit</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description" className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={2} placeholder="Purpose" className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      <div className="mt-1.5 grid grid-cols-4 gap-1.5">
        {PROJECT_PRIORITIES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(p)}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium ${priority === p ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
          >
            {PROJECT_PRIORITY_LABELS[p]}
          </button>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" disabled={pending || !name.trim()} onClick={submit}>
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
