import { getCollections } from '@/lib/shopify';

import { HeaderBar } from './HeaderBar';

/**
 * Collections to surface in the nav, in order. Rendered only if the handle
 * actually exists in Shopify, so editing this list can't produce dead links.
 */
const NAV_HANDLES = [
  'new-arrivals',
  'necklaces',
  'bracelets',
  'rings',
  'hoops',
];

export async function Header() {
  const collections = await getCollections();
  const byHandle = new Map(collections.map((c) => [c.handle, c]));
  const navItems = NAV_HANDLES.map((handle) => byHandle.get(handle))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .map((c) => ({ handle: c.handle, title: c.title }));

  return <HeaderBar navItems={navItems} />;
}
