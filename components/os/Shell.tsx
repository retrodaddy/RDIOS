"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_DESTINATIONS, SETTINGS_DESTINATION } from "@/os/navigation";
import { signOutAction } from "@/os/identity/actions";

/**
 * The Operating System's chrome — the one shell every RDIOS screen renders
 * inside. Calm, plain, verb-first per the frozen Experience Principles:
 * no engine names, no jargon, one destination per real question. Built
 * fresh for RDIOS — RDE's shell is architectural precedent only, not
 * runtime code borrowed here.
 */
export function Shell({
  institutionName,
  personName,
  children,
}: {
  institutionName: string;
  personName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/home" ? pathname === "/home" : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-bg text-text md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-surface/40 md:flex md:flex-col">
        <div className="flex items-center gap-2.5 p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-display text-sm text-on-accent">
            R
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-sm text-text">{institutionName}</div>
            <div className="text-[0.62rem] uppercase tracking-[0.18em] text-dim">RDIOS</div>
          </div>
        </div>

        <nav aria-label="Main" className="flex-1 space-y-0.5 px-3">
          {NAV_DESTINATIONS.map((d) => (
            <Link
              key={d.key}
              href={d.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                isActive(d.href) ? "bg-accent/10 text-accent-bright" : "text-muted hover:bg-surface hover:text-text"
              }`}
            >
              {d.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href={SETTINGS_DESTINATION.href}
            className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
              isActive(SETTINGS_DESTINATION.href) ? "bg-accent/10 text-accent-bright" : "text-muted hover:bg-surface hover:text-text"
            }`}
          >
            {SETTINGS_DESTINATION.label}
          </Link>
          <div className="mt-2 flex items-center justify-between px-3 py-1">
            <span className="truncate text-xs text-dim">{personName}</span>
            <form action={signOutAction}>
              <button type="submit" className="text-xs text-dim hover:text-accent-bright">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-bg/80 px-4 backdrop-blur-xl md:hidden">
          <span className="font-display text-sm">{institutionName}</span>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
