/**
 * Public surface of the Shopify data layer. Routes and components import from
 * here (`@/lib/shopify`) and never reach into `client.ts`, `queries/*`, or the
 * raw reshape types directly.
 */

export {
  addCartLines,
  createCart,
  getCart,
  removeCartLines,
  updateCartLines,
  type CartLineInput,
  type CartLineUpdate,
} from './cart';
export {
  getCollection,
  getCollectionHandles,
  getCollectionProducts,
  getCollections,
  type GetCollectionProductsOptions,
} from './collections';
export {
  CART_COOKIE,
  CART_COOKIE_MAX_AGE,
  FREE_SHIPPING_THRESHOLD,
} from './constants';
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
  type Cart,
  type CartLine,
  type CartMutationResult,
  type CartWarning,
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
