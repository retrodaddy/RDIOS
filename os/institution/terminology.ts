import type { InstitutionType } from "@/os/identity/types";
import type { PermissionKey } from "@/engines/authority/types";

/**
 * Institution-type-aware copy — pure data, per the frozen Platform
 * Integration Strategy §6/§7 ("configuration is always data, never code").
 * Every application, page, and form reads the same institution's `type`
 * through here instead of hardcoding business-software nouns — so the
 * nav rail, the empty states, and the placeholder text all agree with
 * what the founder said their institution actually is. No new schema:
 * `Institution.type` already exists, this just gives it more to say.
 */

export type InstitutionTerminology = {
  /** Overrides for specific nav destination keys, by key. Only entries
   *  that differ from the universal default need to be listed. */
  navLabels: Partial<Record<string, string>>;
  navQuestions: Partial<Record<string, string>>;
  /** Overrides for the empty-state description under each nav destination
   *  (Implementation Sprint 2 §8) — only listed for "customers," the one
   *  destination whose meaning genuinely changes per institution type
   *  (patients vs. students vs. a congregation). Money/Projects/Documents/
   *  Reports keep one universal description; their meaning doesn't shift
   *  by institution type the way "who are we serving" does. */
  navDescriptions: Partial<Record<string, string>>;
  institutionNameExample: string;
  positionExample: string;
  affiliationExample: string;
  capabilityExample: string;
  /** Overrides for the Authority Engine's responsibility catalog
   *  (engines/authority/types.ts) — Implementation Sprint 1 §8. Most
   *  institution types never need these; the default PERMISSION_LABELS /
   *  PERMISSION_DESCRIPTIONS already read as plain, natural language. Only
   *  listed where the default genuinely reads as corporate-HR language a
   *  volunteer-run institution wouldn't naturally use — never variation
   *  for its own sake. */
  permissionLabels: Partial<Record<PermissionKey, string>>;
  permissionDescriptions: Partial<Record<PermissionKey, string>>;
};

const DEFAULT: InstitutionTerminology = {
  navLabels: {},
  navQuestions: {},
  navDescriptions: {},
  institutionNameExample: "Aurora Technologies",
  positionExample: "Operations Lead",
  affiliationExample: "Volunteer, Donor, Board Member",
  capabilityExample: "Licensed Electrician, First Aid Certified",
  permissionLabels: {},
  permissionDescriptions: {},
};

/** Shared by every volunteer-led or congregation-style institution type —
 *  "Offboard someone" and "Manage positions" are the two responsibility
 *  labels a temple trustee, church volunteer coordinator, or NGO program
 *  lead would not naturally reach for; everything else in the default
 *  catalog already reads as plain institutional language. */
const CONGREGATION_STYLE: Pick<InstitutionTerminology, "permissionLabels" | "permissionDescriptions"> = {
  permissionLabels: {
    "organization.manage": "Manage roles and people",
    "people.offboard": "End someone's involvement",
  },
  permissionDescriptions: {
    "organization.manage": "Create and edit roles, appoint or end who holds them, add affiliations and capabilities.",
    "people.offboard": "End someone's roles and affiliations all at once when they step away.",
  },
};

