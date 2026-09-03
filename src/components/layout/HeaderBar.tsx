'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CartButton } from '@/components/cart/CartButton';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shopify/constants';
import { formatPrice } from '@/lib/shopify/format';

type NavItem = { href: string; label: string };

const ANNOUNCEMENT = `♡ Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)} ♡`;

export function HeaderBar({ navItems }: { navItems: NavItem[] }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink px-4 py-2 text-center text-[10px] tracking-[0.2em] text-ink-invert uppercase">
        {ANNOUNCEMENT}
      </div>

      <div className="border-b border-line bg-bg/95 backdrop-blur">
        <div
          className={`mx-auto grid max-w-page grid-cols-[1fr_auto_1fr] items-center px-6 transition-all md:px-10 ${
            scrolled ? 'py-3' : 'py-5'
          }`}
        >
          <span />
          <Link
            href="/"
            className={`text-center font-serif tracking-[0.14em] whitespace-nowrap uppercase transition-all ${
              scrolled ? 'text-lg' : 'text-xl md:text-2xl'
            }`}
          >
            Precious Jewels
          </Link>
          <div className="flex justify-end">
            <CartButton />
          </div>
        </div>

        <nav className="mx-auto hidden max-w-page items-center justify-center gap-8 px-6 pb-4 text-[11px] tracking-[0.18em] uppercase md:flex md:px-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className="flex gap-5 overflow-x-auto border-t border-line px-6 py-2.5 text-[11px] tracking-[0.16em] whitespace-nowrap uppercase md:hidden">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink-muted">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
