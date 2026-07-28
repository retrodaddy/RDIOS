import "server-only";
import { mockPeopleProvider } from "@/applications/people/mock-provider";
import type { Institution, Person } from "@/os/identity/types";
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

  const holdings = await mockPeopleProvider.listPositionHoldersForPerson(person.id);
  const activePositionIds = new Set(holdings.filter((h) => !h.endedAt).map((h) => h.positionId));
  if (activePositionIds.size === 0) return new Set();

  const positions = await mockPeopleProvider.listPositions(institution.id);
  const granted = new Set<PermissionKey>();
  for (const position of positions) {
    if (!activePositionIds.has(position.id)) continue;
    for (const key of position.responsibilities) {
      if ((PERMISSIONS as readonly string[]).includes(key)) granted.add(key as PermissionKey);
    }
  }
  return granted;
}
