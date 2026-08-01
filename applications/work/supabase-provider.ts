import "server-only";
import { db, DbError } from "@/lib/db/client";
import type { WorkProvider } from "./provider";
import type { Approval, ApprovalStep, Comment, Task, WorkItem } from "./types";

type WorkItemRow = {
  id: string;
  institution_id: string;
  kind: "task" | "approval";
  title: string;
  description: string | null;
  created_by_person_id: string;
  created_at: string;
  comments: Comment[];
  project_id: string | null;
  status: string | null;
  assignee_person_id: string | null;
  completed_at: string | null;
  approval_status: string | null;
  chain: ApprovalStep[] | null;
  current_step_index: number | null;
};

function toWorkItem(row: WorkItemRow): WorkItem {
  const base = {
    id: row.id,
    institutionId: row.institution_id,
    title: row.title,
    description: row.description,
    createdByPersonId: row.created_by_person_id,
    createdAt: row.created_at,
    comments: row.comments,
    projectId: row.project_id,
  };
  if (row.kind === "task") {
    return {
      ...base,
      kind: "task",
      status: row.status as Task["status"],
      assigneePersonId: row.assignee_person_id,
      completedAt: row.completed_at,
    };
  }
  return {
    ...base,
    kind: "approval",
    status: row.approval_status as Approval["status"],
    chain: row.chain ?? [],
    currentStepIndex: row.current_step_index ?? 0,
  };
}

