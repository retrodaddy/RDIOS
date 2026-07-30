/** Skeleton loading — Implementation Sprint 2 §9. Used wherever the
 *  incoming layout is already known (a page shape RDIOS already renders
 *  elsewhere), so nothing jumps when real content arrives and the shape
 *  itself communicates what kind of thing is coming, which a spinner
 *  cannot. Never used where the shape isn't predictable — that's what
 *  Spinner is for. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`os-skeleton ${className}`} aria-hidden="true" />;
}

/** A generic page skeleton matching the shape most RDIOS list/detail pages
 *  already share: a label, a title, a lede, then a couple of section
 *  blocks. Individual routes can compose their own from `Skeleton`
 *  directly when their real shape differs meaningfully. */
export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-2/3" />
      <Skeleton className="mt-3 h-4 w-1/2" />
      <div className="mt-9 space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
