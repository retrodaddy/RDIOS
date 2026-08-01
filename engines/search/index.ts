import "server-only";
import { supabaseIdentityProvider } from "@/os/identity/supabase-provider";
import { listHistory } from "@/os/attention/supabase-history-store";
import { supabasePeopleProvider } from "@/applications/people/supabase-provider";
import { supabaseWorkProvider } from "@/applications/work/supabase-provider";
import { TASK_STATUS_LABELS, APPROVAL_STATUS_LABELS } from "@/applications/work/types";
import { supabaseFinanceProvider } from "@/applications/finance/supabase-provider";
import { ASSET_STATUS_LABELS } from "@/applications/finance/types";
import { supabaseCommunityProvider } from "@/applications/community/supabase-provider";
import { CONTACT_KIND_LABELS } from "@/applications/community/types";
import { supabaseProjectsProvider } from "@/applications/projects/supabase-provider";
import { supabaseDocumentsProvider } from "@/applications/documents/supabase-provider";
import { DOCUMENT_STATUS_LABELS } from "@/applications/documents/types";
import { supabaseReportsProvider } from "@/applications/reports/supabase-provider";
import { REPORT_CATEGORY_LABELS } from "@/applications/reports/types";
import { rankResults } from "./rank";
import type { SearchApplication, SearchFilters, SearchResult } from "./types";

/**
 * The index — one adapter function per application, each reading the
 * exact same provider every application's own page already reads.
 * Nothing here is a new data source; this file only ever composes
 * existing reads into one shape. Every adapter is institution-scoped by
 * construction (every provider call takes `institutionId`), which is
 * the entire governance story Search needs — see the module header for
 * why nothing more is required.
 */

function latest(...dates: (string | null | undefined)[]): string {
  const valid = dates.filter((d): d is string => !!d);
  return valid.length > 0 ? valid.reduce((a, b) => (new Date(a).getTime() > new Date(b).getTime() ? a : b)) : new Date(0).toISOString();
}

async function indexPeople(institutionId: string): Promise<SearchResult[]> {
  const memberships = await supabaseIdentityProvider.listMembershipsForInstitution(institutionId);
  const results: SearchResult[] = [];
  for (const m of memberships) {
    const person = await supabaseIdentityProvider.getPerson(m.personId);
    if (!person) continue;
    results.push({
      id: `people.person:${person.id}`,
      application: "people",
      subjectType: "people.person",
      subjectId: person.id,
      icon: "🧑",
      title: person.name,
      type: "Person",
      description: person.email,
      status: m.status.charAt(0).toUpperCase() + m.status.slice(1),
      lastUpdatedAt: m.createdAt,
      href: `/people/${person.id}`,
      keywords: [person.email, m.status],
    });
  }
  return results;
}

async function indexOrganization(institutionId: string): Promise<SearchResult[]> {
  const positions = await supabasePeopleProvider.listPositions(institutionId);
  const results: SearchResult[] = [];
  for (const p of positions) {
    const holders = await supabasePeopleProvider.listPositionHolders(p.id);
    const activeHolder = holders.find((h) => !h.endedAt);
    let holderName = "Vacant";
    if (activeHolder) {
      const person = await supabaseIdentityProvider.getPerson(activeHolder.personId);
      holderName = person?.name ?? "Vacant";
    }
    results.push({
      id: `people.position:${p.id}`,
      application: "organization",
      subjectType: "people.position",
      subjectId: p.id,
      icon: "🏷️",
      title: p.name,
      type: "Position",
      description: p.description ?? `Held by ${holderName}`,
      status: p.status === "active" ? (activeHolder ? "Filled" : "Vacant") : "Archived",
      lastUpdatedAt: p.createdAt,
      href: `/people/organization?open=${p.id}`,
      keywords: [holderName],
    });
  }
  return results;
}

async function indexWork(institutionId: string): Promise<SearchResult[]> {
  const items = await supabaseWorkProvider.listWorkItems(institutionId);
  return items.map((item) => {
    const isTask = item.kind === "task";
    const lastUpdated = isTask
      ? latest(item.createdAt, item.completedAt)
      : latest(item.createdAt, ...item.chain.map((s) => s.decidedAt));
    return {
      id: `work.item:${item.id}`,
      application: "work" as SearchApplication,
      subjectType: "work.item",
      subjectId: item.id,
      icon: "✅",
      title: item.title,
      type: isTask ? "Task" : "Approval",
      description: item.description ?? (isTask ? "Task" : "Approval"),
      status: isTask ? TASK_STATUS_LABELS[item.status] : APPROVAL_STATUS_LABELS[item.status],
      lastUpdatedAt: lastUpdated,
      href: `/work?open=${item.id}`,
      keywords: [item.kind],
    };
  });
}

