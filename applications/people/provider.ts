import "server-only";
import type { Affiliation, AppointmentType, Capability, Position, PositionHolder } from "./types";

/**
 * The swappable contract People is built behind — the same discipline as
 * `os/identity/provider.ts`. Backed today by an in-memory mock; a real
 * provider implements this exact interface later, nothing above it
 * changes.
 */
export interface PeopleProvider {
  listPositions(institutionId: string): Promise<Position[]>;
  getPosition(positionId: string): Promise<Position | null>;
  createPosition(input: {
    institutionId: string;
    name: string;
    reportsToPositionIds: string[];
    canvasX: number;
    canvasY: number;
  }): Promise<Position>;
  /** Renames and/or redescribes a Position — the Organization Builder side
   *  panel's editable fields. Undefined leaves a field unchanged. */
  updatePositionDetails(positionId: string, input: { name?: string; description?: string | null }): Promise<Position | null>;
  /** Replaces the full parent set in one call — the drag-to-connect
   *  interaction always knows the complete resulting set, never a single
   *  add/remove. */
  updatePositionParents(positionId: string, reportsToPositionIds: string[]): Promise<Position | null>;
  /** Persists where a founder dragged a node — cosmetic layout, never
   *  written to History. */
  movePosition(positionId: string, canvasX: number, canvasY: number): Promise<Position | null>;

  /** Every holder, past and present, for one Position — the append-only
   *  history the frozen design requires. */
  listPositionHolders(positionId: string): Promise<PositionHolder[]>;
  /** Every Position a person currently or ever held, across the
   *  institution — what a profile screen actually needs to show. */
  listPositionHoldersForPerson(personId: string): Promise<PositionHolder[]>;
  /** Closes any existing active holder on the Position, then appoints the
   *  new one — never two active holders on one seat at once. */
  appointHolder(input: { positionId: string; personId: string; appointmentType: AppointmentType }): Promise<PositionHolder>;
  endHolder(holderId: string): Promise<{ ok: boolean; error?: string }>;

  listAffiliationsForPerson(personId: string): Promise<Affiliation[]>;
  addAffiliation(input: { institutionId: string; personId: string; label: string }): Promise<Affiliation>;
  endAffiliation(affiliationId: string): Promise<{ ok: boolean; error?: string }>;

  listCapabilitiesForPerson(personId: string): Promise<Capability[]>;
  grantCapability(input: { institutionId: string; personId: string; label: string }): Promise<Capability>;
  revokeCapability(capabilityId: string): Promise<{ ok: boolean; error?: string }>;

  /** Atomic Offboarding, minimal M3 shape — ends every active Position
   *  holding and Affiliation this person has in this institution. Work
   *  Item reassignment (RDE's fuller version) has nothing to reassign yet;
   *  Work doesn't exist in RDIOS until M6. */
  offboardPerson(institutionId: string, personId: string): Promise<{ closedPositions: number; closedAffiliations: number }>;
}
