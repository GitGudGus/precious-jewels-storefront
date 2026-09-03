/**
 * The boundary between Shopify's GraphQL response shapes ("raw") and the domain
 * types the rest of the app uses. Nothing outside `src/lib/shopify/` should see a
 * raw shape.
 */

import type {
  Cart,
  CartLine,
  Collection,
  Money,
  Product,
  ProductListItem,
  ProductOption,
  ProductVariant,
  SEO,
  ShopImage,
} from './types';

// --- Raw response shapes (mirror the fragments in fragments.ts) --------------

export type RawImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
} | null;

export type RawMoney = { amount: string; currencyCode: string };

export type RawConnection<T> = { nodes: T[] } | { edges: { node: T }[] };

export type RawProductListItem = {
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage: RawImage;
  priceRange: {
    minVariantPrice: RawMoney;
    maxVariantPrice: RawMoney;
  };
};

export type RawProductOption = {
  id: string;
  name: string;
  optionValues: { name: string }[];
};

export type RawProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: RawMoney;
  selectedOptions: { name: string; value: string }[];
  image: RawImage;
};

export type RawMetafield = { key: string; value: string } | null;

export type RawProduct = RawProductListItem & {
  id: string;
  descriptionHtml: string;
  updatedAt: string;
  seo: { title: string | null; description: string | null };
  options: RawProductOption[];
  images: RawConnection<NonNullable<RawImage>>;
  variants: RawConnection<RawProductVariant>;
  metafields: RawMetafield[];
};

export type RawCollection = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  image: RawImage;
};

// --- Helpers ---------------------------------------------------------------

/** Accept either the `nodes` shorthand or classic `edges { node }`. */
export function flattenConnection<T>(connection: RawConnection<T>): T[] {
  if ('nodes' in connection) return connection.nodes;
  return connection.edges.map((edge) => edge.node);
}

function reshapeImage(image: RawImage): ShopImage | null {
  if (!image) return null;
  return {
    url: image.url,
    altText: image.altText,
    width: image.width,
    height: image.height,
  };
}

function reshapeMoney(money: RawMoney): Money {
  return { amount: money.amount, currencyCode: money.currencyCode };
}

/**
 * Shopify represents a product with no real options as a single option named
 * "Title" with the single value "Default Title". Strip it so the UI can treat
 * "has options" as "has a variant selector".
 */
function isPlaceholderOption(options: RawProductOption[]): boolean {
  return (
    options.length === 1 &&
    options[0].name === 'Title' &&
    options[0].optionValues.length === 1 &&
    options[0].optionValues[0].name === 'Default Title'
  );
}

function reshapeOptions(options: RawProductOption[]): ProductOption[] {
  if (isPlaceholderOption(options)) return [];
  return options.map((option) => ({
    id: option.id,
    name: option.name,
    values: option.optionValues.map((value) => value.name),
  }));
}

function reshapeVariant(variant: RawProductVariant): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    price: reshapeMoney(variant.price),
    selectedOptions: variant.selectedOptions,
    image: reshapeImage(variant.image),
  };
}

function reshapeSeo(seo: {
  title: string | null;
  description: string | null;
}): SEO {
  return { title: seo.title, description: seo.description };
}

/** Build a `{ key: value }` map from only the metafields that resolved to content. */
function reshapeMetafields(metafields: RawMetafield[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const metafield of metafields) {
    if (metafield && metafield.value.trim() !== '') {
      result[metafield.key] = metafield.value;
    }
  }
  return result;
}

// --- Public reshapers ----------------------------------------------------

export function reshapeProductListItem(
  product: RawProductListItem,
): ProductListItem {
  return {
    handle: product.handle,
    title: product.title,
    availableForSale: product.availableForSale,
    featuredImage: reshapeImage(product.featuredImage),
    priceRange: {
      minVariantPrice: reshapeMoney(product.priceRange.minVariantPrice),
      maxVariantPrice: reshapeMoney(product.priceRange.maxVariantPrice),
    },
  };
}

export function reshapeProduct(product: RawProduct): Product {
  return {
    ...reshapeProductListItem(product),
    id: product.id,
    descriptionHtml: product.descriptionHtml,
    updatedAt: product.updatedAt,
    seo: reshapeSeo(product.seo),
    options: reshapeOptions(product.options),
    images: flattenConnection(product.images)
      .map(reshapeImage)
      .filter((image): image is ShopImage => image !== null),
    variants: flattenConnection(product.variants).map(reshapeVariant),
    metafields: reshapeMetafields(product.metafields),
  };
}

export function reshapeCollection(collection: RawCollection): Collection {
  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    descriptionHtml: collection.descriptionHtml,
    image: reshapeImage(collection.image),
  };
}

// --- Cart -----------------------------------------------------------------

type RawCartMerchandise = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: RawMoney;
  image: RawImage;
  selectedOptions: { name: string; value: string }[];
  product: { handle: string; title: string };
};

type RawCartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: RawMoney };
  merchandise: RawCartMerchandise;
};

export type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: RawMoney; totalAmount: RawMoney };
  lines: RawConnection<RawCartLine>;
};

function reshapeCartLine(line: RawCartLine): CartLine {
  const { merchandise } = line;
  return {
    id: line.id,
    quantity: line.quantity,
    cost: { totalAmount: reshapeMoney(line.cost.totalAmount) },
    merchandise: {
      variantId: merchandise.id,
      variantTitle: merchandise.title,
      productHandle: merchandise.product.handle,
      productTitle: merchandise.product.title,
      selectedOptions: merchandise.selectedOptions,
      image: reshapeImage(merchandise.image),
      price: reshapeMoney(merchandise.price),
      availableForSale: merchandise.availableForSale,
    },
  };
}

export function reshapeCart(cart: RawCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    cost: {
      subtotalAmount: reshapeMoney(cart.cost.subtotalAmount),
      totalAmount: reshapeMoney(cart.cost.totalAmount),
    },
    lines: flattenConnection(cart.lines).map(reshapeCartLine),
  };
}