async function indexFinance(institutionId: string): Promise<{ finance: SearchResult[]; assets: SearchResult[] }> {
  const transactions = await supabaseFinanceProvider.listTransactions(institutionId);
  const finance: SearchResult[] = transactions.map((t) => {
    const isExpense = t.kind === "expense";
    return {
      id: `finance.transaction:${t.id}`,
      application: "finance" as SearchApplication,
      subjectType: "finance.transaction",
      subjectId: t.id,
      icon: "💰",
      title: t.title,
      type: isExpense ? "Expense" : "Income",
      description: `₹${t.amount.toLocaleString("en-IN")} — ${isExpense ? t.category : t.source}`,
      status: t.status === "archived" ? "Archived" : isExpense ? `${t.approvalStatus}` : "Recorded",
      lastUpdatedAt: isExpense ? latest(t.createdAt, t.decidedAt) : t.createdAt,
      href: `/money?open=${t.id}&tab=transactions`,
      keywords: isExpense ? [t.category, t.payee ?? ""] : [t.source],
    };
  });

  const rawAssets = await supabaseFinanceProvider.listAssets(institutionId);
  const assets: SearchResult[] = rawAssets.map((a) => ({
    id: `finance.asset:${a.id}`,
    application: "assets" as SearchApplication,
    subjectType: "finance.asset",
    subjectId: a.id,
    icon: "📦",
    title: a.name,
    type: "Asset",
    description: a.category,
    status: ASSET_STATUS_LABELS[a.status],
    lastUpdatedAt: a.createdAt,
    href: `/money?open=${a.id}&tab=assets`,
    keywords: [a.category, a.location ?? ""],
  }));

  return { finance, assets };
}

async function indexCommunity(institutionId: string): Promise<SearchResult[]> {
  const contacts = await supabaseCommunityProvider.listContacts(institutionId);
  return contacts.map((c) => {
    const primary = c.relationships.find((r) => r.status === "active") ?? c.relationships[0] ?? null;
    return {
      id: `community.contact:${c.id}`,
      application: "community" as SearchApplication,
      subjectType: "community.contact",
      subjectId: c.id,
      icon: "🤝",
      title: c.name,
      type: CONTACT_KIND_LABELS[c.kind],
      description: primary ? `${primary.type}` : (c.description ?? ""),
      status: c.status === "active" ? "Active" : "Archived",
      lastUpdatedAt: latest(c.createdAt, c.archivedAt, ...c.relationships.map((r) => r.lastActivityAt)),
      href: `/customers?open=${c.id}`,
      keywords: c.relationships.map((r) => r.type),
    };
  });
}

async function indexProjects(institutionId: string): Promise<SearchResult[]> {
  const projects = await supabaseProjectsProvider.listProjects(institutionId);
  return projects.map((p) => ({
    id: `projects.project:${p.id}`,
    application: "projects" as SearchApplication,
    subjectType: "projects.project",
    subjectId: p.id,
    icon: "📁",
    title: p.name,
    type: "Project",
    description: p.purpose ?? p.description ?? "Project",
    status: p.status === "archived" ? "Archived" : p.stage,
    lastUpdatedAt: latest(p.createdAt, p.completedAt, p.archivedAt),
    href: `/projects?open=${p.id}`,
    keywords: [p.stage, p.priority],
  }));
}

async function indexDocuments(institutionId: string): Promise<SearchResult[]> {
  const documents = await supabaseDocumentsProvider.listDocuments(institutionId);
  return documents.map((d) => ({
    id: `documents.document:${d.id}`,
    application: "documents" as SearchApplication,
    subjectType: "documents.document",
    subjectId: d.id,
    icon: "📄",
    title: d.title,
    type: d.type,
    description: d.description ?? d.type,
    status: d.approvalStatus !== "none" ? `${DOCUMENT_STATUS_LABELS[d.status]} — ${d.approvalStatus}` : DOCUMENT_STATUS_LABELS[d.status],
    lastUpdatedAt: d.modifiedAt,
    href: `/documents?open=${d.id}`,
    keywords: [d.type, d.documentNumber ?? ""],
  }));
}

