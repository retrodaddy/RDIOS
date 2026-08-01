import "server-only";
import { db, DbError } from "@/lib/db/client";
import type { PersonPreferences } from "./types";
import { defaultPreferences } from "./types";

type PreferencesRow = {
  person_id: string;
  theme: PersonPreferences["theme"];
  font_size: PersonPreferences["fontSize"];
  density: PersonPreferences["density"];
  reduce_motion: boolean;
  default_landing_key: string | null;
  sidebar_collapsed: boolean;
};

function toPreferences(row: PreferencesRow): PersonPreferences {
  return {
    personId: row.person_id,
    theme: row.theme,
    fontSize: row.font_size,
    density: row.density,
    reduceMotion: row.reduce_motion,
    defaultLandingKey: row.default_landing_key,
    sidebarCollapsed: row.sidebar_collapsed,
  };
}

export const supabasePreferencesProvider = {
  async getPreferences(personId: string): Promise<PersonPreferences> {
    const { data, error } = await db().from("person_preferences").select("*").eq("person_id", personId).maybeSingle();
    if (error) throw new DbError("getPreferences failed", error);
    return data ? toPreferences(data as PreferencesRow) : defaultPreferences(personId);
  },

  async updatePreferences(personId: string, patch: Partial<Omit<PersonPreferences, "personId">>): Promise<PersonPreferences> {
    const { data: existing, error: fetchError } = await db().from("person_preferences").select("*").eq("person_id", personId).maybeSingle();
    if (fetchError) throw new DbError("updatePreferences fetch failed", fetchError);

    const current = existing ? toPreferences(existing as PreferencesRow) : defaultPreferences(personId);
    const next: PersonPreferences = { ...current, ...patch, personId };

    const { data, error } = await db()
      .from("person_preferences")
      .upsert({
        person_id: personId,
        theme: next.theme,
        font_size: next.fontSize,
        density: next.density,
        reduce_motion: next.reduceMotion,
        default_landing_key: next.defaultLandingKey,
        sidebar_collapsed: next.sidebarCollapsed,
      })
      .select()
      .single();
    if (error) throw new DbError("updatePreferences failed", error);
    return toPreferences(data as PreferencesRow);
  },
};
