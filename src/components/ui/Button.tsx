import Link from 'next/link';
import type { ComponentProps } from 'react';

const BASE =
  'inline-flex items-center justify-center px-8 py-3.5 text-xs uppercase tracking-[0.15em] transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS = {
  primary: 'bg-ink text-ink-invert hover:bg-ink/85',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-ink-invert',
} as const;

type Variant = keyof typeof VARIANTS;

function classes(variant: Variant, className: string) {
  return `${BASE} ${VARIANTS[variant]} ${className}`;
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: { variant?: Variant } & ComponentProps<'button'>) {
  return <button className={classes(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  ...props
}: { variant?: Variant } & ComponentProps<typeof Link>) {
  return <Link className={classes(variant, className)} {...props} />;
}
