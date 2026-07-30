"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePreferencesAction } from "@/os/preferences/actions";
import { DENSITIES, FONT_SIZES, THEMES, type PersonPreferences } from "@/os/preferences/types";
import type { NavDestination } from "@/os/navigation";

const THEME_LABELS: Record<(typeof THEMES)[number], string> = {
  slate: "Slate (matches your device)",
  light: "Light",
  dark: "Dark",
  forest: "Forest",
  midnight: "Midnight Executive",
};
const FONT_SIZE_LABELS: Record<(typeof FONT_SIZES)[number], string> = { small: "Small", medium: "Medium", large: "Large" };
const DENSITY_LABELS: Record<(typeof DENSITIES)[number], string> = { comfortable: "Comfortable", compact: "Compact" };

/** Personal workspace preferences — Implementation Sprint 1 §10. Belongs to
 *  the person, saved as one unit rather than firing a request per field, so
 *  a founder trying several combinations isn't triggering a save on every
 *  click; "Save preferences" is the one deliberate action. */
export function PreferencesForm({
  preferences,
  destinations,
}: {
  preferences: PersonPreferences;
  destinations: NavDestination[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [theme, setTheme] = useState(preferences.theme);
  const [fontSize, setFontSize] = useState(preferences.fontSize);
  const [density, setDensity] = useState(preferences.density);
  const [reduceMotion, setReduceMotion] = useState(preferences.reduceMotion);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(preferences.sidebarCollapsed);
  const [defaultLandingKey, setDefaultLandingKey] = useState(preferences.defaultLandingKey ?? "");
  const [saved, setSaved] = useState(false);

  const fieldClass = "w-full rounded-lg border border-border bg-bg px-2.5 py-2 text-sm text-text outline-none focus:border-accent";

  const submit = () => {
    setSaved(false);
    start(async () => {
      const fd = new FormData();
      fd.set("theme", theme);
      fd.set("fontSize", fontSize);
      fd.set("density", density);
      if (reduceMotion) fd.set("reduceMotion", "on");
      if (sidebarCollapsed) fd.set("sidebarCollapsed", "on");
      fd.set("defaultLandingKey", defaultLandingKey);
      const r = await updatePreferencesAction(fd);
      if (r.ok) {
        setSaved(true);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-dim">Theme</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)} className={`mt-1 ${fieldClass}`}>
            {THEMES.map((t) => (
              <option key={t} value={t}>
                {THEME_LABELS[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-dim">Font size</span>
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value as typeof fontSize)} className={`mt-1 ${fieldClass}`}>
            {FONT_SIZES.map((f) => (
              <option key={f} value={f}>
                {FONT_SIZE_LABELS[f]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-dim">Density</span>
          <select value={density} onChange={(e) => setDensity(e.target.value as typeof density)} className={`mt-1 ${fieldClass}`}>
            {DENSITIES.map((d) => (
              <option key={d} value={d}>
                {DENSITY_LABELS[d]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-dim">Opens to</span>
          <select value={defaultLandingKey} onChange={(e) => setDefaultLandingKey(e.target.value)} className={`mt-1 ${fieldClass}`}>
            <option value="">Home (default)</option>
            {destinations
              .filter((d) => d.key !== "home")
              .map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-text">
        <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
        Reduce motion
      </label>

      <label className="flex items-center gap-2.5 text-sm text-text">
        <input type="checkbox" checked={sidebarCollapsed} onChange={(e) => setSidebarCollapsed(e.target.checked)} />
        Start with the sidebar collapsed
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save preferences"}
        </button>
        {saved && !pending && <span className="text-sm text-dim">Saved</span>}
      </div>
    </div>
  );
}
