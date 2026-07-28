export function EmptyApplication({ label, question }: { label: string; question: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent-bright">{label}</p>
      <h1 className="mt-2 font-display text-3xl font-medium">{question}</h1>
      <p className="mt-4 text-muted">This application hasn&apos;t been built yet. Its records will live here once it has.</p>
    </div>
  );
}
