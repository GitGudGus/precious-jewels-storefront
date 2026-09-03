/**
 * Public surface of the Shopify data layer. Routes and components import from
 * here (`@/lib/shopify`) and never reach into `client.ts`, `queries/*`, or the
 * raw reshape types directly.
 */

export {
  getCollection,
  getCollectionHandles,
  getCollectionProducts,
  getCollections,
  type GetCollectionProductsOptions,
} from './collections';
export { formatPrice, formatPriceRange } from './format';
export {
  getProduct,
  getProductHandles,
  getProducts,
  type GetProductsOptions,
} from './products';
export { getShopName } from './shop';
export {
  COLLECTION_SORT_OPTIONS,
  DEFAULT_COLLECTION_SORT,
  type Collection,
  type CollectionSortSlug,
  type Money,
  type Paginated,
  type PageInfo,
  type Product,
  type ProductCollectionSortKey,
  type ProductListItem,
  type ProductOption,
  type ProductSortKey,
  type ProductVariant,
  type SelectedOption,
  type SEO,
  type ShopImage,
} from './types';
