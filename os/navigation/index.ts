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
};

type NavDestinationDefault = { key: string; defaultLabel: string; defaultQuestion: string; href: string };

const NAV_DEFAULTS: NavDestinationDefault[] = [
  { key: "home", defaultLabel: "Home", defaultQuestion: "What needs my attention?", href: "/home" },
  { key: "people", defaultLabel: "People", defaultQuestion: "Who makes up this institution?", href: "/people" },
  { key: "work", defaultLabel: "Work", defaultQuestion: "What work exists?", href: "/work" },
  { key: "money", defaultLabel: "Money", defaultQuestion: "What is the financial state?", href: "/money" },
  { key: "customers", defaultLabel: "Customers", defaultQuestion: "Who are we serving?", href: "/customers" },
  { key: "projects", defaultLabel: "Projects", defaultQuestion: "What are we delivering?", href: "/projects" },
  { key: "documents", defaultLabel: "Documents", defaultQuestion: "What institutional knowledge exists?", href: "/documents" },
  { key: "reports", defaultLabel: "Reports", defaultQuestion: "What should leadership understand?", href: "/reports" },
];

const SETTINGS_DEFAULT: NavDestinationDefault = {
  key: "settings",
  defaultLabel: "Settings",
  defaultQuestion: "How is this institution configured?",
  href: "/settings",
};

function resolve(d: NavDestinationDefault, institutionType: InstitutionType): NavDestination {
  const t = getTerminology(institutionType);
  return {
    key: d.key,
    href: d.href,
    label: t.navLabels[d.key] ?? d.defaultLabel,
    question: t.navQuestions[d.key] ?? d.defaultQuestion,
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
