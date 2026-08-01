import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { getIdentityContext } from "@/os/identity/session";
import { supabasePreferencesProvider } from "@/os/preferences/supabase-provider";
import { defaultPreferences } from "@/os/preferences/types";
import { ToastProvider } from "@/components/ui/ToastProvider";

/** The two-family typography system named in the frozen Visual Design
 *  System v1 — "two families, not one, doing two different jobs" — built
 *  for real in Implementation Sprint 2.5. Before this, `--font-display`
 *  and `--font-sans` were both referenced by tailwind.config.ts but never
 *  actually defined anywhere, so every "display" heading silently fell
 *  back to the same system-ui sans everything else used. Inter is the
 *  workhorse (humanist, highly legible at small sizes, exactly the
 *  category the frozen document names) — labels, body, tables, forms,
 *  navigation. Fraunces is the one expressive display face, reserved for
 *  exactly the single most important line on a screen, per the frozen
 *  rule that never more than one Display-sized element is visible at
 *  once. */
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "ARUMBU",
  description: "ARUMBU — the Institutional Operating System.",
};

/** The root shell reads a signed-in person's Preferences (Implementation
 *  Sprint 1 §10) once, here, and expresses them as plain data attributes —
 *  the same mechanism the theme system already used before this sprint
 *  (app/globals.css's `[data-theme]` rules predate this file's change).
 *  Every route renders under this, signed in or not, so preferences apply
 *  before the page below ever decides what it's showing. */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getIdentityContext();
  const prefs = ctx ? await supabasePreferencesProvider.getPreferences(ctx.person.id) : defaultPreferences("");

  return (
    <html
      lang="en"
      data-theme={prefs.theme}
      data-font-size={prefs.fontSize}
      data-density={prefs.density}
      data-reduce-motion={prefs.reduceMotion ? "true" : undefined}
    >
      <body className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
