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
    ];
  },
};

export default nextConfig;
