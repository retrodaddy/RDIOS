import type { InstitutionType } from "@/os/identity/types";
import { getTerminology } from "@/os/institution/terminology";

/**
 * Navigation — Operating System Layer. Composed statically for now; the
 * frozen Extension Architecture (Product Foundation §9) makes this
 * dynamic later, built from whichever applications an institution has
 * actually enabled, each registering a manifest entry. Nothing about that
 * future change touches how Navigation is consumed here — same shape,
 * more entries.
 *
 * Labels and questions resolve through the institution's own type
 * (`os/institution/terminology.ts`) so the same destination reads as
 * "Patients" for a hospital and "Community" for a temple — one nav
 * structure, institution-true language, not a business-software default
 * applied uniformly everywhere.
 */
export type NavDestination = {
  key: string;
  label: string;
  question: string;
  href: string;
  /** What belongs here and why it matters — one calm sentence, read by
   *  EmptyApplication until the destination has real content of its own
   *  (Implementation Sprint 2 §8). Distinct per destination; never
   *  implementation language. */
  description: string;
};

type NavDestinationDefault = {
  key: string;
  defaultLabel: string;
  defaultQuestion: string;
  defaultDescription: string;
  href: string;
};

const NAV_DEFAULTS: NavDestinationDefault[] = [
  { key: "home", defaultLabel: "Home", defaultQuestion: "What needs my attention?", defaultDescription: "", href: "/home" },
  {
    key: "people",
    defaultLabel: "People",
    defaultQuestion: "Who makes up this institution?",
    defaultDescription: "",
    href: "/people",
  },
  { key: "work", defaultLabel: "Work", defaultQuestion: "What work exists?", defaultDescription: "", href: "/work" },
  {
    key: "money",
    defaultLabel: "Money",
    defaultQuestion: "What is the financial state?",
    defaultDescription:
      "What's coming in, what's going out, and what's been committed — every expense, every transfer, every ledger entry that touches this institution's real position.",
    href: "/money",
  },
  {
    key: "customers",
    defaultLabel: "Customers",
    defaultQuestion: "Who are we serving?",
    defaultDescription:
      "Every person or organization on the receiving end of this institution's work — who they are, what they've been given, and what they're still owed.",
    href: "/customers",
  },
  {
    key: "projects",
    defaultLabel: "Projects",
    defaultQuestion: "What are we delivering?",
    defaultDescription:
      "The real efforts underway right now — each with a beginning, an end, and someone responsible for getting from one to the other.",
    href: "/projects",
  },
  {
    key: "documents",
    defaultLabel: "Documents",
    defaultQuestion: "What institutional knowledge exists?",
    defaultDescription:
      "Agreements, policies, records — the paper trail an institution accumulates and needs to be able to find again, not just store.",
    href: "/documents",
  },
  {
    key: "reports",
    defaultLabel: "Reports",
    defaultQuestion: "What should leadership understand?",
    defaultDescription:
      "The handful of numbers and trends worth a founder's attention without having to go looking for them — a summary, not a spreadsheet.",
    href: "/reports",
  },
];

const SETTINGS_DEFAULT: NavDestinationDefault = {
  key: "settings",
  defaultLabel: "Settings",
  defaultQuestion: "How is this institution configured?",
  defaultDescription: "",
  href: "/settings",
};

function resolve(d: NavDestinationDefault, institutionType: InstitutionType): NavDestination {
  const t = getTerminology(institutionType);
  return {
    key: d.key,
    href: d.href,
    label: t.navLabels[d.key] ?? d.defaultLabel,
    question: t.navQuestions[d.key] ?? d.defaultQuestion,
    description: t.navDescriptions[d.key] ?? d.defaultDescription,
  };
}

export function getNavDestinations(institutionType: InstitutionType): NavDestination[] {
  return NAV_DEFAULTS.map((d) => resolve(d, institutionType));
}

export function getSettingsDestination(institutionType: InstitutionType): NavDestination {
  return resolve(SETTINGS_DEFAULT, institutionType);
}

/** A single destination by key, institution-type resolved — what
 *  `EmptyApplication` needs without importing every destination. */
export function getNavDestination(institutionType: InstitutionType, key: string): NavDestination | undefined {
  if (key === "settings") return getSettingsDestination(institutionType);
  return NAV_DEFAULTS.find((d) => d.key === key) && resolve(NAV_DEFAULTS.find((d) => d.key === key)!, institutionType);
}
