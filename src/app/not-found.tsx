import { ButtonLink } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';

export default function NotFound() {
  return (
    <Section
      tone="bg"
      innerClassName="flex flex-col items-center gap-6 py-28 text-center"
    >
      <p className="text-[11px] tracking-[0.25em] text-ink-muted uppercase">
        404
      </p>
      <h1 className="text-3xl md:text-4xl">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        That page doesn&rsquo;t exist or may have moved.
      </p>
      <ButtonLink href="/" className="mt-2">
        Back to home
      </ButtonLink>
    </Section>
  );
}
