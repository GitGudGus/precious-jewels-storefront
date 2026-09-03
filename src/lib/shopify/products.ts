import {
  getProductHandlesQuery,
  getProductQuery,
  getProductsQuery,
} from './queries/products';
import { storefront } from './request';
import {
  reshapeProduct,
  reshapeProductListItem,
  type RawProduct,
  type RawProductListItem,
} from './reshape';
import type {
  PageInfo,
  Product,
  ProductListItem,
  ProductSortKey,
} from './types';

/** Storefront API hard cap on `first`. */
const MAX_PAGE_SIZE = 250;

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await storefront<{ product: RawProduct | null }>(
    getProductQuery,
    {
      handle,
    },
  );
  return data.product ? reshapeProduct(data.product) : null;
}

export type GetProductsOptions = {
  first?: number;
  sortKey?: ProductSortKey;
  reverse?: boolean;
  /** Shopify search-syntax filter, e.g. `available_for_sale:true`. */
  query?: string;
};

export async function getProducts({
  first = 24,
  sortKey,
  reverse,
  query,
}: GetProductsOptions = {}): Promise<ProductListItem[]> {
  const data = await storefront<{ products: { nodes: RawProductListItem[] } }>(
    getProductsQuery,
    { first, sortKey, reverse, query },
  );
  return data.products.nodes.map(reshapeProductListItem);
}

/** Every product handle, following pagination — for `generateStaticParams`. */
export async function getProductHandles(): Promise<string[]> {
  const handles: string[] = [];
  let after: string | null = null;

  do {
    const data: {
      products: { nodes: { handle: string }[]; pageInfo: PageInfo };
    } = await storefront(getProductHandlesQuery, {
      first: MAX_PAGE_SIZE,
      after,
    });
    handles.push(...data.products.nodes.map((node) => node.handle));
    after = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (after);

  return handles;
}
