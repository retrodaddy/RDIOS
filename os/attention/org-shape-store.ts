import "server-only";

/**
 * The smallest possible implementation of "shape your organization" per
 * Institution Setup Experience v2 — deliberately NOT the frozen People
 * Domain Review's Position schema (append-only holder history, reporting
 * graph, permissions). That's the Organization Builder's job (Roadmap M4),
 * built on real Position data once People (M3) exists. This is a single
 * free-text description, offered once, skippable, remembered permanently
 * in Be Aware — satisfying the frozen design's Act Now card without
 * inventing a parallel org-chart engine ahead of schedule.
 */
type Store = Map<string, { description: string | null; shapedAt: string }>; // institutionId -> state

const g = globalThis as unknown as { __rdiosOrgShapeStore?: Store };

function store(): Store {
  if (!g.__rdiosOrgShapeStore) g.__rdiosOrgShapeStore = new Map();
  return g.__rdiosOrgShapeStore;
}

export async function isOrganizationShaped(institutionId: string): Promise<boolean> {
  return store().has(institutionId);
}

export async function getOrganizationShape(institutionId: string): Promise<string | null> {
  return store().get(institutionId)?.description ?? null;
}

/** `description` null means explicitly skipped — still marks the card
 *  done (never forced back), but leaves nothing behind in Be Aware. */
export function setOrganizationShape(institutionId: string, description: string | null): void {
  store().set(institutionId, { description: description?.trim() || null, shapedAt: new Date().toISOString() });
}
