"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavDestinations, getSettingsDestination } from "@/os/navigation";
import { signOutAction } from "@/os/identity/actions";
import { setSidebarCollapsedAction } from "@/os/preferences/actions";
import { BrandMark } from "@/components/ui";
import { SearchOverlay } from "@/components/os/SearchOverlay";
import type { InstitutionType } from "@/os/identity/types";

/**
 * The Operating System's chrome — the one shell every RDIOS screen renders
 * inside. Calm, plain, verb-first per the frozen Experience Principles:
 * no engine names, no jargon, one destination per real question. Built
 * fresh for RDIOS — RDE's shell is architectural precedent only, not
 * runtime code borrowed here. Nav labels resolve through the institution's
 * own type so the sidebar reads true for whatever kind of institution this
 * actually is, not a business-software default applied everywhere.
 *
 * Implementation Sprint 1 additions: a real mobile navigation drawer (the
 * mobile header previously showed the institution name and nothing else —
 * no way to reach any other screen on a phone at all) and a persisted
 * sidebar-collapse preference (§10).
 */
export function Shell({
  institutionName,
  institutionType,
  personName,
  personRole,
  initialSidebarCollapsed,
  children,
}: {
  institutionName: string;
  institutionType: InstitutionType;
  personName: string;
  personRole?: string | null;
  initialSidebarCollapsed: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/home" ? pathname === "/home" : pathname.startsWith(href));
  const destinations = getNavDestinations(institutionType);
  const settingsDestination = getSettingsDestination(institutionType);

  const [collapsed, setCollapsed] = useState(initialSidebarCollapsed);
  const [, startSaving] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close the mobile drawer on Escape and on navigation, and never leave
  // it open across route changes — a drawer that "forgets" to close after
  // a link click is exactly the kind of thing that makes software feel
  // untrustworthy rather than just imperfect.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    startSaving(async () => {
      await setSidebarCollapsedAction(next);
    });
  };

  const navRowClass = (active: boolean) =>
    `flex items-center gap-2.5 rounded-md px-3 py-[calc(0.5rem*var(--os-density-scale))] text-sm transition-colors ${
      active ? "bg-accent/10 text-accent-bright" : "text-muted hover:bg-surface hover:text-text"
    }`;

  return (
    <div className="min-h-screen bg-bg text-text md:flex">
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-border bg-surface/40 transition-[width] md:flex md:flex-col ${
          collapsed ? "md:w-16" : "md:w-60"
        }`}
      >
        <div className={`flex items-center gap-2.5 p-4 ${collapsed ? "justify-center px-2" : ""}`}>
          <BrandMark size="sm" />
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate font-display text-sm text-text">{institutionName}</div>
              <div className="text-[0.62rem] uppercase tracking-[0.18em] text-dim">ARUMBU</div>
            </div>
          )}
        </div>

        <div className={`px-3 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            title="Search"
            aria-label="Search this institution"
            className={`mb-2 flex items-center gap-2 rounded-md border border-border text-dim transition-colors hover:bg-surface hover:text-text ${
              collapsed ? "h-8 w-8 justify-center" : "w-full px-3 py-1.5 text-sm"
            }`}
          >
            <span aria-hidden="true">🔍</span>
            {!collapsed && <span>Search</span>}
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 space-y-0.5 px-3">
          {destinations.map((d) => (
            <Link key={d.key} href={d.href} title={collapsed ? d.label : undefined} className={navRowClass(isActive(d.href))}>
              {collapsed ? <span className="mx-auto">{d.label[0]}</span> : d.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-pressed={collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mb-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs text-dim transition-colors hover:bg-surface hover:text-text ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? "»" : "« Collapse"}
          </button>
          <Link href={settingsDestination.href} title={collapsed ? settingsDestination.label : undefined} className={navRowClass(isActive(settingsDestination.href))}>
            {collapsed ? <span className="mx-auto">{settingsDestination.label[0]}</span> : settingsDestination.label}
          </Link>
          {!collapsed && (
            <div className="mt-2 px-3 py-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-xs text-dim">{personName}</span>
                <form action={signOutAction}>
                  <button type="submit" className="text-xs text-dim hover:text-accent-bright">
                    Sign out
                  </button>
                </form>
              </div>
              {personRole && <p className="truncate text-[0.68rem] text-dim/70">{personRole}</p>}
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-xl md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text hover:bg-surface"
          >
            <span aria-hidden="true" className="block text-lg leading-none">
              ☰
            </span>
          </button>
          <span className="flex-1 font-display text-sm">{institutionName}</span>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search this institution"
            className="flex h-8 w-8 items-center justify-center rounded-md text-text hover:bg-surface"
          >
            <span aria-hidden="true">🔍</span>
          </button>
        </header>
        <main className="flex-1">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="os-anim-backdrop absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="os-anim-drawer-left relative flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-border bg-elevated p-4">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <BrandMark size="sm" />
                <span className="truncate font-display text-sm text-text">{institutionName}</span>
              </div>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="text-xs text-dim hover:text-text">
                Close
              </button>
            </div>

            <nav aria-label="Main" className="mt-6 flex-1 space-y-0.5">
              {destinations.map((d) => (
                <Link key={d.key} href={d.href} className={navRowClass(isActive(d.href))}>
                  {d.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border pt-3">
              <Link href={settingsDestination.href} className={navRowClass(isActive(settingsDestination.href))}>
                {settingsDestination.label}
              </Link>
              <div className="mt-2 px-3 py-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs text-dim">{personName}</span>
                  <form action={signOutAction}>
                    <button type="submit" className="text-xs text-dim hover:text-accent-bright">
                      Sign out
                    </button>
                  </form>
                </div>
                {personRole && <p className="truncate text-[0.68rem] text-dim/70">{personRole}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
