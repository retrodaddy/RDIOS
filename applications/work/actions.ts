"use server";

import { getIdentityContext } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { recordHistory } from "@/os/attention/history-store";
import { PERMISSIONS, PERMISSION_LABELS, type PermissionKey } from "@/engines/authority/types";
import { findEscalationTarget, personCanSatisfyArea, personHoldsPosition } from "@/engines/authority/resolver";
import { mockWorkProvider } from "./mock-provider";
import type { TaskStatus, WorkItem } from "./types";

export type ActionResult = { ok: boolean; error?: string };

function notResponsible(what: string): ActionResult {
  return { ok: false, error: `${what} isn't your responsibility here.` };
}

async function nameOf(personId: string): Promise<string> {
  return (await mockIdentityProvider.getPerson(personId))?.name ?? "Someone";
}

async function getOwnedWorkItem(id: string, institutionId: string): Promise<WorkItem | null> {
  const item = await mockWorkProvider.getWorkItem(id);
  if (!item || item.institutionId !== institutionId) return null;
  return item;
}

/** Can this person currently act on this Approval's current step —
 *  either as a direct holder of its Area, or (once escalated) as the
 *  holder of the Position the step was escalated to? Governance §7:
 *  escalation only ever widens the pool, never narrows or replaces it. */
async function canActOnCurrentStep(
  institution: Awaited<ReturnType<typeof mockIdentityProvider.getInstitution>>,
  personId: string,
  area: PermissionKey,
  escalatedToPositionId: string | null
): Promise<boolean> {
  if (!institution) return false;
  const person = await mockIdentityProvider.getPerson(personId);
  if (!person) return false;
  if (await personCanSatisfyArea(institution, person, area)) return true;
  if (escalatedToPositionId && (await personHoldsPosition(personId, escalatedToPositionId))) return true;
  return false;
}

export async function createTaskAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("work.manage")) return notResponsible("Managing work");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required." };
  const description = String(formData.get("description") ?? "").trim() || null;
  const assigneePersonId = String(formData.get("assigneePersonId") ?? "").trim() || null;

  const task = await mockWorkProvider.createTask({
    institutionId: ctx.institution.id,
    title,
    description,
    createdByPersonId: ctx.person.id,
    assigneePersonId,
  });
  if (assigneePersonId) {
    const assigneeName = assigneePersonId === ctx.person.id ? "themselves" : await nameOf(assigneePersonId);
    recordHistory(ctx.institution.id, `${ctx.person.name} created "${task.title}" and assigned it to ${assigneeName}.`);
  } else {
    recordHistory(ctx.institution.id, `${ctx.person.name} created "${task.title}".`);
  }
  return { ok: true };
}

export async function assignTaskAction(taskId: string, assigneePersonId: string | null): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("work.manage")) return notResponsible("Managing work");

  const item = await getOwnedWorkItem(taskId, ctx.institution.id);
  if (!item || item.kind !== "task") return { ok: false, error: "Task not found." };

  await mockWorkProvider.assignTask(taskId, assigneePersonId);
  const name = assigneePersonId ? (assigneePersonId === ctx.person.id ? "themselves" : await nameOf(assigneePersonId)) : null;
  recordHistory(
    ctx.institution.id,
    name ? `${ctx.person.name} assigned "${item.title}" to ${name}.` : `${ctx.person.name} unassigned "${item.title}".`
  );
  return { ok: true };
}

/** Either the assignee or someone responsible for Work may mark a task
 *  complete — the person actually doing the work always can, regardless
 *  of whether they hold the broader Work Area. */
export async function setTaskStatusAction(taskId: string, status: TaskStatus): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const item = await getOwnedWorkItem(taskId, ctx.institution.id);
  if (!item || item.kind !== "task") return { ok: false, error: "Task not found." };

  const isAssignee = item.assigneePersonId === ctx.person.id;
  if (!isAssignee && !ctx.permissions.has("work.manage")) return notResponsible("Updating this task");

  await mockWorkProvider.setTaskStatus(taskId, status);
  if (status === "complete") {
    recordHistory(ctx.institution.id, `${ctx.person.name} completed "${item.title}".`);
  }
  return { ok: true };
}

