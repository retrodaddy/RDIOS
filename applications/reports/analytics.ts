import "server-only";
import { supabasePeopleProvider } from "@/applications/people/supabase-provider";
import { supabaseWorkProvider } from "@/applications/work/supabase-provider";
import { supabaseCommunityProvider } from "@/applications/community/supabase-provider";
import { supabaseProjectsProvider } from "@/applications/projects/supabase-provider";
import { supabaseDocumentsProvider } from "@/applications/documents/supabase-provider";
import { supabaseReportsProvider } from "./supabase-provider";

/**
 * Analytics — deliberately separate from Reports, per the brief: Reports
 * answer "what happened?", Analytics answers "what deserves attention?"
 * An Observation is a plain, observable fact, never an opinion — a count,
 * a comparison, never a judgment about whether it's good or bad. Nothing
 * here persists; every Observation is computed fresh from the same
 * providers Reports and Attention already read, the same "reports own
 * nothing, they summarize truth" discipline applied to Analytics too.
 *
 * Two kinds of Observation:
 * - Flat-fact: computable from live current state alone (an unfilled
 *   Position, a stuck Approval, an expiring Document).
 * - Trend: computable only by comparing two saved Reports of the same
 *   category — the one place this milestone gets genuine "rising/
 *   falling" analytics without inventing a separate time-series store.
 *   Reports already are historical snapshots; comparing the two most
 *   recent ones of a kind is the honest way to see a real trend, not a
 *   guess. Skipped entirely when fewer than two exist to compare.
 */

export type ObservationCategory = "people" | "work" | "finance" | "community" | "projects" | "documents";

export type Observation = {
  id: string;
  text: string;
  category: ObservationCategory;
  href: string;
};

const RELATIONSHIP_EARLY_QUIET_DAYS = 90;
const APPROVAL_STUCK_AFTER_DAYS = 7;
const DOCUMENT_EXPIRY_LOOKAHEAD_DAYS = 30;

export async function computeObservations(institutionId: string): Promise<Observation[]> {
  const observations: Observation[] = [];

  // Unfilled positions.
  const positions = await supabasePeopleProvider.listPositions(institutionId);
  const activePositions = positions.filter((p) => p.status === "active");
  const holdersByPosition = await Promise.all(activePositions.map((p) => supabasePeopleProvider.listPositionHolders(p.id)));
  const unfilled = holdersByPosition.filter((holders) => !holders.some((h) => !h.endedAt)).length;
  if (unfilled > 0) {
    observations.push({
      id: "unfilled-positions",
      text: `${unfilled} ${unfilled === 1 ? "position has" : "positions have"} no one holding ${unfilled === 1 ? "it" : "them"}.`,
      category: "people",
      href: "/people/organization",
    });
  }

  // Approvals waiting too long.
  const workItems = await supabaseWorkProvider.listWorkItems(institutionId);
  const stuckApprovals = workItems.filter(
    (i) => i.kind === "approval" && i.status === "pending" && Date.now() - new Date(i.createdAt).getTime() > APPROVAL_STUCK_AFTER_DAYS * 86_400_000
  ).length;
  if (stuckApprovals > 0) {
    observations.push({
      id: "stuck-approvals",
      text: `${stuckApprovals} ${stuckApprovals === 1 ? "approval has" : "approvals have"} been waiting more than a week.`,
      category: "work",
      href: "/work",
    });
  }

  // Documents expiring or expired.
  const documents = await supabaseDocumentsProvider.listDocuments(institutionId);
  const expiring = documents.filter(
    (d) => d.status !== "archived" && d.expiresAt && new Date(d.expiresAt).getTime() - Date.now() <= DOCUMENT_EXPIRY_LOOKAHEAD_DAYS * 86_400_000
  ).length;
  if (expiring > 0) {
    observations.push({
      id: "documents-expiring",
      text: `${expiring} ${expiring === 1 ? "document is" : "documents are"} expiring soon or already expired.`,
      category: "documents",
      href: "/documents",
    });
  }

  // Relationships going quiet — an earlier, softer threshold than
  // Attention's own 180-day nudge, giving Analytics its own distinct
  // early-warning value instead of just repeating the same fact later.
  const contacts = await supabaseCommunityProvider.listContacts(institutionId);
  let quietRelationships = 0;
  for (const contact of contacts) {
    if (contact.status !== "active") continue;
    for (const r of contact.relationships) {
      if (r.status !== "active") continue;
      const daysQuiet = Math.floor((Date.now() - new Date(r.lastActivityAt).getTime()) / 86_400_000);
      if (daysQuiet >= RELATIONSHIP_EARLY_QUIET_DAYS) quietRelationships += 1;
    }
  }
  if (quietRelationships > 0) {
    observations.push({
      id: "quiet-relationships",
      text: `${quietRelationships} ${quietRelationships === 1 ? "relationship has" : "relationships have"} gone quiet for over ${RELATIONSHIP_EARLY_QUIET_DAYS} days.`,
      category: "community",
      href: "/customers",
    });
  }

  // Projects blocked or overdue.
  const projects = await supabaseProjectsProvider.listProjects(institutionId);
  const activeProjects = projects.filter((p) => p.status === "active");
  const troubled = activeProjects.filter(
    (p) => p.stage === "Blocked" || (p.targetDate && !p.completedAt && new Date(p.targetDate).getTime() < Date.now())
  ).length;
  if (troubled > 0) {
    observations.push({
      id: "troubled-projects",
      text: `${troubled} ${troubled === 1 ? "project is" : "projects are"} blocked or past its target date.`,
      category: "projects",
      href: "/projects",
    });
  }

  // Trend: expenses rising or falling, comparing the two most recent
  // saved Financial Summary reports. Skipped entirely with fewer than
  // two to compare — no baseline, no honest trend claim.
  const financialReports = await supabaseReportsProvider.listReportsByCategory(institutionId, "financial_summary");
  if (financialReports.length >= 2) {
    const [latest, previous] = financialReports;
    const latestExpense = latest.snapshot.metrics.find((m) => m.label === "Expense");
    const previousExpense = previous.snapshot.metrics.find((m) => m.label === "Expense");
    if (latestExpense && previousExpense) {
      const latestValue = Number(latestExpense.value.replace(/[^\d.-]/g, ""));
      const previousValue = Number(previousExpense.value.replace(/[^\d.-]/g, ""));
      if (Number.isFinite(latestValue) && Number.isFinite(previousValue) && latestValue !== previousValue) {
        const direction = latestValue > previousValue ? "risen" : "fallen";
        observations.push({
          id: "expense-trend",
          text: `Expenses have ${direction} from ₹${previousValue.toLocaleString("en-IN")} to ₹${latestValue.toLocaleString("en-IN")} since your last Financial Summary report.`,
          category: "finance",
          href: "/reports",
        });
      }
    }
  }

  return observations;
}
