import Image from 'next/image';
import Link from 'next/link';

import { Price } from '@/components/Price';
import type { ProductListItem } from '@/lib/shopify';

/**
 * Grid sizing used for the `sizes` hint: 2-up on mobile, 3-up at `sm`, 4-up at
 * `lg`. Keep in sync with `ProductGrid`'s column classes.
 */
const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw';

export function ProductCard({ product }: { product: ProductListItem }) {
  const { minVariantPrice, maxVariantPrice } = product.priceRange;

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
        {product.featuredImage && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes={CARD_SIZES}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {!product.availableForSale && (
          <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-1 text-xs font-medium text-neutral-700 dark:bg-black/80 dark:text-neutral-200">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm text-neutral-800 dark:text-neutral-200">
          {product.title}
        </h3>
        <Price
          min={minVariantPrice}
          max={
            minVariantPrice.amount === maxVariantPrice.amount
              ? undefined
              : maxVariantPrice
          }
          className="shrink-0 text-sm text-neutral-500 dark:text-neutral-400"
        />
      </div>
    </Link>
  );
}
