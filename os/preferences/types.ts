/**
 * Personal Workspace Preferences — Implementation Sprint 1, §10. Deliberately
 * small and entirely presentational: nothing here changes what an
 * institution is or what anyone is responsible for, only how the product
 * looks and opens for one specific person. Belongs to the Person, never the
 * institution — the same preferences follow someone from one institution to
 * another, the same way their name and email do.
 */

/** The five themes frozen in RDIOS Visual Design System v1. Slate is the
 *  one theme that auto-follows the system's own light/dark preference
 *  (see app/globals.css) — Light, Dark, Forest, and Midnight are each a
 *  deliberate, complete choice, not a Slate variant. */
export const THEMES = ["slate", "light", "dark", "forest", "midnight"] as const;
export type Theme = (typeof THEMES)[number];

export const FONT_SIZES = ["small", "medium", "large"] as const;
export type FontSize = (typeof FONT_SIZES)[number];

export const DENSITIES = ["comfortable", "compact"] as const;
export type Density = (typeof DENSITIES)[number];

export type PersonPreferences = {
  personId: string;
  theme: Theme;
  fontSize: FontSize;
  density: Density;
  reduceMotion: boolean;
  /** A nav destination key (e.g. "work", "people") to open straight to
   *  instead of Home, or null for the default. Validated against real nav
   *  destinations before use — never trusted blindly. */
  defaultLandingKey: string | null;
  sidebarCollapsed: boolean;
};

export function defaultPreferences(personId: string): PersonPreferences {
  return {
    personId,
    theme: "slate",
    fontSize: "medium",
    density: "comfortable",
    reduceMotion: false,
    defaultLandingKey: null,
    sidebarCollapsed: false,
  };
}
