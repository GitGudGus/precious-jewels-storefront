import Link from 'next/link';

const COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { href: '/collections/new-arrivals', label: 'New arrivals' },
      { href: '/collections', label: 'All collections' },
      { href: '/pages/sizing-chart', label: 'Sizing guide' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/pages/about-us', label: 'About' },
      { href: '/journal', label: 'Journal' },
      { href: '/pages/contact-us-1', label: 'Contact' },
      { href: '/pages/wholesale', label: 'Wholesale' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { href: '/pages/faqs', label: 'FAQ' },
      { href: '/policies/shipping-policy', label: 'Shipping' },
      { href: '/policies/refund-policy', label: 'Returns' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-page px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="font-serif text-xl tracking-[0.14em] uppercase">
              Precious Jewels
            </p>
            <p className="max-w-xs text-sm text-ink-muted">
              Gold-filled, 18k gold, and silver jewelry from Miami. Tarnish
              resistant, hypoallergenic, nickel free.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} className="space-y-3 text-sm">
              <p className="text-[11px] tracking-[0.18em] text-ink-muted uppercase">
                {column.heading}
              </p>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-ink-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Precious Jewels · Miami, Florida</p>
          <nav className="flex gap-4">
            <Link
              href="/policies/privacy-policy"
              className="transition-colors hover:text-ink"
            >
              Privacy
            </Link>
            <Link
              href="/policies/terms-of-service"
              className="transition-colors hover:text-ink"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
