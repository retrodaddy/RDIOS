import "server-only";
import { randomUUID } from "crypto";
import type { Recommendation, RecommendationStatus } from "./types";
import type { RecommendationDraft } from "./provider";

/** In-memory, dev-only — the exact same `globalThis` singleton guard
 *  every other store on this platform uses (`os/attention/history-
 *  store.ts` is the closest precedent: a Shared Engine Layer piece that
 *  persists its own output without owning the institutional facts that
 *  output describes). Tamizhi "never owns data" refers to People,
 *  Finance, Work, and everything else it reads through Search and
 *  Reports — the Recommendations themselves, and the human decisions
 *  made about them, are Tamizhi's own generated artifacts, the same way
 *  History owns `HistoryEntry` rows without owning the events they
 *  narrate. */
type Store = Map<string, Recommendation[]>; // institutionId -> recommendations

const g = globalThis as unknown as { __rdiosTamizhiStore?: Store };

function store(): Store {
  if (!g.__rdiosTamizhiStore) g.__rdiosTamizhiStore = new Map();
  return g.__rdiosTamizhiStore;
}

export async function listRecommendations(institutionId: string): Promise<Recommendation[]> {
  return [...(store().get(institutionId) ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getRecommendation(id: string): Promise<Recommendation | null> {
  for (const list of store().values()) {
    const found = list.find((r) => r.id === id);
    if (found) return found;
  }
  return null;
}

/** Whether this exact standing issue already has a Recommendation a
 *  human hasn't resolved yet, or already decided — either way, the
 *  provider shouldn't be asked again for it. This is the whole dedupe
 *  mechanism: a `ruleKey` occupies at most one live-or-decided slot per
 *  institution, so refreshing Home a hundred times never produces a
 *  hundred copies of "approvals may be stuck." */
export async function hasRecommendationForRule(institutionId: string, ruleKey: string): Promise<boolean> {
  const list = store().get(institutionId) ?? [];
  return list.some((r) => r.ruleKey === ruleKey);
}

export async function createRecommendation(
  institutionId: string,
  draft: RecommendationDraft,
  providerName: string
): Promise<Recommendation> {
  const recommendation: Recommendation = {
    id: randomUUID(),
    institutionId,
    ruleKey: draft.ruleKey,
    title: draft.title,
    explanation: draft.explanation,
    evidence: draft.evidence,
    confidence: draft.confidence,
    relatedRecords: draft.relatedRecords,
    status: "created",
    providerName,
    createdAt: new Date().toISOString(),
    decidedAt: null,
    decidedByPersonId: null,
  };
  const list = store().get(institutionId) ?? [];
  list.push(recommendation);
  store().set(institutionId, list);
  return recommendation;
}

export async function decideRecommendation(
  id: string,
  status: Exclude<RecommendationStatus, "created">,
  decidedByPersonId: string
): Promise<Recommendation | null> {
  for (const list of store().values()) {
    const found = list.find((r) => r.id === id);
    if (found) {
      found.status = status;
      found.decidedAt = new Date().toISOString();
      found.decidedByPersonId = decidedByPersonId;
      return found;
    }
  }
  return null;
}
