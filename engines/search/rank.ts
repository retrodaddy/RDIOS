import "server-only";
import type { SearchResult } from "./types";

/**
 * Ranking — deliberately simple, per the brief: exact match, title,
 * keywords, relationships, recency. Nothing AI-driven, nothing semantic,
 * nothing vector-based. A single numeric score per candidate, then a
 * stable sort — the same discipline Institutional Policy Model v1
 * already applied to Business Rules: transparent, explainable, no black
 * box a founder can't reason about.
 */

const TIER_EXACT_TITLE = 100;
const TIER_TITLE_STARTS_WITH = 85;
const TIER_TITLE_CONTAINS = 70;
const TIER_KEYWORD_MATCH = 50;
const TIER_DESCRIPTION_MATCH = 30;

/** Returns `null` when the candidate doesn't match the query at all —
 *  callers filter those out before ranking, never show a zero-relevance
 *  result just to pad a list. */
export function scoreResult(result: SearchResult, query: string): number | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const title = result.title.toLowerCase();
  if (title === q) return TIER_EXACT_TITLE;
  if (title.startsWith(q)) return TIER_TITLE_STARTS_WITH;
  if (title.includes(q)) return TIER_TITLE_CONTAINS;
  if (result.keywords.some((k) => k.toLowerCase().includes(q))) return TIER_KEYWORD_MATCH;
  if (result.description.toLowerCase().includes(q)) return TIER_DESCRIPTION_MATCH;
  return null;
}

export function rankResults(results: SearchResult[], query: string): SearchResult[] {
  const scored = results
    .map((r) => ({ result: r, score: scoreResult(r, query) }))
    .filter((s): s is { result: SearchResult; score: number } => s.score !== null);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Recency is the tiebreaker within a tier, never the primary signal
    // — two equally-relevant matches show the more recently touched one
    // first, the same "honest, not invented" freshness signal every
    // Attention nudge on this platform already relies on.
    return new Date(b.result.lastUpdatedAt).getTime() - new Date(a.result.lastUpdatedAt).getTime();
  });

  return scored.map((s) => s.result);
}
