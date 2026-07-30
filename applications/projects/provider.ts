import "server-only";
import type { DocumentRef, Project, ProjectHealth, ProjectMemberRole, ProjectPriority } from "./types";

/** The swappable contract Projects is built behind — the same discipline
 *  as every prior application's provider. Backed today by an in-memory
 *  mock; a real provider implements this exact interface later. */
export interface ProjectsProvider {
  listProjects(institutionId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;

  createProject(input: {
    institutionId: string;
    name: string;
    description: string | null;
    purpose: string | null;
    priority: ProjectPriority;
    ownerPersonId: string | null;
    startDate: string | null;
    targetDate: string | null;
    createdByPersonId: string;
  }): Promise<Project>;

  updateProjectDetails(
    id: string,
    patch: {
      name?: string;
      description?: string | null;
      purpose?: string | null;
      priority?: ProjectPriority;
      startDate?: string | null;
      targetDate?: string | null;
    }
  ): Promise<Project | null>;

  setProjectOwner(id: string, ownerPersonId: string | null): Promise<Project | null>;
  setProjectStage(id: string, stage: string): Promise<Project | null>;
  setProjectHealth(id: string, health: ProjectHealth): Promise<Project | null>;

  addMember(id: string, personId: string, role: ProjectMemberRole): Promise<Project | null>;
  removeMember(id: string, memberId: string): Promise<Project | null>;

  completeProject(id: string): Promise<Project | null>;
  archiveProject(id: string): Promise<Project | null>;

  addDocumentRef(id: string, label: string): Promise<DocumentRef | null>;
}
