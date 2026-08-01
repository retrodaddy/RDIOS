import "server-only";
import { db, DbError } from "@/lib/db/client";
import type { ProjectsProvider } from "./provider";
import type { DocumentRef, Project, ProjectMember } from "./types";

type ProjectRow = {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  status: Project["status"];
  priority: Project["priority"];
  owner_person_id: string | null;
  members: ProjectMember[];
  stage: string;
  health: Project["health"];
  start_date: string | null;
  target_date: string | null;
  completed_at: string | null;
  document_refs: DocumentRef[];
  created_by_person_id: string;
  created_at: string;
  archived_at: string | null;
};

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    institutionId: row.institution_id,
    name: row.name,
    description: row.description,
    purpose: row.purpose,
    status: row.status,
    priority: row.priority,
    ownerPersonId: row.owner_person_id,
    members: row.members,
    stage: row.stage,
    health: row.health,
    startDate: row.start_date,
    targetDate: row.target_date,
    completedAt: row.completed_at,
    documentRefs: row.document_refs,
    createdByPersonId: row.created_by_person_id,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
  };
}

export const supabaseProjectsProvider: ProjectsProvider = {
  async listProjects(institutionId) {
    const { data, error } = await db()
      .from("projects")
      .select("*")
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: false });
    if (error) throw new DbError("listProjects failed", error);
    return (data as ProjectRow[]).map(toProject);
  },

  async getProject(id) {
    const { data, error } = await db().from("projects").select("*").eq("id", id).maybeSingle();
    if (error) throw new DbError("getProject failed", error);
    return data ? toProject(data as ProjectRow) : null;
  },

  async createProject({ institutionId, name, description, purpose, priority, ownerPersonId, startDate, targetDate, createdByPersonId }) {
    const { data, error } = await db()
      .from("projects")
      .insert({
        institution_id: institutionId,
        name: name.trim(),
        description: description?.trim() || null,
        purpose: purpose?.trim() || null,
        status: "active",
        priority,
        owner_person_id: ownerPersonId,
        members: [],
        stage: "Planning",
        health: "on_track",
        start_date: startDate,
        target_date: targetDate,
        completed_at: null,
        document_refs: [],
        created_by_person_id: createdByPersonId,
      })
      .select()
      .single();
    if (error) throw new DbError("createProject failed", error);
    return toProject(data as ProjectRow);
  },

  async updateProjectDetails(id, patch) {
    const update: Record<string, unknown> = {};
    if (patch.name !== undefined) update.name = patch.name.trim();
    if (patch.description !== undefined) update.description = patch.description?.trim() || null;
    if (patch.purpose !== undefined) update.purpose = patch.purpose?.trim() || null;
    if (patch.priority !== undefined) update.priority = patch.priority;
    if (patch.startDate !== undefined) update.start_date = patch.startDate;
    if (patch.targetDate !== undefined) update.target_date = patch.targetDate;

    const { data, error } = await db().from("projects").update(update).eq("id", id).select().maybeSingle();
    if (error) throw new DbError("updateProjectDetails failed", error);
    return data ? toProject(data as ProjectRow) : null;
  },

  async setProjectOwner(id, ownerPersonId) {
    const { data, error } = await db().from("projects").update({ owner_person_id: ownerPersonId }).eq("id", id).select().maybeSingle();
    if (error) throw new DbError("setProjectOwner failed", error);
    return data ? toProject(data as ProjectRow) : null;
  },

  async setProjectStage(id, stage) {
    if (!stage.trim()) return null;
    const { data, error } = await db().from("projects").update({ stage: stage.trim() }).eq("id", id).select().maybeSingle();
    if (error) throw new DbError("setProjectStage failed", error);
    return data ? toProject(data as ProjectRow) : null;
  },

  async setProjectHealth(id, health) {
    const { data, error } = await db().from("projects").update({ health }).eq("id", id).select().maybeSingle();
    if (error) throw new DbError("setProjectHealth failed", error);
    return data ? toProject(data as ProjectRow) : null;
  },

  // Dedupe-check + append happen inside one atomic UPDATE (RPC) — reading
  // the array, checking membership, and writing it back from here could
  // let two concurrent "add member" calls both pass the dedupe check and
  // insert two rows for the same person.
  async addMember(id, personId, role) {
    const { data, error } = await db().rpc("projects_add_member", { p_id: id, p_person_id: personId, p_role: role });
    if (error) throw new DbError("addMember failed", error);
    return data ? toProject(data as ProjectRow) : null;
  },

  async removeMember(id, memberId) {
    const { data, error } = await db().rpc("projects_remove_member", { p_id: id, p_member_id: memberId });
    if (error) throw new DbError("removeMember failed", error);
    return data ? toProject(data as ProjectRow) : null;
  },

  async completeProject(id) {
    const { data, error } = await db()
      .from("projects")
      .update({ stage: "Completed", completed_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new DbError("completeProject failed", error);
    return data ? toProject(data as ProjectRow) : null;
  },

  async archiveProject(id) {
    const { data, error } = await db()
      .from("projects")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new DbError("archiveProject failed", error);
    return data ? toProject(data as ProjectRow) : null;
  },

  async addDocumentRef(id, label) {
    if (!label.trim()) return null;
    const { data, error } = await db().rpc("projects_add_document_ref", { p_id: id, p_label: label.trim() });
    if (error) throw new DbError("addDocumentRef failed", error);
    if (!data) return null;
    const documentRefs = (data as ProjectRow).document_refs;
    return documentRefs[documentRefs.length - 1] ?? null;
  },
};
