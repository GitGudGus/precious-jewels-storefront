import type { Metadata } from 'next';
import { Jost, Ovo } from 'next/font/google';
import './globals.css';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/shopify';

const ovo = Ovo({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-ovo',
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Precious Jewels',
    template: '%s · Precious Jewels',
  },
  description:
    'Gold-filled, 18k gold, and silver jewelry from Miami. Tarnish resistant, hypoallergenic, nickel free.',
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${ovo.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-xs focus:tracking-[0.15em] focus:text-ink-invert focus:uppercase"
        >
          Skip to content
        </a>
        <OrganizationJsonLd />
        <CartProvider>
          <Header />
          {/* Pages own their layout — full-bleed <Section> bands, or a single
              <Section> wrapper for the not-yet-rebuilt ones. */}
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
