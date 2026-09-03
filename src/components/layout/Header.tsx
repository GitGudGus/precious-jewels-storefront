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

/** Non-collection links that live in the nav alongside the categories. */
const CONTENT_NAV = [
  { href: '/journal', label: 'Journal' },
  { href: '/pages/about-us', label: 'About' },
];

export async function Header() {
  const collections = await getCollections();
  const byHandle = new Map(collections.map((c) => [c.handle, c]));
  const navItems = [
    ...NAV_HANDLES.map((handle) => byHandle.get(handle))
      .filter((c): c is NonNullable<typeof c> => c !== undefined)
      .map((c) => ({ href: `/collections/${c.handle}`, label: c.title })),
    { href: '/collections', label: 'All' },
    ...CONTENT_NAV,
  ];

  return <HeaderBar navItems={navItems} />;
}
