/** The primary unit of thought in RDIOS — Implementation Sprint 2 §7. One
 *  card holds one fact or one decision, never a mix. Every card in the
 *  product shares one corner radius, one border treatment (a single
 *  hairline, never a drop shadow), and one padding rhythm — a card that
 *  looks structurally different from every other card is a bug, not a
 *  design choice, per the frozen Visual Design System. */
export function Card({
  padded = true,
  className = "",
  children,
}: {
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-surface/40 ${padded ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}
