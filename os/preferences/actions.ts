"use server";

import { revalidatePath } from "next/cache";
import { getIdentityContext } from "@/os/identity/session";
import { getNavDestinations } from "@/os/navigation";
import { supabasePreferencesProvider } from "./supabase-provider";
import { DENSITIES, FONT_SIZES, THEMES, type Density, type FontSize, type Theme } from "./types";

export type ActionResult = { ok: boolean; error?: string };

/** Where "sign in" should land someone, honoring their stored preference
 *  when it's still a real destination for this institution — never a
 *  stale key from a different institution type sending them somewhere
 *  that no longer exists. Falls back to Home, always. */
export async function resolveLandingPath(
  personId: string,
  institutionType: Parameters<typeof getNavDestinations>[0]
): Promise<string> {
  const prefs = await supabasePreferencesProvider.getPreferences(personId);
  if (!prefs.defaultLandingKey) return "/home";
  const destinations = getNavDestinations(institutionType);
  const match = destinations.find((d) => d.key === prefs.defaultLandingKey);
  return match?.href ?? "/home";
}

export async function updatePreferencesAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };

  const theme = String(formData.get("theme") ?? "system") as Theme;
  const fontSize = String(formData.get("fontSize") ?? "medium") as FontSize;
  const density = String(formData.get("density") ?? "comfortable") as Density;
  const reduceMotion = formData.get("reduceMotion") === "on";
  const sidebarCollapsed = formData.get("sidebarCollapsed") === "on";
  const defaultLandingKeyRaw = String(formData.get("defaultLandingKey") ?? "").trim();

  if (!(THEMES as readonly string[]).includes(theme)) return { ok: false, error: "Choose a valid theme." };
  if (!(FONT_SIZES as readonly string[]).includes(fontSize)) return { ok: false, error: "Choose a valid font size." };
  if (!(DENSITIES as readonly string[]).includes(density)) return { ok: false, error: "Choose a valid density." };

  const validKeys = new Set(getNavDestinations(ctx.institution.type).map((d) => d.key));
  const defaultLandingKey = defaultLandingKeyRaw && validKeys.has(defaultLandingKeyRaw) ? defaultLandingKeyRaw : null;

  await supabasePreferencesProvider.updatePreferences(ctx.person.id, {
    theme,
    fontSize,
    density,
    reduceMotion,
    sidebarCollapsed,
    defaultLandingKey,
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Sidebar collapse toggles from the Shell itself, separate from the full
 *  Preferences form — a quick affordance shouldn't require opening
 *  Settings, but still remembers the same way every other preference does. */
export async function setSidebarCollapsedAction(collapsed: boolean): Promise<ActionResult> {
  const ctx = await getIdentityContext();
  if (!ctx) return { ok: false, error: "Sign in first." };
  await supabasePreferencesProvider.updatePreferences(ctx.person.id, { sidebarCollapsed: collapsed });
  revalidatePath("/", "layout");
  return { ok: true };
}
