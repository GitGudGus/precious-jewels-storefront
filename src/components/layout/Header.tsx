import Link from 'next/link';

import { getCollections } from '@/lib/shopify';

/**
 * Collections to surface in the top nav, in order. Rendered only if the handle
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
  const navItems = NAV_HANDLES.map((handle) => byHandle.get(handle)).filter(
    (c): c is NonNullable<typeof c> => c !== undefined,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight whitespace-nowrap"
        >
          Precious Jewels
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-neutral-600 md:flex dark:text-neutral-300">
          {navItems.map((collection) => (
            <Link
              key={collection.handle}
              href={`/collections/${collection.handle}`}
              className="hover:text-neutral-950 dark:hover:text-white"
            >
              {collection.title}
            </Link>
          ))}
          <Link
            href="/collections"
            className="hover:text-neutral-950 dark:hover:text-white"
          >
            All
          </Link>
        </nav>

        {/* Cart handoff arrives in Milestone 2. */}
        <span
          aria-label="Cart (coming soon)"
          className="text-neutral-400 dark:text-neutral-600"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </span>
      </div>

      <nav className="flex gap-4 overflow-x-auto border-t border-neutral-200 px-4 py-2 text-sm text-neutral-600 md:hidden dark:border-neutral-800 dark:text-neutral-300">
        {navItems.map((collection) => (
          <Link
            key={collection.handle}
            href={`/collections/${collection.handle}`}
            className="whitespace-nowrap"
          >
            {collection.title}
          </Link>
        ))}
        <Link href="/collections" className="whitespace-nowrap">
          All
        </Link>
      </nav>
    </header>
  );
}
