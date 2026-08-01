"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addWorkCommentAction,
  assignTaskAction,
  createApprovalAction,
  createTaskAction,
  decideApprovalStepAction,
  escalateApprovalStepAction,
  getWorkItemHistoryAction,
  setTaskStatusAction,
} from "@/applications/work/actions";
import type { Approval, ApprovalStatus, StepStatus, TaskStatus, WorkItem } from "@/applications/work/types";
import { TASK_STATUS_LABELS } from "@/applications/work/types";
import { PERMISSIONS, PERMISSION_LABELS, type PermissionKey } from "@/engines/authority/types";
import { getPermissionLabel } from "@/os/institution/terminology";
import type { InstitutionType } from "@/os/identity/types";
import type { HistoryEntry } from "@/os/attention/types";
import { Badge, Button, type BadgeTone } from "@/components/ui";

const TASK_STATUS_TONE: Record<TaskStatus, BadgeTone> = { open: "neutral", in_progress: "accent", complete: "success" };
const APPROVAL_STATUS_TONE: Record<ApprovalStatus, BadgeTone> = { pending: "accent", approved: "success", rejected: "error" };
const STEP_STATUS_TONE: Record<StepStatus, BadgeTone> = { pending: "neutral", approved: "success", rejected: "error" };

export type WorkRosterPerson = { id: string; name: string; email: string };

/** Work's board — "Needs your action" (per-person, computed the same way
 *  Home's Attention Contract does) and "Everything." Click any item for a
 *  detail panel that stays a drawer, per the Visual Design System, since
 *  nothing here is irreversible on its own — even an Approval's decision
 *  is a real institutional event, but the item itself is never destroyed
 *  by viewing or acting on it. */
