import Link from 'next/link';

const SHOP_LINKS = [
  { href: '/collections/new-arrivals', label: 'New arrivals' },
  { href: '/collections/necklaces', label: 'Necklaces' },
  { href: '/collections/bracelets', label: 'Bracelets' },
  { href: '/collections', label: 'All collections' },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-page px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="font-serif text-xl tracking-[0.14em] uppercase">
              Precious Jewels
            </p>
            <p className="max-w-xs text-sm text-ink-muted">
              Gold-filled, 18k gold, and silver jewelry from Miami. Tarnish
              resistant, hypoallergenic, nickel free.
            </p>
          </div>

          <nav className="space-y-3 text-sm">
            <p className="text-[11px] tracking-[0.18em] text-ink-muted uppercase">
              Shop
            </p>
            {SHOP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 text-sm">
            <p className="text-[11px] tracking-[0.18em] text-ink-muted uppercase">
              Help
            </p>
            <p className="text-ink-muted">
              Shipping, returns, and care information coming soon.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Precious Jewels</p>
          <p>Miami, Florida</p>
        </div>
      </div>
    </footer>
  );
}
