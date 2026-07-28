/**
 * Authority — the first Shared Engine Layer piece, per the frozen Product
 * Foundation §7 ("Authorization's mechanism ... reusable from RDE").
 *
 * This is not a role catalog. Per the founder's own framing: permissions
 * exist to support responsibility, not to expose access-control
 * mechanics. Every key below names a real institutional responsibility —
 * something a specific Position is answerable for — never an abstract
 * "role" or "level." The catalog stays small and tied to what's actually
 * real today; it grows only when a genuinely new responsibility needs
 * gating, never speculatively.
 */
export const PERMISSIONS = ["members.invite", "organization.manage", "people.offboard"] as const;
export type PermissionKey = (typeof PERMISSIONS)[number];

/** Plain-language labels — what a founder sees when granting a
 *  responsibility to a Position, never the raw key. */
export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  "members.invite": "Invite new people",
  "organization.manage": "Manage positions and people",
  "people.offboard": "Offboard someone",
};

export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  "members.invite": "Bring new people into the institution.",
  "organization.manage": "Create and edit positions, appoint or end holders, add affiliations and capabilities.",
  "people.offboard": "End someone's positions and affiliations all at once when they leave.",
};
