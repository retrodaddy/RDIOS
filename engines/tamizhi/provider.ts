import "server-only";
import type { TamizhiConfidence, TamizhiEvidence, TamizhiRelatedRecord } from "./types";

/**
 * The provider seam — designed exactly as the brief instructs: "as if
 * providers can later become OpenAI, Claude, Gemini, a local LLM, a
 * rule engine, or a future proprietary model. The platform should never
 * know which provider produced a recommendation." Every field a
 * provider returns here is already in the brief's own Recommendation
 * Model shape; `engines/tamizhi/index.ts` (never the provider itself)
 * is the only place that assigns an id, a status, and persists the
 * result — a provider only ever proposes, it never writes.
 *
 * `TamizhiContext` is deliberately thin: an institution id, nothing
 * more. A provider has no way to reach a raw database handle, an
 * application's mock provider, or anything else — the only tools it's
 * handed are whatever it chooses to call from `engines/search` and
 * `applications/reports/analytics`, both already-permission-shaped,
 * already-institution-scoped reads. This is the literal enforcement of
 * "Tamizhi may read only through existing engines... never query
 * applications directly" — a provider that wanted to cheat would have
 * to reach past its own function signature to do it.
 */
export type TamizhiContext = {
  institutionId: string;
};

export type RecommendationDraft = {
  ruleKey: string;
  title: string;
  explanation: string;
  evidence: TamizhiEvidence[];
  confidence: TamizhiConfidence;
  relatedRecords: TamizhiRelatedRecord[];
};

export interface TamizhiProvider {
  readonly name: string;
  generateRecommendations(ctx: TamizhiContext): Promise<RecommendationDraft[]>;
}
