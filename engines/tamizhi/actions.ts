"use server";

import { getIdentityContext } from "@/os/identity/session";
import { recordHistory } from "@/os/attention/supabase-history-store";
import { decideRecommendation, getRecommendation } from "./supabase-store";

export type ActionResult = { ok: boolean; error?: string };

const SUBJECT_TYPE = "tamizhi.recommendation";

/** Tamizhi never executes — it only records a human's decision. Per the
 *  brief's own example phrasing, History narrates the *person's* action
 *  ("Founder dismissed recommendation"), never Tamizhi's ("Tamizhi
 *  analyzed..."). No Area of Responsibility gates these — a
 *  Recommendation is advisory only, mutates nothing, and any active
 *  member of the institution the evidence is already visible to may
 *  decide what to do with it. */
async function decide(id: string, status: "accepted" | "dismissed" | "deferred", verb: string): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const recommendation = await getRecommendation(id);
  if (!recommendation || recommendation.institutionId !== ctx.institution.id) return { ok: false, error: "Not found." };
  if (recommendation.status !== "created") return { ok: false, error: "Already decided." };

  const result = await decideRecommendation(id, status, ctx.person.id);
  if (!result) return { ok: false, error: "Already decided." };
  recordHistory(ctx.institution.id, `${ctx.person.name} ${verb} the recommendation "${recommendation.title}".`, {
    subjectType: SUBJECT_TYPE,
    subjectId: id,
  });
  return { ok: true };
}

export async function acceptRecommendationAction(id: string): Promise<ActionResult> {
  return decide(id, "accepted", "accepted");
}

export async function dismissRecommendationAction(id: string): Promise<ActionResult> {
  return decide(id, "dismissed", "dismissed");
}

export async function deferRecommendationAction(id: string): Promise<ActionResult> {
  return decide(id, "deferred", "deferred");
}
