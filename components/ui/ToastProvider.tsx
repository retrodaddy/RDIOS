"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { BadgeTone } from "./Badge";

export type ToastKind = "success" | "warning" | "info" | "error";

type ToastEntry = { id: string; kind: ToastKind; message: string };

type ToastContextValue = {
  notify: (kind: ToastKind, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const KIND_TONE: Record<ToastKind, BadgeTone> = {
  success: "success",
  warning: "warning",
  info: "info",
  error: "error",
};

/** Every message a person shorter than four seconds — never dramatic, per
 *  the Assistant Voice. One queue, one implementation, everywhere in RDIOS
 *  (Implementation Sprint 2.5 §3). Auto-dismisses after 5s; errors get 8s,
 *  since something worth stopping someone should stay legible a beat
 *  longer than a routine confirmation. Announced via `role="status"` /
 *  `aria-live="polite"` (errors use `role="alert"` / `assertive`, since
 *  those genuinely need immediate announcement) so a screen reader user
 *  hears the same feedback a sighted person sees, without anything
 *  stealing keyboard focus — a toast is peripheral, never a blocker. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (kind: ToastKind, message: string) => {
      const id = `toast-${++idRef.current}`;
      setToasts((prev) => [...prev, { id, kind, message }]);
      const timeout = kind === "error" ? 8000 : 5000;
      setTimeout(() => dismiss(id), timeout);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            aria-live={t.kind === "error" ? "assertive" : "polite"}
            className={`os-anim-drawer-right pointer-events-auto flex w-full max-w-sm items-start justify-between gap-3 rounded-xl border border-border border-l-2 bg-elevated px-4 py-3 text-sm text-text ${TONE_BORDER[KIND_TONE[t.kind]]}`}
          >
            <span className="min-w-0">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-xs text-dim hover:text-text"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const TONE_BORDER: Record<BadgeTone, string> = {
  neutral: "border-l-dim",
  accent: "border-l-accent",
  success: "border-l-success",
  warning: "border-l-warning",
  error: "border-l-error",
  info: "border-l-info",
};

/** `useToast().notify("success", "Invitation sent.")` — the one call site
 *  every future success/warning/info/error message in RDIOS should use
 *  instead of a one-off inline paragraph. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider.");
  return ctx;
}
