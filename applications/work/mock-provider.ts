import "server-only";
import { randomUUID } from "crypto";
import type { WorkProvider } from "./provider";
import type { Approval, Comment, Task, WorkItem } from "./types";

/** In-memory, dev-only — same `globalThis` singleton guard as every other
 *  mock provider this engagement. */
type Store = { items: Map<string, WorkItem> };

const g = globalThis as unknown as { __rdiosWorkStore?: Store };

function store(): Store {
  if (!g.__rdiosWorkStore) g.__rdiosWorkStore = { items: new Map() };
  return g.__rdiosWorkStore;
}

export const mockWorkProvider: WorkProvider = {
  async listWorkItems(institutionId) {
    return [...store().items.values()]
      .filter((i) => i.institutionId === institutionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getWorkItem(id) {
    return store().items.get(id) ?? null;
  },

  async createTask({ institutionId, title, description, createdByPersonId, assigneePersonId, projectId }) {
    const task: Task = {
      id: randomUUID(),
      kind: "task",
      institutionId,
      title: title.trim(),
      description: description?.trim() || null,
      createdByPersonId,
      createdAt: new Date().toISOString(),
      comments: [],
      projectId,
      status: "open",
      assigneePersonId,
      completedAt: null,
    };
    store().items.set(task.id, task);
    return task;
  },

  async assignTask(taskId, assigneePersonId) {
    const item = store().items.get(taskId);
    if (!item || item.kind !== "task") return null;
    item.assigneePersonId = assigneePersonId;
    if (item.status === "open" && assigneePersonId) item.status = "in_progress";
    return item;
  },

  async setTaskStatus(taskId, status) {
    const item = store().items.get(taskId);
    if (!item || item.kind !== "task") return null;
    item.status = status;
    item.completedAt = status === "complete" ? new Date().toISOString() : null;
    return item;
  },

  async createApproval({ institutionId, title, description, createdByPersonId, chainAreas, projectId }) {
    const approval: Approval = {
      id: randomUUID(),
      kind: "approval",
      institutionId,
      title: title.trim(),
      description: description?.trim() || null,
      createdByPersonId,
      createdAt: new Date().toISOString(),
      comments: [],
      projectId,
      status: "pending",
      currentStepIndex: 0,
      chain: chainAreas.map((area) => ({
        id: randomUUID(),
        area,
        status: "pending",
        decidedByPersonId: null,
        decidedAt: null,
        escalated: false,
        escalatedToPositionId: null,
      })),
    };
    store().items.set(approval.id, approval);
    return approval;
  },

  async decideCurrentStep(approvalId, decidedByPersonId, decision) {
    const item = store().items.get(approvalId);
    if (!item || item.kind !== "approval" || item.status !== "pending") return null;
    const step = item.chain[item.currentStepIndex];
    if (!step || step.status !== "pending") return null;

    step.status = decision;
    step.decidedByPersonId = decidedByPersonId;
    step.decidedAt = new Date().toISOString();

    if (decision === "rejected") {
      item.status = "rejected";
    } else if (item.currentStepIndex === item.chain.length - 1) {
      item.status = "approved";
    } else {
      item.currentStepIndex += 1;
    }
    return item;
  },

  async escalateCurrentStep(approvalId, escalatedToPositionId) {
    const item = store().items.get(approvalId);
    if (!item || item.kind !== "approval" || item.status !== "pending") return null;
    const step = item.chain[item.currentStepIndex];
    if (!step || step.status !== "pending") return null;
    step.escalated = true;
    step.escalatedToPositionId = escalatedToPositionId;
    return item;
  },

  async setWorkItemProject(workItemId, projectId) {
    const item = store().items.get(workItemId);
    if (!item) return null;
    item.projectId = projectId;
    return item;
  },

  async addComment(workItemId, personId, text) {
    const item = store().items.get(workItemId);
    if (!item) return null;
    const comment: Comment = { id: randomUUID(), personId, text: text.trim(), createdAt: new Date().toISOString() };
    item.comments.push(comment);
    return comment;
  },
};
