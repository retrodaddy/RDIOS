/**
 * Reports & Analytics — M11, built exactly per the founder's own brief.
 * Two deliberately separate things, kept separate in code the way the
 * brief kept them separate in prose:
 *
 * A **Report** answers "what happened?" — a frozen historical snapshot,
 * generated once, never silently regenerated. Opening a report from last
 * month shows last month's truth, even if the underlying People/Work/
 * Finance/Community/Projects/Documents/History data has since moved on.
 * Reports own nothing; every number in a snapshot is a copy of a fact
 * that already lives somewhere else, computed at generation time.
 *
 * **Analytics** (`applications/reports/analytics.ts`) answers "what
 * deserves attention?" — observations, not reports, not charts, not
 * opinions. It has no Core Model of its own here because it produces
 * nothing that needs to persist; it's a pure read across the same
 * sources a Report reads, computed fresh every time it's asked.
 */

/** The brief's own closed list — "No institution-specific reports.
 *  Universal only." Unlike Document.type or Project.stage, this is
 *  deliberately NOT free text: the brief enumerates an exact set and
 *  says so explicitly, so honoring that means a real enum here, not the
 *  "suggested vocabulary" pattern every other domain has used. */
export const REPORT_CATEGORIES = [
  "institution_overview",
  "people_overview",
  "organization_overview",
  "work_summary",
  "financial_summary",
  "community_summary",
  "project_summary",
  "document_summary",
  "history_summary",
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  institution_overview: "Institution Overview",
  people_overview: "People Overview",
  organization_overview: "Organization Overview",
  work_summary: "Work Summary",
  financial_summary: "Financial Summary",
  community_summary: "Community Summary",
  project_summary: "Project Summary",
  document_summary: "Document Summary",
  history_summary: "History Summary",
};

/** Kept deliberately small, per the brief's own list — nothing beyond
 *  these five, and every field optional since most reports only need a
 *  handful. Interpreted per category by `snapshot.ts` (e.g. `projectId`
 *  narrows Work/Money/Documents/Community to what that Project's own
 *  `projectId` cross-reference already links, reusing M9's convergence
 *  fields rather than inventing a new join). */
export type ReportFilters = {
  dateFrom: string | null;
  dateTo: string | null;
  personId: string | null;
  projectId: string | null;
  status: string | null;
  type: string | null;
};

/** One labeled number — the exact shape `BeAwareItem` already uses,
 *  reused rather than reinvented, since a Report's snapshot is honestly
 *  the same kind of fact Be Aware already shows, just frozen in time and
 *  gathered in one place instead of scattered across Home. */
export type ReportMetric = {
  label: string;
  value: string;
  sub: string;
};

export const CHART_KINDS = ["bar", "line", "pie", "trend"] as const;
export type ChartKind = (typeof CHART_KINDS)[number];

export type ChartPoint = {
  label: string;
  value: number;
};

/** "Keep charts minimal... Numbers first, charts second" — one shape,
 *  rendered simply, never a BI-platform-style chart library. */
export type ReportChart = {
  kind: ChartKind;
  title: string;
  points: ChartPoint[];
};

export type ReportSnapshot = {
  metrics: ReportMetric[];
  charts: ReportChart[];
  /** Only populated by History Summary — the one category where "what
   *  happened" is most literally a list of narrated events rather than
   *  aggregate counts. Frozen at generation time like everything else
   *  in the snapshot. */
  recentHistory: { id: string; summary: string; occurredAt: string }[];
};

export type Report = {
  id: string;
  institutionId: string;
  category: ReportCategory;
  title: string;
  description: string | null;
  filters: ReportFilters;
  snapshot: ReportSnapshot;
  generatedByPersonId: string;
  generatedAt: string;
  createdAt: string;
};