async function indexReports(institutionId: string): Promise<SearchResult[]> {
  const reports = await supabaseReportsProvider.listReports(institutionId);
  return reports.map((r) => ({
    id: `reports.report:${r.id}`,
    application: "reports" as SearchApplication,
    subjectType: "reports.report",
    subjectId: r.id,
    icon: "📊",
    title: r.title,
    type: REPORT_CATEGORY_LABELS[r.category],
    description: r.description ?? REPORT_CATEGORY_LABELS[r.category],
    status: "Generated",
    lastUpdatedAt: r.generatedAt,
    href: `/reports?open=${r.id}`,
    keywords: [r.category],
  }));
}

async function indexHistory(institutionId: string): Promise<SearchResult[]> {
  const entries = await listHistory(institutionId);
  return entries.map((e) => ({
    id: `history.entry:${e.id}`,
    application: "history" as SearchApplication,
    subjectType: "history.entry",
    subjectId: e.id,
    icon: "🕘",
    title: e.summary.length > 90 ? `${e.summary.slice(0, 87)}...` : e.summary,
    type: "History Event",
    description: new Date(e.occurredAt).toLocaleString(),
    status: "",
    lastUpdatedAt: e.occurredAt,
    // History entries have no drawer of their own anywhere on the
    // platform — Home is the one real place they're already shown, so
    // that's the existing experience this reuses, never a new one.
    href: "/home",
    keywords: [],
  }));
}

async function buildIndex(institutionId: string, application: SearchApplication | null): Promise<SearchResult[]> {
  const wants = (a: SearchApplication) => !application || application === a;
  const results: SearchResult[] = [];

  if (wants("people")) results.push(...(await indexPeople(institutionId)));
  if (wants("organization")) results.push(...(await indexOrganization(institutionId)));
  if (wants("work")) results.push(...(await indexWork(institutionId)));
  if (wants("finance") || wants("assets")) {
    const { finance, assets } = await indexFinance(institutionId);
    if (wants("finance")) results.push(...finance);
    if (wants("assets")) results.push(...assets);
  }
  if (wants("community")) results.push(...(await indexCommunity(institutionId)));
  if (wants("projects")) results.push(...(await indexProjects(institutionId)));
  if (wants("documents")) results.push(...(await indexDocuments(institutionId)));
  if (wants("reports")) results.push(...(await indexReports(institutionId)));
  if (wants("history")) results.push(...(await indexHistory(institutionId)));

  return results;
}

function applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
  return results.filter((r) => {
    if (filters.type && r.type.toLowerCase() !== filters.type.toLowerCase()) return false;
    if (filters.status && r.status.toLowerCase() !== filters.status.toLowerCase()) return false;
    if (filters.dateFrom && new Date(r.lastUpdatedAt).getTime() < new Date(filters.dateFrom).getTime()) return false;
    if (filters.dateTo && new Date(r.lastUpdatedAt).getTime() > new Date(filters.dateTo).getTime() + 86_400_000 - 1) return false;
    return true;
  });
}

/** The one entry point — "Search queries the platform," per the brief,
 *  so this is the only function anything outside `engines/search/`
 *  should ever call. Institution-scoped, query-required (an empty query
 *  returns nothing rather than dumping the whole institution), ranked,
 *  filtered. */
export async function searchInstitution(institutionId: string, query: string, filters: SearchFilters): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const candidates = await buildIndex(institutionId, filters.application);
  const filtered = applyFilters(candidates, filters);
  return rankResults(filtered, query);
}

/** A second, query-free entry point — structured discovery rather than
 *  keyword search, for callers that need "every X" or "the most
 *  recently touched Xs" rather than a text match. `searchInstitution`
 *  stays the one entry point a person's own typed query goes through;
 *  this is the one a machine caller (M13's Tamizhi Engine, browsing
 *  for evidence rather than searching for a term) goes through instead
 *  — still never a raw application provider, still institution-scoped,
 *  still the same filters and the same `SearchResult` shape. Sorted by
 *  recency, since there's no query to rank relevance against. */
export async function browseInstitution(institutionId: string, filters: SearchFilters): Promise<SearchResult[]> {
  const candidates = await buildIndex(institutionId, filters.application);
  const filtered = applyFilters(candidates, filters);
  return [...filtered].sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
}
