import type { Metadata } from 'next';

import { NewsletterForm } from '@/components/newsletter/NewsletterForm';
import { Section } from '@/components/ui/Section';
import { SOCIAL_LINKS } from '@/lib/shopify/constants';

export const metadata: Metadata = {
  title: 'Back in December',
  alternates: { canonical: '/' },
};

// Deterministic spread so the markup is the same on every render.
const SNOWFLAKES = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${-((i * 7) % 12)}s`,
  duration: `${10 + ((i * 5) % 8)}s`,
  size: `${0.6 + ((i * 3) % 5) * 0.15}rem`,
}));

export default function BackSoon() {
  return (
    <Section
      tone="ink"
      className="relative overflow-hidden"
      innerClassName="on-ink flex flex-col items-center gap-5 py-24 text-center md:py-32"
    >
      <div aria-hidden className="pointer-events-none">
        {SNOWFLAKES.map((flake, i) => (
          <span
            key={i}
            className="snowflake text-ink-invert/40"
            style={{
              left: flake.left,
              fontSize: flake.size,
              animationDelay: flake.delay,
              animationDuration: flake.duration,
            }}
          >
            ❄
          </span>
        ))}
      </div>
      <p className="text-[11px] tracking-[0.25em] text-ink-invert/75 uppercase">
        Holiday restock · December
      </p>
      <h1 className="max-w-xl text-4xl leading-tight md:text-5xl">
        Back in December
      </h1>
      <p className="max-w-md text-ink-invert/75">
        New pieces are on their way, just in time for holiday gifting (and a
        little something for yourself). Join the list for first access when the
        restock drops.
      </p>
      <NewsletterForm />
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.href}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-ink-invert underline"
        >
          Follow along on {social.label}
        </a>
      ))}
    </Section>
  );
}
