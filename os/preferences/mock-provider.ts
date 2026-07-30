import "server-only";
import type { PersonPreferences } from "./types";
import { defaultPreferences } from "./types";

/** In-memory, dev-only — same `globalThis` singleton guard as every other
 *  mock provider this engagement. A real provider persists this exactly
 *  the way it persists a Person's name or email: keyed by personId, never
 *  by institution or by device. */
type Store = { preferences: Map<string, PersonPreferences> };

const g = globalThis as unknown as { __rdiosPreferencesStore?: Store };

function store(): Store {
  if (!g.__rdiosPreferencesStore) {
    g.__rdiosPreferencesStore = { preferences: new Map() };
  }
  return g.__rdiosPreferencesStore;
}

export const mockPreferencesProvider = {
  async getPreferences(personId: string): Promise<PersonPreferences> {
    return store().preferences.get(personId) ?? defaultPreferences(personId);
  },

  async updatePreferences(personId: string, patch: Partial<Omit<PersonPreferences, "personId">>): Promise<PersonPreferences> {
    const current = store().preferences.get(personId) ?? defaultPreferences(personId);
    const next: PersonPreferences = { ...current, ...patch, personId };
    store().preferences.set(personId, next);
    return next;
  },
};
