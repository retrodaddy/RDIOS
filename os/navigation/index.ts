/**
 * Navigation — Operating System Layer. Composed statically for now; the
 * frozen Extension Architecture (Product Foundation §9) makes this
 * dynamic later, built from whichever applications an institution has
 * actually enabled, each registering a manifest entry. Nothing about that
 * future change touches how Navigation is consumed here — same shape,
 * more entries.
 */
export type NavDestination = {
  key: string;
  label: string;
  question: string;
  href: string;
};

export const NAV_DESTINATIONS: NavDestination[] = [
  { key: "home", label: "Home", question: "What needs my attention?", href: "/home" },
  { key: "people", label: "People", question: "Who makes up this institution?", href: "/people" },
  { key: "work", label: "Work", question: "What work exists?", href: "/work" },
  { key: "money", label: "Money", question: "What is the financial state?", href: "/money" },
  { key: "customers", label: "Customers", question: "Who are we serving?", href: "/customers" },
  { key: "projects", label: "Projects", question: "What are we delivering?", href: "/projects" },
  { key: "documents", label: "Documents", question: "What institutional knowledge exists?", href: "/documents" },
  { key: "reports", label: "Reports", question: "What should leadership understand?", href: "/reports" },
];

export const SETTINGS_DESTINATION: NavDestination = {
  key: "settings",
  label: "Settings",
  question: "How is this institution configured?",
  href: "/settings",
};
