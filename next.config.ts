import { withSentryConfig } from '@sentry/nextjs/config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**',
      },
    ],
  },

  // Map the old Shopify theme's URL structure onto this app. Most paths already
  // match (products/collections/pages/policies were built to the same shape);
  // these are the ones that moved or don't exist here. Run a crawl of the live
  // site before launch to catch anything indexed that this misses.
  async redirects() {
    return [
      { source: '/blogs/news', destination: '/journal', permanent: true },
      {
        source: '/blogs/news/:handle',
        destination: '/journal/:handle',
        permanent: true,
      },
      {
        source: '/collections/:collection/products/:handle',
        destination: '/products/:handle',
        permanent: true,
      },
      // No cart page — the cart is a drawer.
      { source: '/cart', destination: '/', permanent: false },
      // Real search is Milestone 4.
      { source: '/search', destination: '/collections', permanent: false },
      // Customer accounts are Shopify-hosted (new/passwordless accounts). The
      // storefront has no native /account yet — that's Milestone 3b — so send
      // /account and any old theme deep link (/account/orders, /account/addresses)
      // to the hosted portal. `<myshopify>/account` 302s to the real portal at
      // shopify.com/<shop-id>/account and stays valid across the M5 cutover.
      // `permanent: false` on purpose — we intend to reclaim /account for a
      // native, Moonstone-styled page later.
      {
        source: '/account',
        destination: 'https://shop-precious-jewels.myshopify.com/account',
        basePath: false,
        permanent: false,
      },
      {
        source: '/account/:path*',
        destination: 'https://shop-precious-jewels.myshopify.com/account',
        basePath: false,
        permanent: false,
      },
    ];
  },
};

/**
 * Wrap with Sentry's build plugin only when a `SENTRY_AUTH_TOKEN` is present
 * (source-map upload for readable stack traces). The runtime SDK
 * (`src/instrumentation*.ts`) captures errors without this — so CI and local
 * builds, which have no token, use the plain config and stay Turbopack-clean.
 */
export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
      widenClientFileUpload: true,
    })
  : nextConfig;
