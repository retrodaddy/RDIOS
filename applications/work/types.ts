/**
 * Work — the first Shared-Engine-Layer-backed Application (M6), per the
 * frozen Product Foundation §4/§7: Task and Approval, template-driven,
 * generalized for multi-tenancy. Two seeded starter templates only —
 * `task.default` and `approval.default` — the exact starter set named in
 * Product Foundation §7 ("these simply become the starter set;
 * institutions add their own"). No template editor is built here; a
 * template is a fixed shape today, the same "smallest implementation that
 * satisfies the frozen concept" discipline every prior milestone used.
 *
 * Approval is where the Governance & Responsibility Model v1 first
 * becomes real, not just prose: an Approval's chain names Areas of
 * Responsibility (PermissionKey) in sequence, never people — a step is
 * satisfied by whoever currently holds that Area, resolved fresh every
 * time, exactly as Governance §5 requires. Escalate (named, real, unbuilt
 * anywhere until now, per the Architecture Freeze Declaration) widens a
 * stuck step's pool by one hop up the real M4 organization graph, per
 * Governance §7 — never reassigns the decision away from its Area.
 */
import type { PermissionKey } from "@/engines/authority/types";

export const WORK_ITEM_KINDS = ["task", "approval"] as const;
export type WorkItemKind = (typeof WORK_ITEM_KINDS)[number];

export const TASK_STATUSES = ["open", "in_progress", "complete"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  complete: "Complete",
};

export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const STEP_STATUSES = ["pending", "approved", "rejected"] as const;
export type StepStatus = (typeof STEP_STATUSES)[number];

/** One step in an Approval Chain — names an Area of Responsibility, never
 *  a person, per Governance §5. `escalatedToPositionId` records that this
 *  step's pool was widened one hop up the org graph (Governance §7);
 *  `escalated` stays a real, visible fact, never silently reversible. */
export type ApprovalStep = {
  id: string;
  area: PermissionKey;
  status: StepStatus;
  decidedByPersonId: string | null;
  decidedAt: string | null;
  escalated: boolean;
  escalatedToPositionId: string | null;
};

export type Comment = {
  id: string;
  personId: string;
  text: string;
  createdAt: string;
};

type WorkItemBase = {
  id: string;
  institutionId: string;
  title: string;
  description: string | null;
  createdByPersonId: string;
  createdAt: string;
  comments: Comment[];
};

/** `task.default` — open → in_progress → complete. Assignment is Manual
 *  only today (Shared Engine Layer's Assignment strategy interface names
 *  Round Robin as a real, natural future addition — not built here). */
export type Task = WorkItemBase & {
  kind: "task";
  status: TaskStatus;
  assigneePersonId: string | null;
  completedAt: string | null;
};

/** `approval.default` — pending → approved/rejected, driven by its own
 *  chain. Same-actor exclusion (Governance §6) is a permanent, non-
 *  configurable default here: the creator of an Approval may never
 *  satisfy any of its own steps, full stop — the smallest real instance
 *  of the principle, not the configurable version Governance names as a
 *  future refinement. */
export type Approval = WorkItemBase & {
  kind: "approval";
  status: ApprovalStatus;
  chain: ApprovalStep[];
  currentStepIndex: number;
};

export type WorkItem = Task | Approval;
