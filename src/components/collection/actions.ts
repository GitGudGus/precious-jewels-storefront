'use server';

import {
  COLLECTION_SORT_OPTIONS,
  getCollectionProducts,
  type CollectionSortSlug,
  type Paginated,
  type ProductListItem,
} from '@/lib/shopify';

const EMPTY: Paginated<ProductListItem> = {
  items: [],
  pageInfo: { hasNextPage: false, endCursor: null },
};

/** One page of a collection's products in the given sort order. */
export async function fetchCollectionProducts(
  handle: string,
  sortSlug: CollectionSortSlug,
  first: number,
  after: string | null = null,
): Promise<Paginated<ProductListItem>> {
  const option = COLLECTION_SORT_OPTIONS[sortSlug];
  if (!option) return EMPTY;

  const page = await getCollectionProducts({
    handle,
    first,
    after,
    sortKey: option.sortKey,
    reverse: option.reverse,
  });
  return page ?? EMPTY;
}
