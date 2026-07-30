export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error" | "info";

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-surface text-dim",
  accent: "bg-accent/10 text-accent-bright",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
};

/** A quiet status pill — Implementation Sprint 2 §7/§10. Semantic tones
 *  (success/warning/error/info) keep their conventional hue family in
 *  every theme, per the frozen Visual Design System — never the only
 *  signal carrying meaning (the text inside always says the actual
 *  status in words; color confirms, never substitutes). Neutral is the
 *  default for anything that isn't actually a status — most of RDIOS's
 *  existing pill-shaped labels were neutral or accent already; this just
 *  gives every future one the same four choices instead of an ad hoc
 *  color per screen. */
export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}
