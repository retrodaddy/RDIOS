/**
 * Tamizhi — M13, the third Shared Engine Layer piece after Authority and
 * Search, per the founder's own framing: an operating-system capability,
 * exactly like Search, History, Authority, and Attention — never another
 * application, never another sidebar, never another dashboard.
 *
 * This file defines the Core only. No intelligence is implemented here —
 * only the interfaces a real provider (rule-based today; OpenAI, Claude,
 * Gemini, a local model, or a future proprietary one later) produces
 * output through. Nothing in `engines/tamizhi/` ever mutates
 * institutional data; every type below is either read-only evidence
 * gathered through another engine, or a human's own decision about a
 * suggestion Tamizhi made.
 */

export const TAMIZHI_CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
export type TamizhiConfidence = (typeof TAMIZHI_CONFIDENCE_LEVELS)[number];
export const TAMIZHI_CONFIDENCE_LABELS: Record<TamizhiConfidence, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** One real fact a Recommendation cites — "Evidence must reference real
 *  records. No hallucination," per the brief. `subjectType`/`subjectId`
 *  reuse the exact polymorphic pair every Timeline on the platform
 *  already speaks; `href` reuses Universal Search's own link shape, so
 *  following a piece of evidence lands on the real, existing record,
 *  never a fabricated one. */
export type TamizhiEvidence = {
  text: string;
  subjectType: string | null;
  subjectId: string | null;
  href: string | null;
};

/** A record a Recommendation touches, discovered exclusively through
 *  Universal Search — the brief's own "using Universal Search
 *  references" instruction, reusing `SearchResult`'s own shape rather
 *  than inventing a second way to point at a record. */
export type TamizhiRelatedRecord = {
  title: string;
  application: string;
  href: string;
};

export const RECOMMENDATION_STATUSES = ["created", "accepted", "dismissed", "deferred"] as const;
export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

/** The brief's own Recommendation Model, field for field — Identity,
 *  Title, Explanation, Evidence, Confidence, Related Records, Status.
 *  Nothing more. `providerName` is the one addition, and it's
 *  deliberate: the platform records which provider produced a given
 *  Recommendation without ever branching on it — the same "the platform
 *  should never know which provider produced a recommendation"
 *  discipline the brief names for the future OpenAI/Claude/Gemini/
 *  local-model/rule-engine swap. */
export type Recommendation = {
  id: string;
  institutionId: string;
  /** A stable key per standing issue (e.g. "stuck-approvals-vacant-
   *  position") — how the engine avoids recommending the same thing
   *  twice while a human's prior decision on it still stands, without
   *  needing a full historical record of every recommendation ever
   *  shown. */
  ruleKey: string;
  title: string;
  explanation: string;
  evidence: TamizhiEvidence[];
  confidence: TamizhiConfidence;
  relatedRecords: TamizhiRelatedRecord[];
  status: RecommendationStatus;
  providerName: string;
  createdAt: string;
  decidedAt: string | null;
  decidedByPersonId: string | null;
};

/**
 * The brief names five possible Tamizhi outputs — Observation,
 * Recommendation, Explanation, Summary, Question — and says build only
 * the Core. Recommendation is the one the brief gives a complete model,
 * a worked example, and a full accept/dismiss/defer lifecycle for, so
 * it's the only one with a real provider and real persistence this
 * milestone. The other four are defined here as real, honest interfaces
 * — "implement the interfaces" — ready for a future milestone to
 * produce, not yet produced by anything. */
export type TamizhiObservation = { id: string; text: string; evidence: TamizhiEvidence[] };
export type TamizhiExplanation = { id: string; question: string; answer: string; evidence: TamizhiEvidence[] };
export type TamizhiSummary = { id: string; title: string; text: string; evidence: TamizhiEvidence[] };
export type TamizhiQuestion = { id: string; text: string; context: string };
