'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { Price } from '@/components/Price';
import { ProductGallery } from '@/components/product/ProductGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import type { Product } from '@/lib/shopify';

type Selection = Record<string, string>;

/** Options of the first purchasable variant (or just the first variant). */
function defaultSelection(product: Product): Selection {
  const variant =
    product.variants.find((candidate) => candidate.availableForSale) ??
    product.variants[0];
  if (!variant) return {};
  return Object.fromEntries(
    variant.selectedOptions.map((option) => [option.name, option.value]),
  );
}

/** Read a full, valid selection out of `?option=value` params, else null. */
function selectionFromSearch(
  product: Product,
  search: string,
): Selection | null {
  if (product.options.length === 0) return null;
  const params = new URLSearchParams(search);
  const selection: Selection = {};
  for (const option of product.options) {
    const raw = params.get(option.name.toLowerCase());
    const match = option.values.find(
      (value) => value.toLowerCase() === raw?.toLowerCase(),
    );
    if (!match) return null;
    selection[option.name] = match;
  }
  return selection;
}

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

/**
 * The interactive area of a product page: gallery, variant picker, price,
 * add-to-cart. The selected variant lives in the URL (`?color=gold`) so it's
 * shareable and survives back/forward; the page itself stays statically
 * generated because the params are only ever read on the client.
 */
export function ProductPurchasePanel({ product }: { product: Product }) {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  );

  const selection = useMemo(
    () => selectionFromSearch(product, search) ?? defaultSelection(product),
    [product, search],
  );

  const selectedVariant = useMemo(() => {
    const match = product.variants.find((variant) =>
      variant.selectedOptions.every(
        (option) => selection[option.name] === option.value,
      ),
    );
    if (match) return match;
    return product.options.length === 0 ? product.variants[0] : undefined;
  }, [product, selection]);

  const onSelect = useCallback(
    (optionName: string, value: string) => {
      const next = { ...selection, [optionName]: value };
      const params = new URLSearchParams();
      for (const [name, selectedValue] of Object.entries(next)) {
        params.set(name.toLowerCase(), selectedValue);
      }
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}?${params.toString()}`,
      );
      // replaceState doesn't emit popstate — nudge the store to re-read.
      window.dispatchEvent(new Event('popstate'));
    },
    [selection],
  );

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const available = selectedVariant
    ? selectedVariant.availableForSale
    : product.availableForSale;
  const activeImageUrl =
    selectedVariant?.image?.url ?? product.featuredImage?.url ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ProductGallery
        key={activeImageUrl ?? 'default'}
        images={product.images}
        title={product.title}
        initialImageUrl={activeImageUrl}
      />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {product.title}
          </h1>
          <Price
            min={price}
            max={
              !selectedVariant && price.amount !== maxPrice.amount
                ? maxPrice
                : undefined
            }
            className="text-lg text-neutral-700 dark:text-neutral-200"
          />
        </div>

        <VariantSelector
          options={product.options}
          variants={product.variants}
          selection={selection}
          onSelect={onSelect}
        />

        <AddToCartButton
          variantId={selectedVariant?.id}
          available={available}
        />
      </div>
    </div>
  );
}