export const supabaseWorkProvider: WorkProvider = {
  async listWorkItems(institutionId) {
    const { data, error } = await db()
      .from("work_items")
      .select("*")
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: false });
    if (error) throw new DbError("listWorkItems failed", error);
    return (data as WorkItemRow[]).map(toWorkItem);
  },

  async getWorkItem(id) {
    const { data, error } = await db().from("work_items").select("*").eq("id", id).maybeSingle();
    if (error) throw new DbError("getWorkItem failed", error);
    return data ? toWorkItem(data as WorkItemRow) : null;
  },

  async createTask({ institutionId, title, description, createdByPersonId, assigneePersonId, projectId }) {
    const { data, error } = await db()
      .from("work_items")
      .insert({
        institution_id: institutionId,
        kind: "task",
        title: title.trim(),
        description: description?.trim() || null,
        created_by_person_id: createdByPersonId,
        project_id: projectId,
        status: "open",
        assignee_person_id: assigneePersonId,
        completed_at: null,
      })
      .select()
      .single();
    if (error) throw new DbError("createTask failed", error);
    return toWorkItem(data as WorkItemRow) as Task;
  },

  async assignTask(taskId, assigneePersonId) {
    const { data: existing, error: fetchError } = await db().from("work_items").select("*").eq("id", taskId).maybeSingle();
    if (fetchError) throw new DbError("assignTask fetch failed", fetchError);
    if (!existing || existing.kind !== "task") return null;

    const nextStatus = existing.status === "open" && assigneePersonId ? "in_progress" : existing.status;
    const { data, error } = await db()
      .from("work_items")
      .update({ assignee_person_id: assigneePersonId, status: nextStatus })
      .eq("id", taskId)
      .select()
      .single();
    if (error) throw new DbError("assignTask failed", error);
    return toWorkItem(data as WorkItemRow) as Task;
  },

  async setTaskStatus(taskId, status) {
    const { data: existing, error: fetchError } = await db().from("work_items").select("*").eq("id", taskId).maybeSingle();
    if (fetchError) throw new DbError("setTaskStatus fetch failed", fetchError);
    if (!existing || existing.kind !== "task") return null;

    const { data, error } = await db()
      .from("work_items")
      .update({ status, completed_at: status === "complete" ? new Date().toISOString() : null })
      .eq("id", taskId)
      .select()
      .single();
    if (error) throw new DbError("setTaskStatus failed", error);
    return toWorkItem(data as WorkItemRow) as Task;
  },

  async createApproval({ institutionId, title, description, createdByPersonId, chainAreas, projectId }) {
    const chain: ApprovalStep[] = chainAreas.map((area) => ({
      id: crypto.randomUUID(),
      area,
      status: "pending",
      decidedByPersonId: null,
      decidedAt: null,
      escalated: false,
      escalatedToPositionId: null,
    }));
    const { data, error } = await db()
      .from("work_items")
      .insert({
        institution_id: institutionId,
        kind: "approval",
        title: title.trim(),
        description: description?.trim() || null,
        created_by_person_id: createdByPersonId,
        project_id: projectId,
        approval_status: "pending",
        current_step_index: 0,
        chain,
      })
      .select()
      .single();
    if (error) throw new DbError("createApproval failed", error);
    return toWorkItem(data as WorkItemRow) as Approval;
  },

  async decideCurrentStep(approvalId, decidedByPersonId, decision) {
    const { data: existing, error: fetchError } = await db().from("work_items").select("*").eq("id", approvalId).maybeSingle();
    if (fetchError) throw new DbError("decideCurrentStep fetch failed", fetchError);
    if (!existing || existing.kind !== "approval" || existing.approval_status !== "pending") return null;

    const chain = (existing.chain ?? []) as ApprovalStep[];
    const currentStepIndex = existing.current_step_index ?? 0;
    const step = chain[currentStepIndex];
    if (!step || step.status !== "pending") return null;

    step.status = decision;
    step.decidedByPersonId = decidedByPersonId;
    step.decidedAt = new Date().toISOString();

    let approvalStatus = existing.approval_status as string;
    let nextIndex = currentStepIndex;
    if (decision === "rejected") {
      approvalStatus = "rejected";
    } else if (currentStepIndex === chain.length - 1) {
      approvalStatus = "approved";
    } else {
      nextIndex = currentStepIndex + 1;
    }

    // The precondition (`approval_status = 'pending'`) is re-checked here,
    // in the UPDATE's own WHERE clause — not just in the SELECT above.
    // Postgres serializes concurrent UPDATEs on the same row via a row
    // lock, so if two decisions race, only the first can match this
    // condition; the second finds 0 rows (status already changed) and
    // returns null instead of silently clobbering the first's decision.
    const { data, error } = await db()
      .from("work_items")
      .update({ chain, approval_status: approvalStatus, current_step_index: nextIndex })
      .eq("id", approvalId)
      .eq("approval_status", "pending")
      .select()
      .maybeSingle();
    if (error) throw new DbError("decideCurrentStep failed", error);
    return data ? (toWorkItem(data as WorkItemRow) as Approval) : null;
  },

  async escalateCurrentStep(approvalId, escalatedToPositionId) {
    const { data: existing, error: fetchError } = await db().from("work_items").select("*").eq("id", approvalId).maybeSingle();
    if (fetchError) throw new DbError("escalateCurrentStep fetch failed", fetchError);
    if (!existing || existing.kind !== "approval" || existing.approval_status !== "pending") return null;

    const chain = (existing.chain ?? []) as ApprovalStep[];
    const currentStepIndex = existing.current_step_index ?? 0;
    const step = chain[currentStepIndex];
    if (!step || step.status !== "pending") return null;

    step.escalated = true;
    step.escalatedToPositionId = escalatedToPositionId;

    const { data, error } = await db()
      .from("work_items")
      .update({ chain })
      .eq("id", approvalId)
      .eq("approval_status", "pending")
      .select()
      .maybeSingle();
    if (error) throw new DbError("escalateCurrentStep failed", error);
    return data ? (toWorkItem(data as WorkItemRow) as Approval) : null;
  },

  async setWorkItemProject(workItemId, projectId) {
    const { data, error } = await db().from("work_items").update({ project_id: projectId }).eq("id", workItemId).select().maybeSingle();
    if (error) throw new DbError("setWorkItemProject failed", error);
    return data ? toWorkItem(data as WorkItemRow) : null;
  },

  // Appended inside a single atomic UPDATE server-side (`comments = comments
  // || new_comment`) via RPC — a fetch-then-write-back from here could
  // lose one of two comments added at nearly the same moment.
  async addComment(workItemId, personId, text) {
    const comment: Comment = { id: crypto.randomUUID(), personId, text: text.trim(), createdAt: new Date().toISOString() };
    const { data, error } = await db().rpc("work_items_add_comment", { p_id: workItemId, p_comment: comment });
    if (error) throw new DbError("addComment failed", error);
    return data ? comment : null;
  },
};
