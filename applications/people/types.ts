/**
 * People — the first Application Layer module, per the Product Foundation's
 * frozen folder structure (`applications/`, distinct from `os/`). Shapes
 * follow the frozen People Domain Review v1 exactly:
 *
 * - Position — authority, append-only holder history. Single-parent
 *   reporting for M3 (`reportsToPositionId`); the multi-parent graph the
 *   Organization Builder needs is M4's job, already named as an open
 *   unknown in the Master Roadmap, not solved here.
 * - Affiliation — a real, non-authority relationship (volunteer, donor,
 *   board member), append-only, same lifecycle shape as Position.
 * - Capability — a person's *current* qualification, deliberately NOT
 *   append-only, per the frozen Capability Domain Reconsideration: a
 *   capability is an attribute of present state, not a history of holding
 *   a slot.
 *
 * All three are tenant-scoped through `institutionId`, never through
 * Position/Affiliation "type catalogs" — those are Institution
 * Configuration Layer scope, not yet built. Labels here are free text for
 * now, the same "smallest implementation that satisfies the frozen
 * concept" discipline M2 already used for the org-shape card.
 */

export const APPOINTMENT_TYPES = ["permanent", "acting", "temporary"] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];
export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  permanent: "Permanent",
  acting: "Acting",
  temporary: "Temporary",
};

export type Position = {
  id: string;
  institutionId: string;
  name: string;
  reportsToPositionId: string | null;
  status: "active" | "archived";
  createdAt: string;
};

/** Append-only — never deleted, only ended. */
export type PositionHolder = {
  id: string;
  positionId: string;
  personId: string;
  appointmentType: AppointmentType;
  startedAt: string;
  endedAt: string | null;
};

/** Append-only — a real relationship over time, never edited in place. */
export type Affiliation = {
  id: string;
  institutionId: string;
  personId: string;
  label: string;
  startedAt: string;
  endedAt: string | null;
};

/** NOT append-only — a person's current qualification. Revoking removes
 *  it; it isn't a historical record the way Position/Affiliation are. */
export type Capability = {
  id: string;
  institutionId: string;
  personId: string;
  label: string;
  grantedAt: string;
};