export function WorkBoard({
  initialWorkItems,
  roster,
  currentPersonId,
  canManageWork,
  myAreas,
  myPositionIds,
  institutionType,
  isFounder,
  initialSelectedId,
}: {
  initialWorkItems: WorkItem[];
  roster: WorkRosterPerson[];
  currentPersonId: string;
  canManageWork: boolean;
  myAreas: PermissionKey[];
  myPositionIds: string[];
  institutionType: InstitutionType;
  isFounder: boolean;
  /** Universal Search's own deep-link (M12) — opens straight to this
   *  Work Item's existing drawer, never a duplicate screen. */
  initialSelectedId?: string | null;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [creating, setCreating] = useState(false);

  // Universal Search (M12) navigates here client-side with a new
  // `?open=` id while this board stays mounted — React only honors a
  // `useState` initializer on first mount, so a second search result
  // opened back-to-back needs this effect to actually change the
  // selection, not just the initial value.
  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  const items = initialWorkItems;
  const personName = (id: string | null) => {
    if (!id) return null;
    if (id === currentPersonId) return "You";
    return roster.find((p) => p.id === id)?.name ?? "Someone";
  };

  const areaLabel = (key: PermissionKey) => getPermissionLabel(institutionType, key, PERMISSION_LABELS[key]);

  /** Mirrors the server's own eligibility check (applications/work/actions.ts
   *  canActOnCurrentStep) exactly, so the board can tell — before any click —
   *  whether this person can actually decide an Approval's current step.
   *  Implementation Sprint 1 §1/§7: a button should never invite a click it
   *  already knows will fail. */
  const canDecideCurrentStep = (item: Approval) => {
    if (item.createdByPersonId === currentPersonId) return false;
    const step = item.chain[item.currentStepIndex];
    if (isFounder) return true;
    if (myAreas.includes(step.area)) return true;
    if (step.escalatedToPositionId && myPositionIds.includes(step.escalatedToPositionId)) return true;
    return false;
  };

  const needsAction = items.filter((item) => {
    if (item.kind === "task") return item.assigneePersonId === currentPersonId && item.status !== "complete";
    if (item.status !== "pending") return false;
    return canDecideCurrentStep(item);
  });

  const selected = items.find((i) => i.id === selectedId) ?? null;
  const refresh = () => router.refresh();

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">Needs your action</h2>
        <Button
          variant="secondary"
          onClick={() => setCreating(true)}
          disabled={!canManageWork}
          title={canManageWork ? undefined : "Managing work isn't your responsibility here."}
        >
          New
        </Button>
      </div>
      {needsAction.length === 0 ? (
        <p className="mt-3 rounded-xl border border-border bg-surface/40 px-5 py-6 text-sm text-muted">Nothing needs you right now.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {needsAction.map((item) => (
            <WorkRow key={item.id} item={item} personName={personName} areaLabel={areaLabel} onClick={() => setSelectedId(item.id)} />
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-[0.7rem] uppercase tracking-[0.2em] text-dim">Everything</h2>
      {items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-border bg-surface/40 px-5 py-6 text-sm text-muted">No work yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {items.map((item) => (
            <WorkRow key={item.id} item={item} personName={personName} areaLabel={areaLabel} onClick={() => setSelectedId(item.id)} />
          ))}
        </ul>
      )}

      {creating && (
        <CreateDrawer
          roster={roster}
          institutionType={institutionType}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            refresh();
          }}
        />
      )}

      {selected && (
        <DetailPanel
          item={selected}
          roster={roster}
          currentPersonId={currentPersonId}
          canManageWork={canManageWork}
          canDecide={selected.kind === "approval" ? canDecideCurrentStep(selected) : false}
          areaLabel={areaLabel}
          onClose={() => setSelectedId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

function WorkRow({
  item,
  personName,
  areaLabel,
  onClick,
}: {
  item: WorkItem;
  personName: (id: string | null) => string | null;
  areaLabel: (key: PermissionKey) => string;
  onClick: () => void;
}) {
  const context =
    item.kind === "task"
      ? item.assigneePersonId
        ? personName(item.assigneePersonId)
        : "Unassigned"
      : item.status === "pending"
        ? `Awaiting ${areaLabel(item.chain[item.currentStepIndex].area)}`
        : null;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors duration-fast ease-os-out hover:bg-surface"
      >
        <div className="min-w-0">
          <p className="truncate text-sm text-text">{item.title}</p>
          <p className="truncate text-xs text-dim">{item.kind === "task" ? "Task" : "Approval"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {context && <span className="text-xs text-muted">{context}</span>}
          <Badge tone={item.kind === "task" ? TASK_STATUS_TONE[item.status] : APPROVAL_STATUS_TONE[item.status]}>
            {item.kind === "task" ? TASK_STATUS_LABELS[item.status] : item.status === "pending" ? "Pending" : item.status === "approved" ? "Approved" : "Rejected"}
          </Badge>
        </div>
      </button>
    </li>
  );
}

function CreateDrawer({
  roster,
  institutionType,
  onClose,
  onCreated,
}: {
  roster: WorkRosterPerson[];
  institutionType: InstitutionType;
  onClose: () => void;
  onCreated: () => void;
}) {
  const areaLabel = (key: PermissionKey) => getPermissionLabel(institutionType, key, PERMISSION_LABELS[key]);
  const [kind, setKind] = useState<"task" | "approval">("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneePersonId, setAssigneePersonId] = useState("");
  const [chainAreas, setChainAreas] = useState<PermissionKey[]>([]);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const toggleArea = (area: PermissionKey) => {
    setChainAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  };

  const submit = () => {
    setErr(null);
    start(async () => {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("description", description);
      let r;
      if (kind === "task") {
        fd.set("assigneePersonId", assigneePersonId);
        r = await createTaskAction(fd);
      } else {
        chainAreas.forEach((a) => fd.append("chainAreas", a));
        r = await createApprovalAction(fd);
      }
      if (!r.ok) return setErr(r.error ?? "Could not create.");
      onCreated();
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="New work item">
      <div className="os-anim-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="os-anim-sheet relative w-full max-w-md overflow-hidden rounded-t-2xl border border-border bg-elevated p-6 sm:rounded-2xl">
        <p className="font-display text-lg">New work</p>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setKind("task")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${kind === "task" ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
          >
            Task
          </button>
          <button
            type="button"
            onClick={() => setKind("approval")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${kind === "approval" ? "bg-accent text-on-accent" : "border border-border text-dim"}`}
          >
            Approval
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          placeholder="Title"
          className="mt-4 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description — optional"
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        />

        {kind === "task" ? (
          <select
            value={assigneePersonId}
            onChange={(e) => setAssigneePersonId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
          >
            <option value="">Unassigned for now</option>
            {roster.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="mt-3">
            <p className="text-xs text-dim">Approval steps, in order — who&apos;s asked, one after another.</p>
            <div className="mt-2 space-y-1.5">
              {PERMISSIONS.map((area) => (
                <label key={area} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <input type="checkbox" checked={chainAreas.includes(area)} onChange={() => toggleArea(area)} />
                  {areaLabel(area)}
                </label>
              ))}
            </div>
            {chainAreas.length > 0 && (
              <p className="mt-2 text-xs text-dim">Order: {chainAreas.map((a) => areaLabel(a)).join(" → ")}</p>
            )}
          </div>
        )}

        {err && (
          <p className="mt-2 text-sm text-error" role="alert">
            {err}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={submit} disabled={pending || !title.trim() || (kind === "approval" && chainAreas.length === 0)}>
            {pending ? "Creating…" : "Create"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
  item,
  roster,
  currentPersonId,
  canManageWork,
  canDecide,
  areaLabel,
  onClose,
  onChanged,
}: {
  item: WorkItem;
  roster: WorkRosterPerson[];
  currentPersonId: string;
  canManageWork: boolean;
  /** Can the signed-in person decide THIS item's current Approval step,
   *  right now — computed once by the parent (WorkBoard.canDecideCurrentStep)
   *  so Approve/Reject never render as live options for someone who would
   *  only be told "no" after clicking. Meaningless for a Task. */
  canDecide: boolean;
  areaLabel: (key: PermissionKey) => string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const canEscalate = item.kind === "approval" && (canManageWork || item.createdByPersonId === currentPersonId);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [assigneeId, setAssigneeId] = useState(item.kind === "task" ? item.assigneePersonId ?? "" : "");
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setHistory(null);
    getWorkItemHistoryAction(item.id).then(setHistory);
  }, [item.id]);

  const personName = (id: string | null) => {
    if (!id) return null;
    if (id === currentPersonId) return "You";
    return roster.find((p) => p.id === id)?.name ?? "Someone";
  };

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setErr(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) return setErr(r.error ?? "Could not complete that.");
      onChanged();
      // `onChanged` re-fetches this panel's own props but doesn't remount
      // it, so the Timeline's mount-only fetch never sees a just-recorded
      // entry on its own — refetch it explicitly alongside every change.
      getWorkItemHistoryAction(item.id).then(setHistory);
    });
  };

  return (
    <div className="fixed inset-0 z-[75] flex justify-end" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="os-anim-backdrop absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="os-anim-drawer-right relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-elevated p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">{item.kind === "task" ? "Task" : "Approval"}</p>
            <h2 className="mt-1 font-display text-xl font-medium">{item.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-xs text-dim hover:text-text">
            Close
          </button>
        </div>

        {item.description && <p className="mt-2 text-sm text-muted">{item.description}</p>}

        {item.kind === "task" ? (
          <section className="mt-6">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Status</h3>
            <div className="mt-1.5">
              <Badge tone={TASK_STATUS_TONE[item.status]}>{TASK_STATUS_LABELS[item.status]}</Badge>
            </div>

            <h3 className="mt-4 text-[0.65rem] uppercase tracking-[0.2em] text-dim">Assignee</h3>
            <div className="mt-2 flex items-center gap-2">
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={!canManageWork}
                className="w-full rounded-lg border border-border bg-surface/40 px-2.5 py-2 text-sm text-text outline-none focus:border-accent disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {roster.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                size="sm"
                disabled={pending || !canManageWork}
                title={canManageWork ? undefined : "Managing work isn't your responsibility here."}
                onClick={() => run(() => assignTaskAction(item.id, assigneeId || null))}
                className="shrink-0"
              >
                Save
              </Button>
            </div>

            {item.status !== "complete" && (item.assigneePersonId === currentPersonId || canManageWork) && (
              <Button
                disabled={pending}
                onClick={() => run(() => setTaskStatusAction(item.id, "complete"))}
                className="mt-4 w-full"
              >
                Complete
              </Button>
            )}
          </section>
        ) : (
          <section className="mt-6">
            <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Chain</h3>
            <ul className="mt-2 space-y-1.5">
              {item.chain.map((step, i) => (
                <li
                  key={step.id}
                  className={`rounded-lg border px-3 py-2 text-sm ${i === item.currentStepIndex && item.status === "pending" ? "border-accent" : "border-border"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-text">{areaLabel(step.area)}</span>
                    {step.status === "pending" ? (
                      <span className="text-xs text-dim">{i === item.currentStepIndex ? "Current" : "Waiting"}</span>
                    ) : (
                      <Badge tone={STEP_STATUS_TONE[step.status]}>{step.status === "approved" ? "Approved" : "Rejected"}</Badge>
                    )}
                  </div>
                  {step.escalated && <p className="mt-1 text-xs text-accent-bright">Escalated — also asks whoever this reports to</p>}
                  {step.decidedByPersonId && (
                    <p className="mt-1 text-xs text-dim">
                      {step.status === "approved" ? "Approved" : "Rejected"} by {personName(step.decidedByPersonId)}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            {item.status === "pending" && (
              <div className="mt-4">
                {canDecide ? (
                  <div className="flex items-center gap-2">
                    <Button disabled={pending} onClick={() => run(() => decideApprovalStepAction(item.id, "approved"))}>
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={pending}
                      onClick={() => run(() => decideApprovalStepAction(item.id, "rejected"))}
                    >
                      Reject
                    </Button>
                    {canEscalate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending || item.chain[item.currentStepIndex].escalated}
                        onClick={() => run(() => escalateApprovalStepAction(item.id))}
                        className="ml-auto"
                      >
                        Escalate
                      </Button>
                    )}
                  </div>
                ) : (
                  // The founder's own framing: an action should never be
                  // offered only to fail — someone who isn't eligible sees
                  // that plainly, in the same calm language the server
                  // would otherwise only reveal after a click.
                  <div className="rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm text-muted">
                    {item.createdByPersonId === currentPersonId
                      ? "You requested this approval — you can't also decide it."
                      : `Deciding the ${areaLabel(item.chain[item.currentStepIndex].area)} step isn't your responsibility here.`}
                    {canEscalate && !item.chain[item.currentStepIndex].escalated && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => escalateApprovalStepAction(item.id))}
                        className="ml-2 text-accent-bright hover:underline disabled:opacity-50"
                      >
                        Escalate it
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {err && (
          <p className="mt-3 text-sm text-error" role="alert">
            {err}
          </p>
        )}

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Comments</h3>
          {item.comments.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No comments yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {item.comments.map((c) => (
                <li key={c.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <p className="text-text">{c.text}</p>
                  <p className="mt-0.5 text-xs text-dim">{personName(c.personId)}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex items-center gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
            <Button
              size="sm"
              disabled={pending || !comment.trim()}
              onClick={() =>
                run(async () => {
                  const r = await addWorkCommentAction(item.id, comment);
                  if (r.ok) setComment("");
                  return r;
                })
              }
              className="shrink-0"
            >
              Add
            </Button>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Related records</h3>
          <p className="mt-1.5 text-sm text-muted">
            Finance, Community, and Projects will be able to point here once they&apos;re ready to. Nothing to connect yet.
          </p>
        </section>

        <section className="mt-6">
          <h3 className="text-[0.65rem] uppercase tracking-[0.2em] text-dim">Timeline</h3>
          {history === null ? (
            <p className="mt-2 text-sm text-muted">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nothing recorded yet — this item&apos;s own history starts here.</p>
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
      </div>
    </div>
  );
}
