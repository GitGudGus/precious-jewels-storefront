'use client';

import { useState, useTransition } from 'react';

import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import {
  COLLECTION_SORT_OPTIONS,
  DEFAULT_COLLECTION_SORT,
  type CollectionSortSlug,
  type PageInfo,
  type ProductListItem,
} from '@/lib/shopify/types';

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
    <div className="space-y-10">
      <div className="flex justify-end border-b border-line pb-4">
        <label className="flex items-center gap-3 text-[11px] tracking-[0.16em] text-ink-muted uppercase">
          Sort
          <select
            value={sort}
            onChange={(event) =>
              changeSort(event.target.value as CollectionSortSlug)
            }
            disabled={pending}
            className="border border-line bg-transparent px-3 py-2 text-xs tracking-[0.1em] text-ink uppercase disabled:opacity-60"
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
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={pending}
            className="px-10"
          >
            {pending ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
