/**
 * Identity & Tenant — the foundation everything else in RDIOS depends on.
 * Shapes here follow the frozen RDIOS People Domain Review v1: Person is a
 * global identity; Institution Membership is the thin per-tenant anchor.
 * Position/Affiliation/Capability (authority, relationship, qualification)
 * are deliberately NOT part of this foundation slice — they attach to a
 * Membership once the People application exists. This file stays minimal
 * on purpose, per "only what is absolutely necessary."
 */

export const INSTITUTION_TYPES = [
  "company",
  "hospital",
  "school",
  "college",
  "ngo",
  "temple",
  "church",
  "mosque",
  "trust",
  "government",
  "manufacturing",
  "other",
] as const;
export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  company: "Company",
  hospital: "Hospital",
  school: "School",
  college: "College",
  ngo: "NGO",
  temple: "Temple",
  church: "Church",
  mosque: "Mosque",
  trust: "Trust",
  government: "Government Office",
  manufacturing: "Manufacturing Company",
  other: "Other",
};

export type Institution = {
  id: string;
  name: string;
  type: InstitutionType;
  /** Why this institution exists — the true beginning, per Institution
   *  Setup Experience v2. Optional, never a gate; stated once, if at all,
   *  and remembered permanently in Be Aware afterward. */
  purpose: string | null;
  /** The person who created this institution — always holds every
   *  responsibility, per the Authority Engine's bootstrap rule (M5).
   *  Immutable; set once at creation, never reassigned. */
  founderPersonId: string;
  createdAt: string;
};

/** A global identity — belongs to no institution by itself. */
export type Person = {
  id: string;
  name: string;
  email: string;
};

export const MEMBERSHIP_STATUSES = ["invited", "active", "suspended", "ended"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

/** The fact that a Person has some relationship with one specific
 *  Institution — grants nothing by itself. Position/Affiliation attach
 *  here once the People application exists. */
export type InstitutionMembership = {
  id: string;
  institutionId: string;
  personId: string;
  status: MembershipStatus;
  createdAt: string;
};

/** The resolved context every authenticated request in RDIOS needs before
 *  anything else can happen — tenant resolved, person resolved, their
 *  membership in this specific institution resolved, and (M5) their real
 *  responsibilities resolved once alongside it, never re-derived ad hoc
 *  by whichever action happens to need it. */
export type IdentityContext = {
  person: Person;
  institution: Institution;
  membership: InstitutionMembership;
  permissions: Set<import("@/engines/authority/types").PermissionKey>;
};
