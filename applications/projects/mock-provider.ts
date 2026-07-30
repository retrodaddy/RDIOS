import "server-only";
import { randomUUID } from "crypto";
import type { ProjectsProvider } from "./provider";
import type { DocumentRef, Project, ProjectMember } from "./types";

/** In-memory, dev-only — same `globalThis` singleton guard as every other
 *  mock provider this engagement. */
type Store = { projects: Map<string, Project> };

const g = globalThis as unknown as { __rdiosProjectsStore?: Store };

function store(): Store {
  if (!g.__rdiosProjectsStore) g.__rdiosProjectsStore = { projects: new Map() };
  return g.__rdiosProjectsStore;
}

export const mockProjectsProvider: ProjectsProvider = {
  async listProjects(institutionId) {
    return [...store().projects.values()]
      .filter((p) => p.institutionId === institutionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getProject(id) {
    return store().projects.get(id) ?? null;
  },

  async createProject({ institutionId, name, description, purpose, priority, ownerPersonId, startDate, targetDate, createdByPersonId }) {
    const project: Project = {
      id: randomUUID(),
      institutionId,
      name: name.trim(),
      description: description?.trim() || null,
      purpose: purpose?.trim() || null,
      status: "active",
      priority,
      ownerPersonId,
      members: [],
      stage: "Planning",
      health: "on_track",
      startDate,
      targetDate,
      completedAt: null,
      documentRefs: [],
      createdByPersonId,
      createdAt: new Date().toISOString(),
      archivedAt: null,
    };
    store().projects.set(project.id, project);
    return project;
  },

  async updateProjectDetails(id, patch) {
    const project = store().projects.get(id);
    if (!project) return null;
    if (patch.name !== undefined) project.name = patch.name.trim();
    if (patch.description !== undefined) project.description = patch.description?.trim() || null;
    if (patch.purpose !== undefined) project.purpose = patch.purpose?.trim() || null;
    if (patch.priority !== undefined) project.priority = patch.priority;
    if (patch.startDate !== undefined) project.startDate = patch.startDate;
    if (patch.targetDate !== undefined) project.targetDate = patch.targetDate;
    return project;
  },

  async setProjectOwner(id, ownerPersonId) {
    const project = store().projects.get(id);
    if (!project) return null;
    project.ownerPersonId = ownerPersonId;
    return project;
  },

  async setProjectStage(id, stage) {
    const project = store().projects.get(id);
    if (!project || !stage.trim()) return null;
    project.stage = stage.trim();
    return project;
  },

  async setProjectHealth(id, health) {
    const project = store().projects.get(id);
    if (!project) return null;
    project.health = health;
    return project;
  },

  async addMember(id, personId, role) {
    const project = store().projects.get(id);
    if (!project) return null;
    if (project.members.some((m) => m.personId === personId)) return project;
    const member: ProjectMember = { id: randomUUID(), personId, role, addedAt: new Date().toISOString() };
    project.members.push(member);
    return project;
  },

  async removeMember(id, memberId) {
    const project = store().projects.get(id);
    if (!project) return null;
    project.members = project.members.filter((m) => m.id !== memberId);
    return project;
  },

  async completeProject(id) {
    const project = store().projects.get(id);
    if (!project) return null;
    project.stage = "Completed";
    project.completedAt = new Date().toISOString();
    return project;
  },

  async archiveProject(id) {
    const project = store().projects.get(id);
    if (!project) return null;
    project.status = "archived";
    project.archivedAt = new Date().toISOString();
    return project;
  },

  async addDocumentRef(id, label) {
    const project = store().projects.get(id);
    if (!project || !label.trim()) return null;
    const ref: DocumentRef = { id: randomUUID(), label: label.trim(), addedAt: new Date().toISOString() };
    project.documentRefs.push(ref);
    return ref;
  },
};
