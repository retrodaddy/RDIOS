"use server";

import { getIdentityContext } from "@/os/identity/session";
import { recordHistory, listHistoryForSubject } from "@/os/attention/supabase-history-store";
import type { HistoryEntry } from "@/os/attention/types";
import { supabaseReportsProvider } from "./supabase-provider";
import { computeSnapshot } from "./snapshot";
import { REPORT_CATEGORIES, REPORT_CATEGORY_LABELS, type Report, type ReportCategory, type ReportFilters } from "./types";

export type ActionResult = { ok: boolean; error?: string };

const SUBJECT_TYPE = "reports.report";

function notResponsible(what: string): ActionResult {
  return { ok: false, error: `${what} isn't your responsibility here.` };
}

async function getOwnedReport(id: string, institutionId: string): Promise<Report | null> {
  const report = await supabaseReportsProvider.getReport(id);
  if (!report || report.institutionId !== institutionId) return null;
  return report;
}

function parseFilters(formData: FormData): ReportFilters {
  return {
    dateFrom: String(formData.get("dateFrom") ?? "").trim() || null,
    dateTo: String(formData.get("dateTo") ?? "").trim() || null,
    personId: String(formData.get("personId") ?? "").trim() || null,
    projectId: String(formData.get("projectId") ?? "").trim() || null,
    status: String(formData.get("status") ?? "").trim() || null,
    type: String(formData.get("type") ?? "").trim() || null,
  };
}

/** Generates a Report — computes a snapshot of live data right now and
 *  freezes it permanently. Per the brief: "Reports are historical. Do
 *  not regenerate automatically." Nothing about this Report changes
 *  again after this call except its title/description (`updateReport
 *  DetailsAction`) — the numbers inside `snapshot` are locked. */
// Extension seam (M13 brief, "Reports may generate recommendations. Do
// not implement. Leave extension seams."): once a Report is created
// below, a future milestone could call into `engines/tamizhi` here —
// e.g. `ensureRecommendationsGenerated(ctx.institution.id)` — so a
// freshly generated Financial Summary or Project Summary could prompt
// Tamizhi to look for something worth surfacing. Deliberately not
// wired up: M13 only reads Reports' *existing* Analytics output
// (`applications/reports/analytics.ts`), it never triggers generation
// from here, and this milestone's own brief was explicit not to build
// that wiring yet.
export async function createReportAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("reports.manage")) return notResponsible("Generating reports");

  const category = String(formData.get("category") ?? "");
  if (!(REPORT_CATEGORIES as readonly string[]).includes(category)) return { ok: false, error: "Choose a valid report category." };

  const filters = parseFilters(formData);
  const titleInput = String(formData.get("title") ?? "").trim();
  const title = titleInput || `${REPORT_CATEGORY_LABELS[category as ReportCategory]} — ${new Date().toLocaleDateString()}`;
  const description = String(formData.get("description") ?? "").trim() || null;

  const snapshot = await computeSnapshot(category as ReportCategory, ctx.institution.id, filters);

  const report = await supabaseReportsProvider.createReport({
    institutionId: ctx.institution.id,
    category: category as ReportCategory,
    title,
    description,
    filters,
    snapshot,
    generatedByPersonId: ctx.person.id,
  });

  recordHistory(ctx.institution.id, `${ctx.person.name} generated the "${report.title}" report.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: report.id,
  });
  return { ok: true };
}

export async function updateReportDetailsAction(id: string, formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("reports.manage")) return notResponsible("Managing reports");

  const report = await getOwnedReport(id, ctx.institution.id);
  if (!report) return { ok: false, error: "Report not found." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required." };

  await supabaseReportsProvider.updateReportDetails(id, {
    title,
    description: String(formData.get("description") ?? "").trim() || null,
  });

  recordHistory(ctx.institution.id, `${ctx.person.name} saved changes to the "${report.title}" report.`, {
    subjectType: SUBJECT_TYPE,
    subjectId: report.id,
  });
  return { ok: true };
}

export async function deleteReportAction(id: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  if (!ctx.permissions.has("reports.manage")) return notResponsible("Managing reports");

  const report = await getOwnedReport(id, ctx.institution.id);
  if (!report) return { ok: false, error: "Report not found." };

  await supabaseReportsProvider.deleteReport(id);
  recordHistory(ctx.institution.id, `${ctx.person.name} deleted the "${report.title}" report.`);
  return { ok: true };
}

/** A Report's own Timeline — the same filtered-History read pattern
 *  every other Record type on the platform uses. Since a deleted Report
 *  no longer exists to own a Timeline, its deletion is narrated at the
 *  institution level instead (above), the same way an Account's own
 *  Sprint 3-era history handles records that stop existing. */
export async function getReportHistoryAction(reportId: string): Promise<HistoryEntry[]> {
  const ctx = await getIdentityContext();
  if (!ctx) return [];
  const report = await getOwnedReport(reportId, ctx.institution.id);
  if (!report) return [];
  return listHistoryForSubject(ctx.institution.id, SUBJECT_TYPE, reportId);
}
