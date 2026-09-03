import {
  getCollectionHandlesQuery,
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from './queries/collections';
import { storefront } from './request';
import {
  reshapeCollection,
  reshapeProductListItem,
  type RawCollection,
  type RawProductListItem,
} from './reshape';
import type {
  Collection,
  PageInfo,
  Paginated,
  ProductCollectionSortKey,
  ProductListItem,
} from './types';

/** Storefront API hard cap on `first`. */
const MAX_PAGE_SIZE = 250;

export async function getCollections(): Promise<Collection[]> {
  const data = await storefront<{ collections: { nodes: RawCollection[] } }>(
    getCollectionsQuery,
    { first: 100 },
  );
  return data.collections.nodes.map(reshapeCollection);
}

export async function getCollection(
  handle: string,
): Promise<Collection | null> {
  const data = await storefront<{ collection: RawCollection | null }>(
    getCollectionQuery,
    { handle },
  );
  return data.collection ? reshapeCollection(data.collection) : null;
}

export type GetCollectionProductsOptions = {
  handle: string;
  first?: number;
  after?: string | null;
  sortKey?: ProductCollectionSortKey;
  reverse?: boolean;
};

/**
 * One page of a collection's products. Returns `null` when the collection itself
 * doesn't exist (the caller should `notFound()`); an existing but empty
 * collection returns `{ items: [], pageInfo }`.
 */
export async function getCollectionProducts({
  handle,
  first = 24,
  after = null,
  sortKey,
  reverse,
}: GetCollectionProductsOptions): Promise<Paginated<ProductListItem> | null> {
  const data = await storefront<{
    collection: {
      products: { nodes: RawProductListItem[]; pageInfo: PageInfo };
    } | null;
  }>(getCollectionProductsQuery, { handle, first, after, sortKey, reverse });

  if (!data.collection) return null;

  return {
    items: data.collection.products.nodes.map(reshapeProductListItem),
    pageInfo: data.collection.products.pageInfo,
  };
}

/** Every collection handle, following pagination — for `generateStaticParams`. */
export async function getCollectionHandles(): Promise<string[]> {
  const handles: string[] = [];
  let after: string | null = null;

  do {
    const data: {
      collections: { nodes: { handle: string }[]; pageInfo: PageInfo };
    } = await storefront(getCollectionHandlesQuery, {
      first: MAX_PAGE_SIZE,
      after,
    });
    handles.push(...data.collections.nodes.map((node) => node.handle));
    after = data.collections.pageInfo.hasNextPage
      ? data.collections.pageInfo.endCursor
      : null;
  } while (after);

  return handles;
}
