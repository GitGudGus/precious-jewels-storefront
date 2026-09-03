import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/shopify/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Nothing here is private; the cart drawer has no URL.
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
