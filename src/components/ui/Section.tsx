import type { ReactNode } from 'react';

const TONES = {
  bg: 'bg-bg text-ink',
  surface: 'bg-surface text-ink',
  blush: 'bg-blush text-ink',
  ink: 'bg-ink text-ink-invert',
} as const;

/**
 * A full-bleed colour band with a `max-w-page` inner column. Bands sit flush
 * against each other (no vertical gap) — the Moonstone rhythm.
 */
export function Section({
  tone = 'bg',
  id,
  className = '',
  innerClassName = '',
  children,
}: {
  tone?: keyof typeof TONES;
  id?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`${TONES[tone]} ${className}`}>
      <div
        className={`mx-auto max-w-page px-6 py-16 md:px-10 md:py-24 ${innerClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