const BY_TYPE: Record<InstitutionType, Partial<InstitutionTerminology>> = {
  company: {},
  hospital: {
    navLabels: { customers: "Patients" },
    navQuestions: { customers: "Who are we caring for?" },
    navDescriptions: { customers: "Everyone currently or recently in this hospital's care — their history, their treatment, and who's responsible for what comes next." },
    institutionNameExample: "Aurora General Hospital",
    positionExample: "Chief of Surgery",
    affiliationExample: "Volunteer, Donor, Referring Physician",
    capabilityExample: "Licensed Physician, CPR Certified",
  },
  school: {
    navLabels: { customers: "Students" },
    navQuestions: { customers: "Who are we teaching?" },
    navDescriptions: { customers: "Every student enrolled here — who they are, what grade or class they're in, and what the school still owes their family." },
    institutionNameExample: "Lakeside School",
    positionExample: "Principal",
    affiliationExample: "Parent Volunteer, Alumnus, Donor",
    capabilityExample: "Certified Teacher, First Aid Certified",
  },
  college: {
    navLabels: { customers: "Students" },
    navQuestions: { customers: "Who are we educating?" },
    navDescriptions: { customers: "Every student enrolled here — their program, their standing, and what the institution still owes them before they graduate." },
    institutionNameExample: "Riverside College",
    positionExample: "Dean of Students",
    affiliationExample: "Alumnus, Donor, Visiting Faculty",
    capabilityExample: "PhD, Certified Lecturer",
  },
  ngo: {
    navLabels: { customers: "Beneficiaries" },
    navQuestions: { customers: "Who are we helping?" },
    navDescriptions: { customers: "Every person or community this institution's programs actually reach — who they are, what they've received, and what's still promised." },
    institutionNameExample: "Hope Foundation",
    positionExample: "Program Director",
    affiliationExample: "Volunteer, Donor, Partner Organization",
    capabilityExample: "First Aid Certified, Grant Writing",
    ...CONGREGATION_STYLE,
  },
  temple: {
    navLabels: { customers: "Community" },
    navQuestions: { customers: "Who are we serving?" },
    navDescriptions: { customers: "The devotees and families this temple serves — who they are, and what they've been part of here." },
    institutionNameExample: "Sri Venkateswara Temple",
    positionExample: "Head Priest",
    affiliationExample: "Volunteer, Devotee Committee, Donor",
    capabilityExample: "Vedic Rituals, First Aid Certified",
    ...CONGREGATION_STYLE,
  },
  church: {
    navLabels: { customers: "Congregation" },
    navQuestions: { customers: "Who are we serving?" },
    navDescriptions: { customers: "The members and families this church serves — who they are, and what they've been part of here." },
    institutionNameExample: "Grace Community Church",
    positionExample: "Pastor",
    affiliationExample: "Volunteer, Choir Member, Donor",
    capabilityExample: "Ordained Minister, First Aid Certified",
    ...CONGREGATION_STYLE,
  },
  mosque: {
    navLabels: { customers: "Community" },
    navQuestions: { customers: "Who are we serving?" },
    navDescriptions: { customers: "The community this mosque serves — who they are, and what they've been part of here." },
    institutionNameExample: "Al-Noor Mosque",
    positionExample: "Imam",
    affiliationExample: "Volunteer, Committee Member, Donor",
    capabilityExample: "Islamic Studies, First Aid Certified",
    ...CONGREGATION_STYLE,
  },
  trust: {
    navLabels: { customers: "Beneficiaries" },
    navQuestions: { customers: "Who are we serving?" },
    navDescriptions: { customers: "Everyone this trust exists to provide for — who they are, and what they're entitled to." },
    institutionNameExample: "Ramesh Family Trust",
    positionExample: "Trustee",
    affiliationExample: "Beneficiary, Advisor, Donor",
    capabilityExample: "Chartered Accountant, Legal Advisor",
    ...CONGREGATION_STYLE,
  },
  government: {
    navLabels: { customers: "Citizens" },
    navQuestions: { customers: "Who are we serving?" },
    navDescriptions: { customers: "The residents and citizens this office serves — who they are, and what they've requested or been granted." },
    institutionNameExample: "Department of Public Works",
    positionExample: "Deputy Director",
    affiliationExample: "Advisory Committee Member, Contractor",
    capabilityExample: "Licensed Engineer, Public Records Certified",
  },
  manufacturing: {
    navLabels: { customers: "Clients" },
    navQuestions: { customers: "Who are we supplying?" },
    navDescriptions: { customers: "Every client this plant supplies — who they are, what they've ordered, and what's still owed to them." },
    institutionNameExample: "Aurora Manufacturing Co.",
    positionExample: "Plant Manager",
    affiliationExample: "Supplier, Distributor, Auditor",
    capabilityExample: "Certified Welder, Safety Inspector",
  },
  other: {},
};

export function getTerminology(type: InstitutionType): InstitutionTerminology {
  const override = BY_TYPE[type] ?? {};
  return {
    ...DEFAULT,
    ...override,
    navLabels: { ...DEFAULT.navLabels, ...(override.navLabels ?? {}) },
    navQuestions: { ...DEFAULT.navQuestions, ...(override.navQuestions ?? {}) },
    navDescriptions: { ...DEFAULT.navDescriptions, ...(override.navDescriptions ?? {}) },
    permissionLabels: { ...DEFAULT.permissionLabels, ...(override.permissionLabels ?? {}) },
    permissionDescriptions: { ...DEFAULT.permissionDescriptions, ...(override.permissionDescriptions ?? {}) },
  };
}

/** What a founder or trustee reads when granting this responsibility to a
 *  position — institution-true language first, the universal
 *  PERMISSION_LABELS default otherwise. Every screen that shows a
 *  responsibility (PositionSidePanel, WorkBoard) should read through this,
 *  never the raw catalog directly, so the two can never quietly drift. */
export function getPermissionLabel(type: InstitutionType, key: PermissionKey, fallback: string): string {
  return getTerminology(type).permissionLabels[key] ?? fallback;
}

export function getPermissionDescription(type: InstitutionType, key: PermissionKey, fallback: string): string {
  return getTerminology(type).permissionDescriptions[key] ?? fallback;
}
