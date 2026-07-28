import "server-only";
import { randomUUID } from "crypto";
import type { HistoryEntry } from "./types";

/**
 * A minimal, honest preview of what the frozen Audit Engine Design v1
 * will be — summaries rendered once, at write time, append-only, tenant-
 * scoped. Not the real Audit Engine (no Events subscription, no
 * `audit_records` table, no permission layering yet) — this exists so
 * Home's History tier has something true to show before that engine is
 * built, never something invented to fill space.
 */
type Store = Map<string, HistoryEntry[]>; // institutionId -> entries, newest first

const g = globalThis as unknown as { __rdiosHistoryStore?: Store };

function store(): Store {
  if (!g.__rdiosHistoryStore) g.__rdiosHistoryStore = new Map();
  return g.__rdiosHistoryStore;
}

export function recordHistory(institutionId: string, summary: string): void {
  const s = store();
  const entries = s.get(institutionId) ?? [];
  entries.unshift({ id: randomUUID(), summary, occurredAt: new Date().toISOString() });
  s.set(institutionId, entries);
}

export async function listHistory(institutionId: string): Promise<HistoryEntry[]> {
  return store().get(institutionId) ?? [];
}
