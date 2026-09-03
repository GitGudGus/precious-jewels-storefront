import type { Metadata } from 'next';
import { Jost, Ovo } from 'next/font/google';
import './globals.css';

import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

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
  metadataBase: new URL('https://precious-jewels.vercel.app'),
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
          {/* PR3/PR4 pages render full-bleed <Section> bands; until then this
              wrapper keeps the existing pages padded. */}
          <main className="mx-auto w-full max-w-page flex-1 px-6 py-10 md:px-10">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
