import "server-only";
import { db } from "@/lib/db/client";
import type { Recommendation, RecommendationStatus } from "./types";
import type { RecommendationDraft } from "./provider";

type RecommendationRow = {
  id: string;
  institution_id: string;
  rule_key: string;
  title: string;
  explanation: string;
  evidence: Recommendation["evidence"];
  confidence: Recommendation["confidence"];
  related_records: Recommendation["relatedRecords"];
  status: RecommendationStatus;
  provider_name: string;
  created_at: string;
  decided_at: string | null;
  decided_by_person_id: string | null;
};

function toRecommendation(row: RecommendationRow): Recommendation {
  return {
    id: row.id,
    institutionId: row.institution_id,
    ruleKey: row.rule_key,
    title: row.title,
    explanation: row.explanation,
    evidence: row.evidence,
    confidence: row.confidence,
    relatedRecords: row.related_records,
    status: row.status,
    providerName: row.provider_name,
    createdAt: row.created_at,
    decidedAt: row.decided_at,
    decidedByPersonId: row.decided_by_person_id,
  };
}

export async function listRecommendations(institutionId: string): Promise<Recommendation[]> {
  const { data, error } = await db()
    .from("tamizhi_recommendations")
    .select("*")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as RecommendationRow[]).map(toRecommendation);
}

export async function getRecommendation(id: string): Promise<Recommendation | null> {
  const { data, error } = await db().from("tamizhi_recommendations").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toRecommendation(data as RecommendationRow) : null;
}

export async function hasRecommendationForRule(institutionId: string, ruleKey: string): Promise<boolean> {
  const { count, error } = await db()
    .from("tamizhi_recommendations")
    .select("id", { count: "exact", head: true })
    .eq("institution_id", institutionId)
    .eq("rule_key", ruleKey);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function createRecommendation(institutionId: string, draft: RecommendationDraft, providerName: string): Promise<Recommendation> {
  const { data, error } = await db()
    .from("tamizhi_recommendations")
    .insert({
      institution_id: institutionId,
      rule_key: draft.ruleKey,
      title: draft.title,
      explanation: draft.explanation,
      evidence: draft.evidence,
      confidence: draft.confidence,
      related_records: draft.relatedRecords,
      status: "created",
      provider_name: providerName,
      decided_at: null,
      decided_by_person_id: null,
    })
    .select()
    .single();
  if (error) throw error;
  return toRecommendation(data as RecommendationRow);
}

export async function decideRecommendation(
  id: string,
  status: Exclude<RecommendationStatus, "created">,
  decidedByPersonId: string
): Promise<Recommendation | null> {
  // Guarded on `status = 'created'` here, not just by the caller's prior
  // read — a concurrent decision finds 0 matching rows and returns null.
  const { data, error } = await db()
    .from("tamizhi_recommendations")
    .update({ status, decided_at: new Date().toISOString(), decided_by_person_id: decidedByPersonId })
    .eq("id", id)
    .eq("status", "created")
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? toRecommendation(data as RecommendationRow) : null;
}
