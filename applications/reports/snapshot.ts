import "server-only";
import { mockIdentityProvider } from "@/os/identity/mock-provider";
import { listHistory } from "@/os/attention/history-store";
import { mockPeopleProvider } from "@/applications/people/mock-provider";
import { mockWorkProvider } from "@/applications/work/mock-provider";
import { mockFinanceProvider } from "@/applications/finance/mock-provider";
import { mockCommunityProvider } from "@/applications/community/mock-provider";
import { DIRECTION_LABELS } from "@/applications/community/types";
import { mockProjectsProvider } from "@/applications/projects/mock-provider";
import { mockDocumentsProvider } from "@/applications/documents/mock-provider";
import { DOCUMENT_STATUS_LABELS } from "@/applications/documents/types";
import type { ReportCategory, ReportFilters, ReportSnapshot } from "./types";

/**
 * Snapshot computation — one pure(ish) read per Report category, each
 * gathering exactly the facts Home's own Be Aware lines already gather,
 * just frozen into a Report instead of scattered live across the
 * dashboard. Reports own nothing: every metric here is read fresh from
 * the same providers every other application already reads from, never
 * a parallel description of the same fact (the Universal Record Model's
 * own discipline, applied to reporting instead of a single record).
 *
 * Filters are interpreted per category, only where they honestly apply —
 * a `projectId` filter narrows Work/Money/Documents/Community to what
 * that Project's own `projectId` cross-reference already links (M9's
 * convergence fields, reused rather than a new join); a `dateFrom`/
 * `dateTo` range narrows to each category's most natural date field.
 * Not every filter applies to every category; where one doesn't apply,
 * it's silently ignored rather than erroring — the same "smallest
 * complete implementation" discipline every prior domain has used.
 */

function inRange(iso: string, filters: ReportFilters): boolean {
  const t = new Date(iso).getTime();
  if (filters.dateFrom && t < new Date(filters.dateFrom).getTime()) return false;
  if (filters.dateTo && t > new Date(filters.dateTo).getTime() + 86_400_000 - 1) return false;
  return true;
}

async function computeInstitutionOverview(institutionId: string, filters: ReportFilters): Promise<ReportSnapshot> {
  const institution = await mockIdentityProvider.getInstitution(institutionId);
  const [memberships, positions, workItems, transactions, contacts, projects, documents] = await Promise.all([
    mockIdentityProvider.listMembershipsForInstitution(institutionId),
    mockPeopleProvider.listPositions(institutionId),
    mockWorkProvider.listWorkItems(institutionId),
    mockFinanceProvider.listTransactions(institutionId),
    mockCommunityProvider.listContacts(institutionId),
    mockProjectsProvider.listProjects(institutionId),
    mockDocumentsProvider.listDocuments(institutionId),
  ]);

  const activeMembers = memberships.filter((m) => m.status === "active").length;
  const activeProjects = projects.filter((p) => p.status === "active");
  const activeDocuments = documents.filter((d) => d.status !== "archived");
  const recordedIncome = transactions.filter((t) => t.kind === "income" && t.status !== "archived").reduce((s, t) => s + t.amount, 0);
  const recordedExpense = transactions.filter((t) => t.kind === "expense" && t.status !== "archived").reduce((s, t) => s + t.amount, 0);

  return {
    metrics: [
      { label: "Institution", value: institution?.name ?? "—", sub: institution?.type ?? "" },
      { label: "People", value: `${activeMembers}`, sub: "active members" },
      { label: "Organization", value: `${positions.length}`, sub: "positions" },
      { label: "Work", value: `${workItems.length}`, sub: "items total" },
      { label: "Money", value: `₹${recordedIncome.toLocaleString("en-IN")} in / ₹${recordedExpense.toLocaleString("en-IN")} out`, sub: "recorded" },
      { label: "Community", value: `${contacts.filter((c) => c.status === "active").length}`, sub: "active contacts" },
      { label: "Projects", value: `${activeProjects.length}`, sub: "active" },
      { label: "Documents", value: `${activeDocuments.length}`, sub: "kept" },
    ],
    charts: [],
    recentHistory: [],
  };
}

