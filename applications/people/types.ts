/**
 * People — the first Application Layer module, per the Product Foundation's
 * frozen folder structure (`applications/`, distinct from `os/`). Shapes
 * follow the frozen People Domain Review v1 exactly:
 *
 * - Position — authority, append-only holder history. Multi-parent
 *   reporting (`reportsToPositionIds`), per M4's Organization Builder —
 *   a Position can genuinely report to more than one seat (a dotted-line
 *   report, a co-led department), the real-world shape the M3 single-parent
 *   placeholder was always a stand-in for. `canvasX`/`canvasY` persist
 *   where a founder dragged the node so the graph doesn't rearrange itself
 *   between visits — view-state that happens to live on the domain object
 *   rather than a separate OS-level preference, since it's this specific
 *   Position's placement, not a person's general UI preference.
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
  /** Optional — the position's purpose, shown in the Organization Builder's
   *  side panel. Free text, same "smallest implementation" discipline as
   *  every other label here. */
  description: string | null;
  /** Multi-parent: a Position can report to more than one seat. Empty
   *  array means top-level. */
  reportsToPositionIds: string[];
  /** What whoever holds this seat is answerable for — the Authority
   *  Engine's only real input (M5). Not a role, not an access level: a
   *  Position genuinely carries these responsibilities regardless of who
   *  fills it, the same way a real institution's org chart works.
   *  Editable only by the institution's founder for now — see the
   *  Authority Engine's bootstrap rule. */
  responsibilities: import("@/engines/authority/types").PermissionKey[];
  canvasX: number;
  canvasY: number;
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
