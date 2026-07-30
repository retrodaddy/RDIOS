/**
 * Projects — M9, the platform's coordination layer, built exactly per the
 * founder's own Platform Integration Sprint 3 acceptance and M9 brief. Not
 * a task list, not a board: the container an institution already
 * understands as "how we accomplish something meaningful," under which
 * People, Work, Finance, and Community converge without any of them being
 * duplicated or redesigned.
 *
 * Stage is deliberately free text with suggested defaults, not a fixed
 * enum — the same reasoning Expense.category and Relationship.type already
 * use: no institution's real stage vocabulary ("Daily Ritual Management"
 * for a temple, "Admissions" milestones for a school) fits one hardcoded
 * list, and the founder explicitly asked for this to stay configurable
 * without a Policy Engine being built to do it.
 */

export const PROJECT_STATUSES = ["active", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  archived: "Archived",
};

export const PROJECT_PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];
export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

/** Manually set, never computed — the same discipline the Community
 *  Domain Reconsideration used to reject an automatic relationship
 *  "health score." A founder's own honest read of a project is worth
 *  more than an invented formula pretending to know one. */
export const PROJECT_HEALTHS = ["on_track", "at_risk", "off_track"] as const;
export type ProjectHealth = (typeof PROJECT_HEALTHS)[number];
export const PROJECT_HEALTH_LABELS: Record<ProjectHealth, string> = {
  on_track: "On track",
  at_risk: "At risk",
  off_track: "Off track",
};

/** The default Stage sequence every example in the M9 brief maps onto —
 *  a starting vocabulary, not a fixed list. An institution isn't limited
 *  to these; typing any other Stage name is a real, valid choice, the
 *  same "suggested, never enforced" pattern Community's Relationship.type
 *  already established. */
export const DEFAULT_PROJECT_STAGES = ["Planning", "Approved", "In Progress", "Blocked", "Completed", "Archived"] as const;

export const PROJECT_MEMBER_ROLES = ["member", "observer"] as const;
export type ProjectMemberRole = (typeof PROJECT_MEMBER_ROLES)[number];
export const PROJECT_MEMBER_ROLE_LABELS: Record<ProjectMemberRole, string> = {
  member: "Member",
  observer: "Observer",
};

/** Owner is its own top-level field, not a member role — every Project
 *  has exactly one, the same "one dedicated field, not a role inside a
 *  list" shape Work's `createdByPersonId` and Finance's `custodianPersonId`
 *  already use for the one person a record is answerable to. */
export type ProjectMember = {
  id: string;
  personId: string;
  role: ProjectMemberRole;
  addedAt: string;
};

/** A placeholder reference to a future institutional document — the exact
 *  pattern Finance and Community already proved for Expense/Asset/Contact,
 *  reused here unchanged, per the brief's explicit "reuse existing
 *  DocumentRef, no new mechanism." */
export type DocumentRef = { id: string; label: string; addedAt: string };

export type Project = {
  id: string;
  institutionId: string;
  name: string;
  description: string | null;
  /** One sentence naming why this project exists — the same "Purpose"
   *  concept the Institution itself already carries (os/identity), scoped
   *  down to a single effort instead of the whole institution. */
  purpose: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerPersonId: string | null;
  members: ProjectMember[];
  stage: string;
  health: ProjectHealth;
  startDate: string | null;
  targetDate: string | null;
  completedAt: string | null;
  documentRefs: DocumentRef[];
  createdByPersonId: string;
  createdAt: string;
  archivedAt: string | null;
};