async function computePeopleOverview(institutionId: string): Promise<ReportSnapshot> {
  const memberships = await mockIdentityProvider.listMembershipsForInstitution(institutionId);
  const active = memberships.filter((m) => m.status === "active");
  const invited = memberships.filter((m) => m.status === "invited");

  const positions = await mockPeopleProvider.listPositions(institutionId);
  const holdersByPosition = await Promise.all(positions.map((p) => mockPeopleProvider.listPositionHolders(p.id)));
  const filled = holdersByPosition.filter((holders) => holders.some((h) => !h.endedAt)).length;

  return {
    metrics: [
      { label: "Active people", value: `${active.length}`, sub: "current members" },
      { label: "Invited", value: `${invited.length}`, sub: "not yet accepted" },
      { label: "Seated", value: `${filled}`, sub: `of ${positions.length} positions` },
    ],
    charts: [
      {
        kind: "bar",
        title: "Positions",
        points: [
          { label: "Filled", value: filled },
          { label: "Unfilled", value: positions.length - filled },
        ],
      },
    ],
    recentHistory: [],
  };
}

async function computeOrganizationOverview(institutionId: string): Promise<ReportSnapshot> {
  const positions = await mockPeopleProvider.listPositions(institutionId);
  const active = positions.filter((p) => p.status === "active");
  const holdersByPosition = await Promise.all(active.map((p) => mockPeopleProvider.listPositionHolders(p.id)));
  const filled = holdersByPosition.filter((holders) => holders.some((h) => !h.endedAt)).length;
  const topLevel = active.filter((p) => p.reportsToPositionIds.length === 0).length;

  return {
    metrics: [
      { label: "Positions", value: `${active.length}`, sub: "active" },
      { label: "Filled", value: `${filled}`, sub: `${active.length - filled} unfilled` },
      { label: "Top-level", value: `${topLevel}`, sub: "report to no one" },
    ],
    charts: [
      {
        kind: "bar",
        title: "Filled vs unfilled",
        points: [
          { label: "Filled", value: filled },
          { label: "Unfilled", value: active.length - filled },
        ],
      },
    ],
    recentHistory: [],
  };
}

async function computeWorkSummary(institutionId: string, filters: ReportFilters): Promise<ReportSnapshot> {
  let items = await mockWorkProvider.listWorkItems(institutionId);
  if (filters.dateFrom || filters.dateTo) items = items.filter((i) => inRange(i.createdAt, filters));
  if (filters.projectId) items = items.filter((i) => i.projectId === filters.projectId);
  if (filters.personId) items = items.filter((i) => i.createdByPersonId === filters.personId || (i.kind === "task" && i.assigneePersonId === filters.personId));
  if (filters.status) items = items.filter((i) => i.status === filters.status);

  const tasks = items.filter((i) => i.kind === "task");
  const approvals = items.filter((i) => i.kind === "approval");
  const open = tasks.filter((t) => t.status === "open").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const complete = tasks.filter((t) => t.status === "complete").length;
  const pending = approvals.filter((a) => a.status === "pending").length;
  const approved = approvals.filter((a) => a.status === "approved").length;
  const rejected = approvals.filter((a) => a.status === "rejected").length;

  return {
    metrics: [
      { label: "Tasks", value: `${tasks.length}`, sub: `${open} open, ${inProgress} in progress, ${complete} complete` },
      { label: "Approvals", value: `${approvals.length}`, sub: `${pending} pending` },
    ],
    charts: [
      {
        kind: "bar",
        title: "Tasks by status",
        points: [
          { label: "Open", value: open },
          { label: "In progress", value: inProgress },
          { label: "Complete", value: complete },
        ],
      },
      {
        kind: "bar",
        title: "Approvals by outcome",
        points: [
          { label: "Pending", value: pending },
          { label: "Approved", value: approved },
          { label: "Rejected", value: rejected },
        ],
      },
    ],
    recentHistory: [],
  };
}

