"use server";

import { getIdentityContext } from "@/os/identity/session";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { recordHistory, listHistoryForSubject } from "@/os/attention/history-store";
import type { HistoryEntry } from "@/os/attention/types";
import { mockProjectsProvider } from "./mock-provider";
import type { Project, ProjectHealth, ProjectMemberRole, ProjectPriority } from "./types";
import { PROJECT_HEALTHS, PROJECT_HEALTH_LABELS, PROJECT_MEMBER_ROLES, PROJECT_PRIORITIES } from "./types";

export type ActionResult = { ok: boolean; error?: string };

const SUBJECT_TYPE = "projects.project";

function notResponsible(what: string): ActionResult {
  return { ok: false, error: `${what} isn't your responsibility here.` };
}

async function nameOf(personId: string): Promise<string> {
  return (await mockIdentityProvider.getPerson(personId))?.name ?? "Someone";
}

async function getOwnedProject(id: string, institutionId: string): Promise<Project | null> {
  const project = await mockProjectsProvider.getProject(id);
  if (!project || project.institutionId !== institutionId) return null;
  return project;
}

export async function createProjectAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("projects.manage")) return notResponsible("Creating projects");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const description = String(formData.get("description") ?? "").trim() || null;
  const purpose = String(formData.get("purpose") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "medium");
  if (!(PROJECT_PRIORITIES as readonly string[]).includes(priority)) return { ok: false, error: "Choose a valid priority." };
  const ownerPersonId = String(formData.get("ownerPersonId") ?? "").trim() || null;
  const startDate = String(formData.get("startDate") ?? "").trim() || null;
  const targetDate = String(formData.get("targetDate") ?? "").trim() || null;

  const project = await mockProjectsProvider.createProject({
    institutionId: ctx.institution.id,
    name,
    description,
    purpose,
    priority: priority as ProjectPriority,
    ownerPersonId,
    startDate,
    targetDate,
    createdByPersonId: ctx.person.id,
  });

  const subject = { subjectType: SUBJECT_TYPE, subjectId: project.id };
  if (ownerPersonId) {
    const ownerName = ownerPersonId === ctx.person.id ? "themselves" : await nameOf(ownerPersonId);
    recordHistory(ctx.institution.id, `${ctx.person.name} started "${project.name}" and made ${ownerName} the owner.`, subject);
  } else {
    recordHistory(ctx.institution.id, `${ctx.person.name} started "${project.name}".`, subject);
  }
  return { ok: true };
}

export async function updateProjectDetailsAction(id: string, formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("projects.manage")) return notResponsible("Managing projects");

  const project = await getOwnedProject(id, ctx.institution.id);
  if (!project) return { ok: false, error: "Project not found." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const priority = String(formData.get("priority") ?? project.priority);
  if (!(PROJECT_PRIORITIES as readonly string[]).includes(priority)) return { ok: false, error: "Choose a valid priority." };

  await mockProjectsProvider.updateProjectDetails(id, {
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    purpose: String(formData.get("purpose") ?? "").trim() || null,
    priority: priority as ProjectPriority,
    startDate: String(formData.get("startDate") ?? "").trim() || null,
    targetDate: String(formData.get("targetDate") ?? "").trim() || null,
  });

  recordHistory(ctx.institution.id, `${ctx.person.name} updated "${project.name}"'s details.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: project.id,
  });
  return { ok: true };
}

export async function setProjectOwnerAction(id: string, ownerPersonId: string | null): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("projects.manage")) return notResponsible("Managing projects");

  const project = await getOwnedProject(id, ctx.institution.id);
  if (!project) return { ok: false, error: "Project not found." };

  await mockProjectsProvider.setProjectOwner(id, ownerPersonId);
  const name = ownerPersonId ? (ownerPersonId === ctx.person.id ? "themselves" : await nameOf(ownerPersonId)) : null;
  recordHistory(
    ctx.institution.id,
    name ? `${ctx.person.name} made ${name} the owner of "${project.name}".` : `${ctx.person.name} removed the owner from "${project.name}".`,
    { subjectType: SUBJECT_TYPE, subjectId: project.id }
  );
  return { ok: true };
}

export async function setProjectStageAction(id: string, stage: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("projects.manage")) return notResponsible("Changing a project's stage");
  if (!stage.trim()) return { ok: false, error: "Stage is required." };

  const project = await getOwnedProject(id, ctx.institution.id);
  if (!project) return { ok: false, error: "Project not found." };
  const previousStage = project.stage;
  if (previousStage === stage.trim()) return { ok: true };

  // Captured `previousStage` above, before the provider call — the mock
  // provider mutates the same object in place and returns that reference,
  // so reading `project.stage` after this call would already show the new
  // value, silently turning every transition into "X to X."
  await mockProjectsProvider.setProjectStage(id, stage);
  recordHistory(ctx.institution.id, `${ctx.person.name} moved "${project.name}" from ${previousStage} to ${stage.trim()}.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: project.id,
  });
  return { ok: true };
}

