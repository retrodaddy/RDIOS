import "server-only";
import type { PermissionKey } from "@/engines/authority/types";
import type { Approval, Comment, Task, TaskStatus, WorkItem } from "./types";

/** The swappable contract Work is built behind — the same discipline as
 *  every prior application's provider. Backed today by an in-memory mock;
 *  a real provider implements this exact interface later. */
export interface WorkProvider {
  listWorkItems(institutionId: string): Promise<WorkItem[]>;
  getWorkItem(id: string): Promise<WorkItem | null>;

  createTask(input: {
    institutionId: string;
    title: string;
    description: string | null;
    createdByPersonId: string;
    assigneePersonId: string | null;
    projectId: string | null;
  }): Promise<Task>;
  assignTask(taskId: string, assigneePersonId: string | null): Promise<Task | null>;
  setTaskStatus(taskId: string, status: TaskStatus): Promise<Task | null>;
  /** Attaches or detaches a Work Item from a Project — the one seam Work
   *  exposes for M9's convergence, never a duplicate of Work's own
   *  create/assign flow. */
  setWorkItemProject(workItemId: string, projectId: string | null): Promise<WorkItem | null>;

  /** `chainAreas` becomes the Approval's ApprovalStep sequence, one step
   *  per Area, in order — the chain names Areas, never people, per
   *  Governance §5. */
  createApproval(input: {
    institutionId: string;
    title: string;
    description: string | null;
    createdByPersonId: string;
    chainAreas: PermissionKey[];
    projectId: string | null;
  }): Promise<Approval>;
  /** Records a decision on the Approval's *current* step only — the
   *  chain always moves in order. Advances to the next step on approval,
   *  or resolves the whole Approval on the final step or any rejection. */
  decideCurrentStep(approvalId: string, decidedByPersonId: string, decision: "approved" | "rejected"): Promise<Approval | null>;
  /** Widens the current step's pool by recording an escalation target —
   *  never advances or reassigns the step itself (Governance §7). */
  escalateCurrentStep(approvalId: string, escalatedToPositionId: string): Promise<Approval | null>;

  addComment(workItemId: string, personId: string, text: string): Promise<Comment | null>;
}