async function computeFinancialSummary(institutionId: string, filters: ReportFilters): Promise<ReportSnapshot> {
  let transactions = await mockFinanceProvider.listTransactions(institutionId);
  transactions = transactions.filter((t) => t.status !== "archived");
  if (filters.dateFrom || filters.dateTo) transactions = transactions.filter((t) => inRange(t.date, filters));
  if (filters.projectId) transactions = transactions.filter((t) => t.projectId === filters.projectId);
  if (filters.personId) transactions = transactions.filter((t) => t.createdByPersonId === filters.personId);
  if (filters.type) transactions = transactions.filter((t) => t.kind === filters.type);

  const income = transactions.filter((t) => t.kind === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
  const pendingApproval = transactions.filter((t) => t.kind === "expense" && t.approvalStatus === "pending").length;

  let assets = await mockFinanceProvider.listAssets(institutionId);
  if (filters.projectId) assets = assets.filter((a) => a.projectId === filters.projectId);
  const unaccounted = assets.filter((a) => a.status === "in_use" && !a.custodianPersonId).length;

  return {
    metrics: [
      { label: "Income", value: `₹${income.toLocaleString("en-IN")}`, sub: `${transactions.filter((t) => t.kind === "income").length} entries` },
      { label: "Expense", value: `₹${expense.toLocaleString("en-IN")}`, sub: `${pendingApproval} pending approval` },
      { label: "Net", value: `₹${(income - expense).toLocaleString("en-IN")}`, sub: "income minus expense" },
      { label: "Assets", value: `${assets.length}`, sub: `${unaccounted} unaccounted for` },
    ],
    charts: [
      {
        kind: "bar",
        title: "Income vs expense",
        points: [
          { label: "Income", value: income },
          { label: "Expense", value: expense },
        ],
      },
    ],
    recentHistory: [],
  };
}

async function computeCommunitySummary(institutionId: string, filters: ReportFilters): Promise<ReportSnapshot> {
  let contacts = await mockCommunityProvider.listContacts(institutionId);
  contacts = contacts.filter((c) => c.status === "active");
  if (filters.dateFrom || filters.dateTo) contacts = contacts.filter((c) => inRange(c.createdAt, filters));
  if (filters.projectId) contacts = contacts.filter((c) => c.projectId === filters.projectId);

  const byDirection = { receiving: 0, supporting: 0, supplying: 0 } as Record<string, number>;
  let unreachable = 0;
  let quiet = 0;
  for (const contact of contacts) {
    const reachable = !!contact.email || !!contact.phone || contact.pointsOfContact.length > 0;
    if (!reachable) unreachable += 1;
    for (const r of contact.relationships) {
      if (r.status !== "active") continue;
      byDirection[r.direction] += 1;
      const daysQuiet = Math.floor((Date.now() - new Date(r.lastActivityAt).getTime()) / 86_400_000);
      if (daysQuiet >= 180) quiet += 1;
    }
  }

  return {
    metrics: [
      { label: "Contacts", value: `${contacts.length}`, sub: `${unreachable} unreachable` },
      { label: "Quiet relationships", value: `${quiet}`, sub: "180+ days" },
    ],
    charts: [
      {
        kind: "bar",
        title: "Relationships by direction",
        points: Object.entries(byDirection).map(([k, v]) => ({ label: DIRECTION_LABELS[k as keyof typeof DIRECTION_LABELS], value: v })),
      },
    ],
    recentHistory: [],
  };
}

async function computeProjectSummary(institutionId: string, filters: ReportFilters): Promise<ReportSnapshot> {
  let projects = await mockProjectsProvider.listProjects(institutionId);
  projects = projects.filter((p) => p.status === "active");
  if (filters.dateFrom || filters.dateTo) projects = projects.filter((p) => inRange(p.createdAt, filters));
  if (filters.personId) projects = projects.filter((p) => p.ownerPersonId === filters.personId || p.members.some((m) => m.personId === filters.personId));
  if (filters.status) projects = projects.filter((p) => p.stage === filters.status);

  const blocked = projects.filter((p) => p.stage === "Blocked").length;
  const overdue = projects.filter((p) => p.targetDate && !p.completedAt && new Date(p.targetDate).getTime() < Date.now()).length;

  const byStage = new Map<string, number>();
  for (const p of projects) byStage.set(p.stage, (byStage.get(p.stage) ?? 0) + 1);

  return {
    metrics: [
      { label: "Active projects", value: `${projects.length}`, sub: `${blocked} blocked, ${overdue} overdue` },
    ],
    charts: [
      {
        kind: "bar",
        title: "Projects by stage",
        points: [...byStage.entries()].map(([label, value]) => ({ label, value })),
      },
    ],
    recentHistory: [],
  };
}

async function computeDocumentSummary(institutionId: string, filters: ReportFilters): Promise<ReportSnapshot> {
  let documents = await mockDocumentsProvider.listDocuments(institutionId);
  if (filters.dateFrom || filters.dateTo) documents = documents.filter((d) => inRange(d.createdAt, filters));
  if (filters.projectId) documents = documents.filter((d) => d.relationships.some((r) => r.relatedType === "project" && r.relatedId === filters.projectId));
  if (filters.personId) documents = documents.filter((d) => d.ownerPersonId === filters.personId || d.createdByPersonId === filters.personId);
  if (filters.type) documents = documents.filter((d) => d.type === filters.type);
  if (filters.status) documents = documents.filter((d) => d.status === filters.status);

  const active = documents.filter((d) => d.status !== "archived");
  const pendingApproval = documents.filter((d) => d.approvalStatus === "pending").length;
  const expiringOrExpired = documents.filter((d) => d.expiresAt && new Date(d.expiresAt).getTime() - Date.now() <= 30 * 86_400_000).length;

  const byStatus = new Map<string, number>();
  for (const d of documents) byStatus.set(d.status, (byStatus.get(d.status) ?? 0) + 1);

  return {
    metrics: [
      { label: "Documents", value: `${active.length}`, sub: "kept" },
      { label: "Awaiting approval", value: `${pendingApproval}`, sub: "" },
      { label: "Expiring or expired", value: `${expiringOrExpired}`, sub: "within 30 days" },
    ],
    charts: [
      {
        kind: "bar",
        title: "Documents by status",
        points: [...byStatus.entries()].map(([k, v]) => ({ label: DOCUMENT_STATUS_LABELS[k as keyof typeof DOCUMENT_STATUS_LABELS], value: v })),
      },
    ],
    recentHistory: [],
  };
}

async function computeHistorySummary(institutionId: string, filters: ReportFilters): Promise<ReportSnapshot> {
  let entries = await listHistory(institutionId);
  if (filters.dateFrom || filters.dateTo) entries = entries.filter((e) => inRange(e.occurredAt, filters));

  const last7Days = entries.filter((e) => Date.now() - new Date(e.occurredAt).getTime() <= 7 * 86_400_000).length;

  return {
    metrics: [
      { label: "Events", value: `${entries.length}`, sub: filters.dateFrom || filters.dateTo ? "in range" : "all time" },
      { label: "Last 7 days", value: `${last7Days}`, sub: "events" },
    ],
    charts: [],
    recentHistory: entries.slice(0, 20).map((e) => ({ id: e.id, summary: e.summary, occurredAt: e.occurredAt })),
  };
}

export async function computeSnapshot(category: ReportCategory, institutionId: string, filters: ReportFilters): Promise<ReportSnapshot> {
  switch (category) {
    case "institution_overview":
      return computeInstitutionOverview(institutionId, filters);
    case "people_overview":
      return computePeopleOverview(institutionId);
    case "organization_overview":
      return computeOrganizationOverview(institutionId);
    case "work_summary":
      return computeWorkSummary(institutionId, filters);
    case "financial_summary":
      return computeFinancialSummary(institutionId, filters);
    case "community_summary":
      return computeCommunitySummary(institutionId, filters);
    case "project_summary":
      return computeProjectSummary(institutionId, filters);
    case "document_summary":
      return computeDocumentSummary(institutionId, filters);
    case "history_summary":
      return computeHistorySummary(institutionId, filters);
  }
}
