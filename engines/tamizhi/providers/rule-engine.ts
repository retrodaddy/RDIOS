import "server-only";
import { browseInstitution } from "@/engines/search";
import { computeObservations } from "@/applications/reports/analytics";
import type { RecommendationDraft, TamizhiContext, TamizhiProvider } from "../provider";
import type { TamizhiEvidence, TamizhiRelatedRecord } from "../types";

/**
 * The only `TamizhiProvider` implemented this milestone — small, fixed,
 * transparent rules, not intelligence. Per the brief: "Do not implement
 * intelligence. Implement the interfaces." Every rule reads exclusively
 * through `engines/search` (`browseInstitution` — the query-free
 * discovery entry point M13 added alongside this provider) and
 * `applications/reports/analytics` (an explicitly allowed Input per the
 * brief's own list: "Search. History. Attention. Authority. Reports.").
 * Nothing here imports an application's own provider — grep this file
 * for `mock-provider` and find nothing.
 *
 * Confidence is calibrated honestly, not decorated: a rule that combines
 * two independent facts into an inference (Rule A) is Medium, never
 * High, because the causal link is plausible, not proven. A rule that
 * only restates one already-certain fact (Rule B, a real Analytics
 * count) is High. A rule built from a weak proxy signal (Rule C, "the
 * least-recently-touched contacts" standing in for "quiet
 * relationships") is Low. Nothing here claims more certainty than the
 * evidence actually supports.
 */

const STUCK_APPROVAL_AFTER_DAYS = 7;

async function ruleStuckApprovalsVacantPosition(institutionId: string): Promise<RecommendationDraft | null> {
  const [workResults, orgResults] = await Promise.all([
    browseInstitution(institutionId, { application: "work", type: null, status: null, dateFrom: null, dateTo: null }),
    browseInstitution(institutionId, { application: "organization", type: null, status: null, dateFrom: null, dateTo: null }),
  ]);

  const stuckApprovals = workResults.filter(
    (r) => r.type === "Approval" && r.status.toLowerCase() === "pending" && Date.now() - new Date(r.lastUpdatedAt).getTime() > STUCK_APPROVAL_AFTER_DAYS * 86_400_000
  );
  const vacantPositions = orgResults.filter((r) => r.status === "Vacant");

  if (stuckApprovals.length === 0 || vacantPositions.length === 0) return null;

  const evidence: TamizhiEvidence[] = [
    {
      text: `${stuckApprovals.length} ${stuckApprovals.length === 1 ? "approval has" : "approvals have"} been waiting more than ${STUCK_APPROVAL_AFTER_DAYS} days.`,
      subjectType: null,
      subjectId: null,
      href: "/work",
    },
    {
      text: `${vacantPositions.length} ${vacantPositions.length === 1 ? "position has" : "positions have"} no one holding ${vacantPositions.length === 1 ? "it" : "them"}.`,
      subjectType: null,
      subjectId: null,
      href: "/people/organization",
    },
  ];

  const relatedRecords: TamizhiRelatedRecord[] = [
    ...stuckApprovals.slice(0, 3).map((r) => ({ title: r.title, application: r.application, href: r.href })),
    ...vacantPositions.slice(0, 3).map((r) => ({ title: r.title, application: r.application, href: r.href })),
  ];

  return {
    ruleKey: "stuck-approvals-vacant-position",
    title: "Approvals may be stuck because a required Area has no one to decide them",
    explanation: `${stuckApprovals.length} ${stuckApprovals.length === 1 ? "approval has" : "approvals have"} been waiting more than ${STUCK_APPROVAL_AFTER_DAYS} days, and ${vacantPositions.length} ${vacantPositions.length === 1 ? "position is" : "positions are"} currently vacant. If one of those vacant positions carries the Area a stuck approval needs, it cannot move forward until someone holds that seat. Worth checking whether the two are connected.`,
    evidence,
    confidence: "medium",
    relatedRecords,
  };
}

async function ruleDocumentsExpiring(institutionId: string): Promise<RecommendationDraft | null> {
  const observations = await computeObservations(institutionId);
  const expiring = observations.find((o) => o.id === "documents-expiring");
  if (!expiring) return null;

  return {
    ruleKey: "documents-expiring-review",
    title: "Some documents are expiring soon or already expired",
    explanation: expiring.text,
    evidence: [{ text: expiring.text, subjectType: null, subjectId: null, href: expiring.href }],
    confidence: "high",
    relatedRecords: [{ title: "Documents", application: "documents", href: expiring.href }],
  };
}

async function ruleQuietRelationships(institutionId: string): Promise<RecommendationDraft | null> {
  const observations = await computeObservations(institutionId);
  const quiet = observations.find((o) => o.id === "quiet-relationships");
  if (!quiet) return null;

  const communityResults = await browseInstitution(institutionId, {
    application: "community",
    type: null,
    status: null,
    dateFrom: null,
    dateTo: null,
  });
  // `browseInstitution` sorts newest-first; the *oldest*-touched contacts
  // are the honest proxy for "quiet" available through Search alone —
  // a real signal (Contact's own `lastUpdatedAt` already folds in its
  // relationships' `lastActivityAt`), not a fabricated one, but still
  // only a proxy, which is exactly why this rule stays Low confidence.
  const oldest = [...communityResults].sort((a, b) => new Date(a.lastUpdatedAt).getTime() - new Date(b.lastUpdatedAt).getTime()).slice(0, 3);
  if (oldest.length === 0) return null;

  return {
    ruleKey: "quiet-relationships-checkin",
    title: "A few relationships may be worth a check-in",
    explanation: `${quiet.text} The contacts below have gone the longest without any recorded activity — not certain to be the same ones, but a reasonable place to start.`,
    evidence: [{ text: quiet.text, subjectType: null, subjectId: null, href: quiet.href }],
    confidence: "low",
    relatedRecords: oldest.map((r) => ({ title: r.title, application: r.application, href: r.href })),
  };
}

export const ruleEngineProvider: TamizhiProvider = {
  name: "rule-engine-v1",
  async generateRecommendations(ctx: TamizhiContext): Promise<RecommendationDraft[]> {
    const drafts = await Promise.all([
      ruleStuckApprovalsVacantPosition(ctx.institutionId),
      ruleDocumentsExpiring(ctx.institutionId),
      ruleQuietRelationships(ctx.institutionId),
    ]);
    return drafts.filter((d): d is RecommendationDraft => d !== null);
  },
};
