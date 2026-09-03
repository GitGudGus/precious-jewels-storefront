'use client';

import { useState, useTransition } from 'react';

import { ProductGrid } from '@/components/product/ProductGrid';
import {
  COLLECTION_SORT_OPTIONS,
  DEFAULT_COLLECTION_SORT,
  type CollectionSortSlug,
  type PageInfo,
  type ProductListItem,
} from '@/lib/shopify';

import { fetchCollectionProducts } from './actions';

const SORT_ENTRIES = Object.entries(COLLECTION_SORT_OPTIONS) as [
  CollectionSortSlug,
  (typeof COLLECTION_SORT_OPTIONS)[CollectionSortSlug],
][];

/**
 * The interactive product area of a collection page. The page renders the
 * default ("featured") order server-side for SEO/SSG; sorting and "load more"
 * happen here against a server action, so the route stays statically generated.
 */
export function CollectionProducts({
  handle,
  pageSize,
  initialItems,
  initialPageInfo,
}: {
  handle: string;
  pageSize: number;
  initialItems: ProductListItem[];
  initialPageInfo: PageInfo;
}) {
  const [sort, setSort] = useState<CollectionSortSlug>(DEFAULT_COLLECTION_SORT);
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState<string | null>(
    initialPageInfo.hasNextPage ? initialPageInfo.endCursor : null,
  );
  const [pending, startTransition] = useTransition();

  function changeSort(next: CollectionSortSlug) {
    if (next === sort) return;
    setSort(next);
    // Reflect the choice in the URL without a navigation/server round-trip.
    const url =
      next === DEFAULT_COLLECTION_SORT
        ? window.location.pathname
        : `${window.location.pathname}?sort=${next}`;
    window.history.replaceState(null, '', url);

    startTransition(async () => {
      const page = await fetchCollectionProducts(handle, next, pageSize);
      setItems(page.items);
      setCursor(page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null);
    });
  }

  function loadMore() {
    if (!cursor || pending) return;
    const after = cursor;
    startTransition(async () => {
      const page = await fetchCollectionProducts(handle, sort, pageSize, after);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null);
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          Sort
          <select
            value={sort}
            onChange={(event) =>
              changeSort(event.target.value as CollectionSortSlug)
            }
            disabled={pending}
            className="rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-neutral-900 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-100"
          >
            {SORT_ENTRIES.map(([slug, option]) => (
              <option key={slug} value={slug}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={pending ? 'opacity-60 transition-opacity' : undefined}>
        <ProductGrid products={items} />
      </div>

      {cursor && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            {pending ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
