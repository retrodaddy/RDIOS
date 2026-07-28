import type { InstitutionType } from "@/os/identity/types";

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
  institutionNameExample: string;
  positionExample: string;
  affiliationExample: string;
  capabilityExample: string;
};

const DEFAULT: InstitutionTerminology = {
  navLabels: {},
  navQuestions: {},
  institutionNameExample: "Aurora Technologies",
  positionExample: "Operations Lead",
  affiliationExample: "Volunteer, Donor, Board Member",
  capabilityExample: "Licensed Electrician, First Aid Certified",
};

const BY_TYPE: Record<InstitutionType, Partial<InstitutionTerminology>> = {
  company: {},
  hospital: {
    navLabels: { customers: "Patients" },
    navQuestions: { customers: "Who are we caring for?" },
    institutionNameExample: "Aurora General Hospital",
    positionExample: "Chief of Surgery",
    affiliationExample: "Volunteer, Donor, Referring Physician",
    capabilityExample: "Licensed Physician, CPR Certified",
  },
  school: {
    navLabels: { customers: "Students" },
    navQuestions: { customers: "Who are we teaching?" },
    institutionNameExample: "Lakeside School",
    positionExample: "Principal",
    affiliationExample: "Parent Volunteer, Alumnus, Donor",
    capabilityExample: "Certified Teacher, First Aid Certified",
  },
  college: {
    navLabels: { customers: "Students" },
    navQuestions: { customers: "Who are we educating?" },
    institutionNameExample: "Riverside College",
    positionExample: "Dean of Students",
    affiliationExample: "Alumnus, Donor, Visiting Faculty",
    capabilityExample: "PhD, Certified Lecturer",
  },
  ngo: {
    navLabels: { customers: "Beneficiaries" },
    navQuestions: { customers: "Who are we helping?" },
    institutionNameExample: "Hope Foundation",
    positionExample: "Program Director",
    affiliationExample: "Volunteer, Donor, Partner Organization",
    capabilityExample: "First Aid Certified, Grant Writing",
  },
  temple: {
    navLabels: { customers: "Community" },
    navQuestions: { customers: "Who are we serving?" },
    institutionNameExample: "Sri Venkateswara Temple",
    positionExample: "Head Priest",
    affiliationExample: "Volunteer, Devotee Committee, Donor",
    capabilityExample: "Vedic Rituals, First Aid Certified",
  },
  church: {
    navLabels: { customers: "Congregation" },
    navQuestions: { customers: "Who are we serving?" },
    institutionNameExample: "Grace Community Church",
    positionExample: "Pastor",
    affiliationExample: "Volunteer, Choir Member, Donor",
    capabilityExample: "Ordained Minister, First Aid Certified",
  },
  mosque: {
    navLabels: { customers: "Community" },
    navQuestions: { customers: "Who are we serving?" },
    institutionNameExample: "Al-Noor Mosque",
    positionExample: "Imam",
    affiliationExample: "Volunteer, Committee Member, Donor",
    capabilityExample: "Islamic Studies, First Aid Certified",
  },
  trust: {
    navLabels: { customers: "Beneficiaries" },
    navQuestions: { customers: "Who are we serving?" },
    institutionNameExample: "Ramesh Family Trust",
    positionExample: "Trustee",
    affiliationExample: "Beneficiary, Advisor, Donor",
    capabilityExample: "Chartered Accountant, Legal Advisor",
  },
  government: {
    navLabels: { customers: "Citizens" },
    navQuestions: { customers: "Who are we serving?" },
    institutionNameExample: "Department of Public Works",
    positionExample: "Deputy Director",
    affiliationExample: "Advisory Committee Member, Contractor",
    capabilityExample: "Licensed Engineer, Public Records Certified",
  },
  manufacturing: {
    navLabels: { customers: "Clients" },
    navQuestions: { customers: "Who are we supplying?" },
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
  };
}