export async function createApprovalAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("work.manage")) return notResponsible("Managing work");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required." };
  const description = String(formData.get("description") ?? "").trim() || null;
  const chainAreas = formData
    .getAll("chainAreas")
    .map((v) => String(v))
    .filter((v): v is PermissionKey => (PERMISSIONS as readonly string[]).includes(v));
  if (chainAreas.length === 0) return { ok: false, error: "An approval needs at least one step." };

  const approval = await mockWorkProvider.createApproval({
    institutionId: ctx.institution.id,
    title,
    description,
    createdByPersonId: ctx.person.id,
    chainAreas,
  });
  recordHistory(
    ctx.institution.id,
    `${ctx.person.name} requested approval for "${approval.title}" (${chainAreas.map((a) => PERMISSION_LABELS[a]).join(" → ")}).`
  );
  return { ok: true };
}

/** Same-actor exclusion (Governance §6), the permanent default: the
 *  creator of an Approval may never satisfy any of its own steps. */
export async function decideApprovalStepAction(approvalId: string, decision: "approved" | "rejected"): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const item = await getOwnedWorkItem(approvalId, ctx.institution.id);
  if (!item || item.kind !== "approval") return { ok: false, error: "Approval not found." };
  if (item.status !== "pending") return { ok: false, error: "This approval is already resolved." };

  if (item.createdByPersonId === ctx.person.id) {
    return { ok: false, error: "You requested this approval — you can't also decide it." };
  }

  const step = item.chain[item.currentStepIndex];
  const canAct = await canActOnCurrentStep(ctx.institution, ctx.person.id, step.area, step.escalatedToPositionId);
  if (!canAct) return notResponsible(`Deciding the ${PERMISSION_LABELS[step.area]} step`);

  const result = await mockWorkProvider.decideCurrentStep(approvalId, ctx.person.id, decision);
  if (!result) return { ok: false, error: "Could not record this decision." };

  if (decision === "rejected") {
    recordHistory(ctx.institution.id, `${ctx.person.name} rejected "${item.title}" at the ${PERMISSION_LABELS[step.area]} step.`);
  } else if (result.status === "approved") {
    recordHistory(ctx.institution.id, `${ctx.person.name} approved "${item.title}" — fully approved.`);
  } else {
    recordHistory(ctx.institution.id, `${ctx.person.name} approved "${item.title}" at the ${PERMISSION_LABELS[step.area]} step.`);
  }
  return { ok: true };
}

/** Escalation (Governance §7) — widens a stuck step's pool by one hop up
 *  the real org graph. Anyone responsible for Work, or the person who
 *  requested the approval, may trigger it; it never resolves the step
 *  itself. */
export async function escalateApprovalStepAction(approvalId: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const item = await getOwnedWorkItem(approvalId, ctx.institution.id);
  if (!item || item.kind !== "approval") return { ok: false, error: "Approval not found." };
  if (item.status !== "pending") return { ok: false, error: "This approval is already resolved." };

  const canEscalate = ctx.permissions.has("work.manage") || item.createdByPersonId === ctx.person.id;
  if (!canEscalate) return notResponsible("Escalating this approval");

  const step = item.chain[item.currentStepIndex];
  if (step.escalated) return { ok: false, error: "This step has already been escalated." };

  const target = await findEscalationTarget(ctx.institution.id, step.area);
  if (!target) return { ok: false, error: "There's no position above this step's responsibility to escalate to." };

  await mockWorkProvider.escalateCurrentStep(approvalId, target);
  recordHistory(ctx.institution.id, `${ctx.person.name} escalated "${item.title}" — the ${PERMISSION_LABELS[step.area]} step now also asks whoever it reports to.`);
  return { ok: true };
}

export async function addWorkCommentAction(workItemId: string, text: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!text.trim()) return { ok: false, error: "Comment is empty." };

  const item = await getOwnedWorkItem(workItemId, ctx.institution.id);
  if (!item) return { ok: false, error: "Not found." };

  await mockWorkProvider.addComment(workItemId, ctx.person.id, text);
  return { ok: true };
}
