export function PageHeader({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <header className="space-y-3 text-center">
      {eyebrow && (
        <p className="text-[11px] tracking-[0.25em] text-ink-muted uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl md:text-4xl">{title}</h1>
    </header>
  );
}
