/** A calm sentence plus one primary action, centered, generous surrounding
 *  whitespace — Implementation Sprint 2 §7/§8. Never illustration-heavy,
 *  never a mascot; decoration that exists to soften bad news is still
 *  decoration for its own sake, per the frozen Visual Design System. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 px-6 py-10 text-center">
      <p className="text-sm text-text">{title}</p>
      {description && <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
