"use server";

import { getIdentityContext } from "@/os/identity/session";
import { searchInstitution } from "./index";
import type { SearchFilters, SearchResult } from "./types";

/** The one client-callable entry point into Search. Institution scoping
 *  comes entirely from the signed-in person's own resolved session —
 *  never a client-supplied institution id — the same "governance is
 *  automatic, not bolted on" shape every other action on this platform
 *  already uses. No search is ever narrated to History, per the brief:
 *  "Searching is not institutional history." */
export async function searchAction(query: string, filters: SearchFilters): Promise<SearchResult[]> {
  const ctx = await getIdentityContext();
  if (!ctx) return [];
  return searchInstitution(ctx.institution.id, query, filters);
}
