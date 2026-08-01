import "server-only";
import { ruleEngineProvider } from "./providers/rule-engine";
import { createRecommendation, hasRecommendationForRule, listRecommendations } from "./supabase-store";
import type { Recommendation } from "./types";
import type { TamizhiProvider } from "./provider";

/**
 * The Tamizhi Engine's one composed entry point — the same shape every
 * prior engine (`engines/authority`, `engines/search`) already uses:
 * one function outside code actually calls, everything else is a
 * private implementation detail. Today there is exactly one provider
 * (`ruleEngineProvider`); swapping in a real model later means adding a
 * provider and changing which one `activeProvider()` returns — nothing
 * about `generateRecommendations`, the store, the actions, or the Home
 * section changes, which is the entire point of the seam.
 */
function activeProvider(): TamizhiProvider {
  return ruleEngineProvider;
}

/** Runs the active provider and persists any genuinely new
 *  recommendations — "genuinely new" meaning no Recommendation for that
 *  `ruleKey` exists yet at all, decided or not, per the store's own
 *  dedupe rule. Cheap enough at this scale to call on every Home load;
 *  a real provider swap later might want this behind a cache or a
 *  schedule, but nothing about the interface would need to change to
 *  add that. */
export async function ensureRecommendationsGenerated(institutionId: string): Promise<void> {
  const provider = activeProvider();
  const drafts = await provider.generateRecommendations({ institutionId });
  for (const draft of drafts) {
    const exists = await hasRecommendationForRule(institutionId, draft.ruleKey);
    if (!exists) await createRecommendation(institutionId, draft, provider.name);
  }
}

/** Home's own read — "Add one new section. Tamizhi Observations.
 *  Maximum three visible." Only ever `status === "created"` (undecided)
 *  recommendations; anything a human already accepted, dismissed, or
 *  deferred stops showing up here, since re-surfacing a decided
 *  suggestion would be exactly the "another notification system" the
 *  brief says not to build. */
export async function composeTamizhiObservations(institutionId: string): Promise<Recommendation[]> {
  await ensureRecommendationsGenerated(institutionId);
  const all = await listRecommendations(institutionId);
  return all.filter((r) => r.status === "created").slice(0, 3);
}
