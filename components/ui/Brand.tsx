/**
 * ARUMBU Branding Migration — the one place the product's mark and
 * wordmark are defined. Every screen that shows the brand (login,
 * onboarding, the invite acceptance page, the Shell sidebar, the mobile
 * navigation drawer) renders through here instead of hand-writing its own
 * "R" letterform, so swapping in the final ARUMBU logo is a one-file
 * change, not a repo-wide find-and-replace.
 *
 * `BrandMark` is a deliberate placeholder — a plain "A" letterform in the
 * product's own accent color, using the same rounded-square shape every
 * screen already used. It is NOT a designed logo. Replace the contents of
 * this file with the real ARUMBU SVG when it's provided; every call site
 * stays unchanged.
 */

const SIZE_CLASS = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-sm",
} as const;

export function BrandMark({ size = "md", className = "" }: { size?: keyof typeof SIZE_CLASS; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-accent font-display font-medium text-on-accent ${SIZE_CLASS[size]} ${className}`}
    >
      A
    </span>
  );
}

/** Mark + wordmark, for the calm, unhurried moments (login, onboarding,
 *  the invite page) where the product introduces itself. */
export function BrandLockup({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="text-center">
      <BrandMark />
      <h1 className="mt-4 font-display text-2xl font-medium text-text">ARUMBU</h1>
      {tagline && <p className="mt-1 text-sm text-dim">Institutional Operating System</p>}
    </div>
  );
}
