import "server-only";
import type { PermissionKey } from "@/engines/authority/types";
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
    createdByPersonId: string | null;
  }): Promise<Position>;
  /** Renames and/or redescribes a Position — the Organization Builder side
   *  panel's editable fields. Undefined leaves a field unchanged. */
  updatePositionDetails(positionId: string, input: { name?: string; description?: string | null }): Promise<Position | null>;
  /** Replaces the full parent set in one call — the drag-to-connect
   *  interaction always knows the complete resulting set, never a single
   *  add/remove. Rejects (`ok: false`) any set that would make the
   *  Position its own ancestor — a real graph invariant the multi-parent
   *  shape introduced that the old single-parent tree couldn't violate. */
  updatePositionParents(
    positionId: string,
    reportsToPositionIds: string[]
  ): Promise<{ ok: true; position: Position } | { ok: false; error: string }>;
  /** Persists where a founder dragged a node — cosmetic layout, never
   *  written to History. */
  movePosition(positionId: string, canvasX: number, canvasY: number): Promise<Position | null>;
  /** Sets the complete responsibility set a Position carries (M5).
   *  Founder-only at the action layer — see the Authority Engine's
   *  bootstrap rule. */
  updatePositionResponsibilities(positionId: string, responsibilities: PermissionKey[]): Promise<Position | null>;

  /** Every holder, past and present, for one Position — the append-only
   *  history the frozen design requires. */
  listPositionHolders(positionId: string): Promise<PositionHolder[]>;
  /** Every Position a person currently or ever held, across the
   *  institution — what a profile screen actually needs to show. */
  listPositionHoldersForPerson(personId: string): Promise<PositionHolder[]>;
  /** Closes any existing active holder on the Position, then appoints the
   *  new one — never two active holders on one seat at once. */
  appointHolder(input: { positionId: string; personId: string; appointmentType: AppointmentType }): Promise<PositionHolder>;
  getPositionHolder(holderId: string): Promise<PositionHolder | null>;
  endHolder(holderId: string): Promise<{ ok: boolean; error?: string }>;

  listAffiliationsForPerson(personId: string): Promise<Affiliation[]>;
  getAffiliation(affiliationId: string): Promise<Affiliation | null>;
  addAffiliation(input: { institutionId: string; personId: string; label: string }): Promise<Affiliation>;
  endAffiliation(affiliationId: string): Promise<{ ok: boolean; error?: string }>;

  listCapabilitiesForPerson(personId: string): Promise<Capability[]>;
  getCapability(capabilityId: string): Promise<Capability | null>;
  grantCapability(input: { institutionId: string; personId: string; label: string }): Promise<Capability>;
  revokeCapability(capabilityId: string): Promise<{ ok: boolean; error?: string }>;

  /** Atomic Offboarding, minimal M3 shape — ends every active Position
   *  holding and Affiliation this person has in this institution. Work
   *  Item reassignment (RDE's fuller version) has nothing to reassign yet;
   *  Work doesn't exist in RDIOS until M6. */
  offboardPerson(institutionId: string, personId: string): Promise<{ closedPositions: number; closedAffiliations: number }>;
}
