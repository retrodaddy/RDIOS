/** The Micro/Label typography role — Implementation Sprint 2 §3. Uppercase,
 *  wide letter-spacing, quiet — used for category tags ("ACT NOW," "BE
 *  AWARE") throughout RDIOS. Present but quiet, like a museum placard,
 *  never a headline. Every section title in the product should render
 *  through this instead of a one-off className, so the rhythm named in the
 *  frozen document's Spacing section stays predictable. */
export function SectionHeader({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-dim">{children}</h2>
      {action}
    </div>
  );
}
