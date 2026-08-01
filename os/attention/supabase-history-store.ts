import "server-only";
import { db } from "@/lib/db/client";
import type { HistoryEntry } from "./types";

type HistoryRow = {
  id: string;
  summary: string;
  occurred_at: string;
  subject_type: string | null;
  subject_id: string | null;
};

function toHistoryEntry(row: HistoryRow): HistoryEntry {
  return {
    id: row.id,
    summary: row.summary,
    occurredAt: row.occurred_at,
    subjectType: row.subject_type ?? undefined,
    subjectId: row.subject_id ?? undefined,
  };
}

/** Fire-and-forget by design, same as the mock store's synchronous
 *  `recordHistory` — every call site across every application calls this
 *  without awaiting. A failed history write must never fail the action
 *  that triggered it, so errors are logged, not thrown. */
export function recordHistory(institutionId: string, summary: string, subject?: { subjectType: string; subjectId: string }): void {
  db()
    .from("history_entries")
    .insert({
      institution_id: institutionId,
      summary,
      subject_type: subject?.subjectType ?? null,
      subject_id: subject?.subjectId ?? null,
    })
    .then(({ error }) => {
      if (error) console.error("recordHistory failed", error);
    });
}

export async function listHistory(institutionId: string): Promise<HistoryEntry[]> {
  const { data, error } = await db()
    .from("history_entries")
    .select("*")
    .eq("institution_id", institutionId)
    .order("occurred_at", { ascending: false });
  if (error) throw error;
  return (data as HistoryRow[]).map(toHistoryEntry);
}

export async function listHistoryForSubject(institutionId: string, subjectType: string, subjectId: string): Promise<HistoryEntry[]> {
  const { data, error } = await db()
    .from("history_entries")
    .select("*")
    .eq("institution_id", institutionId)
    .eq("subject_type", subjectType)
    .eq("subject_id", subjectId)
    .order("occurred_at", { ascending: false });
  if (error) throw error;
  return (data as HistoryRow[]).map(toHistoryEntry);
}
