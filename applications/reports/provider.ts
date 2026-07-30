import "server-only";
import type { Report, ReportCategory, ReportFilters, ReportSnapshot } from "./types";

/** The swappable contract Reports is built behind — the same discipline
 *  as every prior application's provider. Backed today by an in-memory
 *  mock; a real provider implements this exact interface later. */
export interface ReportsProvider {
  listReports(institutionId: string): Promise<Report[]>;
  /** Every saved Report of one category, newest first — the read
   *  Analytics' trend observations use to compare the two most recent
   *  snapshots of the same kind without a separate time-series store. */
  listReportsByCategory(institutionId: string, category: ReportCategory): Promise<Report[]>;
  getReport(id: string): Promise<Report | null>;

  createReport(input: {
    institutionId: string;
    category: ReportCategory;
    title: string;
    description: string | null;
    filters: ReportFilters;
    snapshot: ReportSnapshot;
    generatedByPersonId: string;
  }): Promise<Report>;

  updateReportDetails(id: string, patch: { title?: string; description?: string | null }): Promise<Report | null>;

  /** A real delete, not the archive-and-keep pattern every other
   *  Record type on this platform uses — the brief names "Deleting
   *  reports" explicitly, and a Report is a disposable summary of facts
   *  that live elsewhere, never the one place a fact is remembered. */
  deleteReport(id: string): Promise<boolean>;
}
