import type { MetadataRoute } from 'next';

import {
  getArticleHandles,
  getCollectionHandles,
  getPageHandles,
  getProductHandles,
  POLICY_HANDLES,
  SITE_URL,
} from '@/lib/shopify';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, pages, articles] = await Promise.all([
    getProductHandles(),
    getCollectionHandles(),
    getPageHandles(),
    getArticleHandles(),
  ]);

  const entry = (path: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  });

  return [
    entry('/'),
    entry('/collections'),
    entry('/journal'),
    ...collections.map((h) => entry(`/collections/${h}`)),
    ...products.map((h) => entry(`/products/${h}`)),
    ...pages.map((h) => entry(`/pages/${h}`)),
    ...POLICY_HANDLES.map((h) => entry(`/policies/${h}`)),
    ...articles.map((h) => entry(`/journal/${h}`)),
  ];
}
