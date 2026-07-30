import type { BadgeTone } from "./Badge";

const TONE_ACCENT: Record<BadgeTone, string> = {
  neutral: "border-l-dim",
  accent: "border-l-accent",
  success: "border-l-success",
  warning: "border-l-warning",
  error: "border-l-error",
  info: "border-l-info",
};

/**
 * A single feedback message — Implementation Sprint 2 §10. Short, calm,
 * human, never dramatic, per the Assistant Voice. This component is
 * presentational only: it renders one toast correctly (tone, message,
 * layout, motion). It is deliberately NOT wired to a global
 * provider/queue/auto-dismiss timer this sprint — RDIOS has no such
 * mechanism to plug into yet, and building one blind, under this sprint's
 * time, risked a half-working global state system rather than a real one.
 * Named honestly as a gap in the Sprint 2 report rather than shipped
 * silently incomplete. Existing inline feedback (the red `role="alert"`
 * paragraphs already used throughout Work, People, and Settings forms)
 * continues to carry error feedback until a real toast queue is built.
 */
export function Toast({ tone = "info", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <div
      role="status"
      className={`os-anim-drawer-right flex items-center gap-2 rounded-xl border border-border border-l-2 bg-elevated px-4 py-3 text-sm text-text shadow-none ${TONE_ACCENT[tone]}`}
    >
      {children}
    </div>
  );
}
