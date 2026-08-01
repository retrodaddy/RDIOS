import "server-only";
import { supabasePeopleProvider } from "@/applications/people/supabase-provider";
import type { Institution, Person } from "@/os/identity/types";
import type { Position } from "@/applications/people/types";
import { PERMISSIONS, type PermissionKey } from "./types";

/**
 * Authority Engine — resolved once per request, unioned from real Position
 * grants, exactly the "role grants ∪ Position grants, resolved once"
 * mechanism the Product Foundation named reusable from RDE. There is no
 * separate role field and no delegation chain: authority lives entirely
 * on the organization graph M4 built, per the founder's explicit
 * instruction to build M5 around that real graph rather than invent a
 * parallel role system beside it.
 *
 * The founder — the person who created the institution — always holds
 * every responsibility, regardless of which Positions they hold or
 * don't. Every institution needs one person authority can never lock out
 * of, the same bootstrap problem every real institution solves the same
 * way: someone has to be able to grant the first responsibility.
 */
export async function resolvePermissions(institution: Institution, person: Person): Promise<Set<PermissionKey>> {
  if (institution.founderPersonId === person.id) {
    return new Set(PERMISSIONS);
  }

  const holdings = await supabasePeopleProvider.listPositionHoldersForPerson(person.id);
  const activePositionIds = new Set(holdings.filter((h) => !h.endedAt).map((h) => h.positionId));
  if (activePositionIds.size === 0) return new Set();

  const positions = await supabasePeopleProvider.listPositions(institution.id);
  const granted = new Set<PermissionKey>();
  for (const position of positions) {
    if (!activePositionIds.has(position.id)) continue;
    for (const key of position.responsibilities) {
      if ((PERMISSIONS as readonly string[]).includes(key)) granted.add(key as PermissionKey);
    }
  }
  return granted;
}

/** Every Position currently carrying a given Area — the real substance
 *  behind an Approval Chain step (Governance & Responsibility Model v1
 *  §5): a step names an Area, never a person, and this is how it's
 *  resolved back into "who, right now." */
export async function listPositionsWithResponsibility(institutionId: string, area: PermissionKey): Promise<Position[]> {
  const positions = await supabasePeopleProvider.listPositions(institutionId);
  return positions.filter((p) => p.responsibilities.includes(area));
}

/** Can this person currently satisfy an Approval Chain step for this
 *  Area? The founder always can (the same bootstrap rule as every other
 *  responsibility); otherwise, only an active holder of a Position that
 *  currently carries the Area. */
export async function personCanSatisfyArea(institution: Institution, person: Person, area: PermissionKey): Promise<boolean> {
  if (institution.founderPersonId === person.id) return true;
  const positions = await listPositionsWithResponsibility(institution.id, area);
  if (positions.length === 0) return false;
  const holdings = await supabasePeopleProvider.listPositionHoldersForPerson(person.id);
  const activePositionIds = new Set(holdings.filter((h) => !h.endedAt).map((h) => h.positionId));
  return positions.some((p) => activePositionIds.has(p.id));
}

/** Is this person currently the active holder of this specific Position?
 *  Used to check whether someone satisfies a step that has been
 *  escalated to a specific Position one hop up the org graph. */
export async function personHoldsPosition(personId: string, positionId: string): Promise<boolean> {
  const holdings = await supabasePeopleProvider.listPositionHoldersForPerson(personId);
  return holdings.some((h) => h.positionId === positionId && !h.endedAt);
}

/** Escalation (Governance & Responsibility Model v1 §7) — widens a stuck
 *  step's pool by one hop up the real M4 organization graph. Picks the
 *  first Position currently carrying the Area and returns the first
 *  Position it reports to, if any. Never reassigns the step; only adds a
 *  second Position whose holder may also satisfy it. */
export async function findEscalationTarget(institutionId: string, area: PermissionKey): Promise<string | null> {
  const positions = await listPositionsWithResponsibility(institutionId, area);
  const withParent = positions.find((p) => p.reportsToPositionIds.length > 0);
  return withParent ? withParent.reportsToPositionIds[0] : null;
}