export async function setProjectHealthAction(id: string, health: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("projects.manage")) return notResponsible("Managing projects");
  if (!(PROJECT_HEALTHS as readonly string[]).includes(health)) return { ok: false, error: "Choose a valid health." };

  const project = await getOwnedProject(id, ctx.institution.id);
  if (!project) return { ok: false, error: "Project not found." };
  if (project.health === health) return { ok: true };

  await mockProjectsProvider.setProjectHealth(id, health as ProjectHealth);
  recordHistory(
    ctx.institution.id,
    `${ctx.person.name} marked "${project.name}" as ${PROJECT_HEALTH_LABELS[health as ProjectHealth].toLowerCase()}.`,
    { subjectType: SUBJECT_TYPE, subjectId: project.id }
  );
  return { ok: true };
}

export async function addProjectMemberAction(id: string, personId: string, role: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("projects.manage")) return notResponsible("Managing project members");
  if (!(PROJECT_MEMBER_ROLES as readonly string[]).includes(role)) return { ok: false, error: "Choose a valid role." };

  const project = await getOwnedProject(id, ctx.institution.id);
  if (!project) return { ok: false, error: "Project not found." };
  if (project.members.some((m) => m.personId === personId)) return { ok: false, error: "Already part of this project." };

  await mockProjectsProvider.addMember(id, personId, role as ProjectMemberRole);
  const name = personId === ctx.person.id ? "themselves" : await nameOf(personId);
  recordHistory(ctx.institution.id, `${ctx.person.name} added ${name} to "${project.name}" as ${role === "observer" ? "an observer" : "a member"}.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: project.id,
  });
  return { ok: true };
}

export async function removeProjectMemberAction(id: string, memberId: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("projects.manage")) return notResponsible("Managing project members");

  const project = await getOwnedProject(id, ctx.institution.id);
  if (!project) return { ok: false, error: "Project not found." };
  const member = project.members.find((m) => m.id === memberId);
  if (!member) return { ok: false, error: "Member not found." };

  await mockProjectsProvider.removeMember(id, memberId);
  const name = await nameOf(member.personId);
  recordHistory(ctx.institution.id, `${ctx.person.name} removed ${name} from "${project.name}".`, {
    subjectType: SUBJECT_TYPE,
    subjectId: project.id,
  });
  return { ok: true };
}

export async function completeProjectAction(id: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("projects.manage")) return notResponsible("Managing projects");

  const project = await getOwnedProject(id, ctx.institution.id);
  if (!project) return { ok: false, error: "Project not found." };
  if (project.status === "archived") return { ok: false, error: "This project is archived." };

  await mockProjectsProvider.completeProject(id);
  recordHistory(ctx.institution.id, `${ctx.person.name} completed "${project.name}".`, {
    subjectType: SUBJECT_TYPE,
    subjectId: project.id,
  });
  return { ok: true };
}

export async function archiveProjectAction(id: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("projects.manage")) return notResponsible("Managing projects");

  const project = await getOwnedProject(id, ctx.institution.id);
  if (!project) return { ok: false, error: "Project not found." };

  await mockProjectsProvider.archiveProject(id);
  recordHistory(ctx.institution.id, `${ctx.person.name} archived "${project.name}".`, {
    subjectType: SUBJECT_TYPE,
    subjectId: project.id,
  });
  return { ok: true };
}

/** A Project's own Timeline — its filtered slice of institutional History,
 *  the same read pattern every M9-preceding Timeline already established. */
export async function getProjectHistoryAction(projectId: string): Promise<HistoryEntry[]> {
  const ctx = await getIdentityContext();
  if (!ctx) return [];
  const project = await getOwnedProject(projectId, ctx.institution.id);
  if (!project) return [];
  return listHistoryForSubject(ctx.institution.id, SUBJECT_TYPE, projectId);
}

export async function addProjectDocumentRefAction(projectId: string, label: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!label.trim()) return { ok: false, error: "Enter a document reference." };

  const project = await getOwnedProject(projectId, ctx.institution.id);
  if (!project) return { ok: false, error: "Project not found." };
  if (!ctx.permissions.has("projects.manage")) return notResponsible("Attaching documents");

  await mockProjectsProvider.addDocumentRef(projectId, label);
  return { ok: true };
}
