import "server-only";
import { db, DbError } from "@/lib/db/client";
import type { ReportsProvider } from "./provider";
import type { Report, ReportFilters, ReportSnapshot } from "./types";

type ReportRow = {
  id: string;
  institution_id: string;
  category: Report["category"];
  title: string;
  description: string | null;
  filters: ReportFilters;
  snapshot: ReportSnapshot;
  generated_by_person_id: string;
  generated_at: string;
  created_at: string;
};

function toReport(row: ReportRow): Report {
  return {
    id: row.id,
    institutionId: row.institution_id,
    category: row.category,
    title: row.title,
    description: row.description,
    filters: row.filters,
    snapshot: row.snapshot,
    generatedByPersonId: row.generated_by_person_id,
    generatedAt: row.generated_at,
    createdAt: row.created_at,
  };
}

export const supabaseReportsProvider: ReportsProvider = {
  async listReports(institutionId) {
    const { data, error } = await db()
      .from("reports")
      .select("*")
      .eq("institution_id", institutionId)
      .order("generated_at", { ascending: false });
    if (error) throw new DbError("listReports failed", error);
    return (data as ReportRow[]).map(toReport);
  },

  async listReportsByCategory(institutionId, category) {
    const { data, error } = await db()
      .from("reports")
      .select("*")
      .eq("institution_id", institutionId)
      .eq("category", category)
      .order("generated_at", { ascending: false });
    if (error) throw new DbError("listReportsByCategory failed", error);
    return (data as ReportRow[]).map(toReport);
  },

  async getReport(id) {
    const { data, error } = await db().from("reports").select("*").eq("id", id).maybeSingle();
    if (error) throw new DbError("getReport failed", error);
    return data ? toReport(data as ReportRow) : null;
  },

  async createReport({ institutionId, category, title, description, filters, snapshot, generatedByPersonId }) {
    const now = new Date().toISOString();
    const { data, error } = await db()
      .from("reports")
      .insert({
        institution_id: institutionId,
        category,
        title: title.trim(),
        description: description?.trim() || null,
        filters,
        snapshot,
        generated_by_person_id: generatedByPersonId,
        generated_at: now,
      })
      .select()
      .single();
    if (error) throw new DbError("createReport failed", error);
    return toReport(data as ReportRow);
  },

  async updateReportDetails(id, patch) {
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title.trim();
    if (patch.description !== undefined) update.description = patch.description?.trim() || null;

    const { data, error } = await db().from("reports").update(update).eq("id", id).select().maybeSingle();
    if (error) throw new DbError("updateReportDetails failed", error);
    return data ? toReport(data as ReportRow) : null;
  },

  async deleteReport(id) {
    const { error, count } = await db().from("reports").delete({ count: "exact" }).eq("id", id);
    if (error) throw new DbError("deleteReport failed", error);
    return (count ?? 0) > 0;
  },
};
