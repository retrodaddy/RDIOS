/**
 * Search — M12, the second Shared Engine Layer piece after Authority
 * (`engines/authority/`), per the same Product Foundation §7 discipline:
 * a small, generic engine every application composes with, never a
 * parallel description of any application's own data. "Search never
 * owns data. Search only discovers it" — nothing in this file, or
 * anywhere in `engines/search/`, persists a single byte. Every
 * `SearchResult` is assembled fresh, on every query, from the exact same
 * mock providers every application's own page already reads.
 *
 * This is also, deliberately, the shape Tamizhi (M13, not built here)
 * will eventually consume: Tamizhi queries Search, never People, never
 * Finance, never Projects directly. Building Search to already answer
 * "what does this institution know, and where does it live?" without
 * the caller needing to know which application owns which fact is the
 * whole point of doing this before Tamizhi exists.
 */

/** The brief's own closed scope — nothing searchable exists outside
 *  these ten. `finance` and `assets` are kept as two distinct
 *  applications here even though both read from `applications/finance`,
 *  because the brief itself named them as two separate scope entries —
 *  an Expense and an Asset are different kinds of institutional fact,
 *  and a founder searching should be able to tell which. */
export const SEARCH_APPLICATIONS = [
  "people",
  "organization",
  "work",
  "finance",
  "assets",
  "community",
  "projects",
  "documents",
  "reports",
  "history",
] as const;
export type SearchApplication = (typeof SEARCH_APPLICATIONS)[number];
export const SEARCH_APPLICATION_LABELS: Record<SearchApplication, string> = {
  people: "People",
  organization: "Organization",
  work: "Work",
  finance: "Money",
  assets: "Assets",
  community: "Community",
  projects: "Projects",
  documents: "Documents",
  reports: "Reports",
  history: "History",
};

/** One result, exactly the brief's own field list — Icon, Title, Type,
 *  Description, Current Status, Last Updated, Primary Action. Nothing
 *  more. `href` IS the primary action — "selecting a result should open
 *  the existing experience," so a result never carries its own actions,
 *  only a link into the real page that already knows how to act on it. */
export type SearchResult = {
  id: string;
  application: SearchApplication;
  /** The same `subjectType`/`subjectId` pair every Timeline on the
   *  platform already uses (Audit Engine Design's own polymorphic
   *  shape) — Search doesn't invent a new way to name a record, it
   *  reuses the one every domain's History already speaks. */
  subjectType: string;
  subjectId: string;
  icon: string;
  title: string;
  type: string;
  description: string;
  status: string;
  lastUpdatedAt: string;
  href: string;
  /** Not shown — the extra terms ranking matches against (category,
   *  free-text type, tags) beyond the title itself. */
  keywords: string[];
};

export type SearchFilters = {
  application: SearchApplication | null;
  type: string | null;
  status: string | null;
  dateFrom: string | null;
  dateTo: string | null;
};
