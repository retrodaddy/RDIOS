import "server-only";
import { randomUUID } from "crypto";
import type { ReportsProvider } from "./provider";
import type { Report } from "./types";

/** In-memory, dev-only — same `globalThis` singleton guard as every other
 *  mock provider this engagement. */
type Store = { reports: Map<string, Report> };

const g = globalThis as unknown as { __rdiosReportsStore?: Store };

function store(): Store {
  if (!g.__rdiosReportsStore) g.__rdiosReportsStore = { reports: new Map() };
  return g.__rdiosReportsStore;
}

export const mockReportsProvider: ReportsProvider = {
  async listReports(institutionId) {
    return [...store().reports.values()]
      .filter((r) => r.institutionId === institutionId)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  },

  async listReportsByCategory(institutionId, category) {
    return [...store().reports.values()]
      .filter((r) => r.institutionId === institutionId && r.category === category)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  },

  async getReport(id) {
    return store().reports.get(id) ?? null;
  },

  async createReport({ institutionId, category, title, description, filters, snapshot, generatedByPersonId }) {
    const now = new Date().toISOString();
    const report: Report = {
      id: randomUUID(),
      institutionId,
      category,
      title: title.trim(),
      description: description?.trim() || null,
      filters,
      snapshot,
      generatedByPersonId,
      generatedAt: now,
      createdAt: now,
    };
    store().reports.set(report.id, report);
    return report;
  },

  async updateReportDetails(id, patch) {
    const report = store().reports.get(id);
    if (!report) return null;
    if (patch.title !== undefined) report.title = patch.title.trim();
    if (patch.description !== undefined) report.description = patch.description?.trim() || null;
    return report;
  },

  async deleteReport(id) {
    return store().reports.delete(id);
  },
};
