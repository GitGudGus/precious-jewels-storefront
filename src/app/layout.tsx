import type { Metadata } from 'next';
import { Jost, Ovo } from 'next/font/google';
import './globals.css';

import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
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
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${ovo.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Header />
          {/* Pages own their layout — full-bleed <Section> bands, or a single
              <Section> wrapper for the not-yet-rebuilt ones. */}
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
