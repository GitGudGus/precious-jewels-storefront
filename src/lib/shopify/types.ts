/**
 * Domain types — the reshaped shapes the rest of the app consumes.
 *
 * These deliberately have no GraphQL `edges`/`nodes` nesting; `reshape.ts` flattens
 * Shopify's connection shapes into these before anything outside `src/lib/shopify/`
 * sees them.
 */

export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type SEO = {
  title: string | null;
  description: string | null;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  selectedOptions: SelectedOption[];
  image: ShopImage | null;
};

/** A product as rendered in a grid/card — the minimum for `ProductCard`. */
export type ProductListItem = {
  handle: string;
  title: string;
  featuredImage: ShopImage | null;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  availableForSale: boolean;
};

/** A product as rendered on its detail page. */
export type Product = ProductListItem & {
  id: string;
  descriptionHtml: string;
  images: ShopImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  seo: SEO;
  /** Only keys that actually resolved to content in Shopify. */
  metafields: Record<string, string>;
  updatedAt: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  image: ShopImage | null;
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type Paginated<T> = {
  items: T[];
  pageInfo: PageInfo;
};

// --- Sorting -----------------------------------------------------------------

export type ProductSortKey =
  'BEST_SELLING' | 'CREATED_AT' | 'PRICE' | 'TITLE' | 'RELEVANCE';

export type ProductCollectionSortKey =
  | 'BEST_SELLING'
  | 'COLLECTION_DEFAULT'
  | 'CREATED'
  | 'ID'
  | 'MANUAL'
  | 'PRICE'
  | 'RELEVANCE'
  | 'TITLE';

/**
 * User-facing sort choices for the collection grid (wired up in the browse-routes
 * PR). The UI picks a slug; `sortKey`/`reverse` go straight to
 * `getCollectionProducts`.
 */
export const COLLECTION_SORT_OPTIONS = {
  featured: {
    label: 'Featured',
    sortKey: 'COLLECTION_DEFAULT',
    reverse: false,
  },
  'price-asc': {
    label: 'Price: low to high',
    sortKey: 'PRICE',
    reverse: false,
  },
  'price-desc': {
    label: 'Price: high to low',
    sortKey: 'PRICE',
    reverse: true,
  },
  newest: { label: 'Newest', sortKey: 'CREATED', reverse: true },
  'title-asc': { label: 'Alphabetical', sortKey: 'TITLE', reverse: false },
} as const satisfies Record<
  string,
  { label: string; sortKey: ProductCollectionSortKey; reverse: boolean }
>;

export type CollectionSortSlug = keyof typeof COLLECTION_SORT_OPTIONS;

export const DEFAULT_COLLECTION_SORT: CollectionSortSlug = 'featured';
