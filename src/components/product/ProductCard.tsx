import Image from 'next/image';
import Link from 'next/link';

import { Price } from '@/components/Price';
import type { ProductListItem } from '@/lib/shopify/types';

/**
 * Grid sizing for the `sizes` hint: 2-up on mobile, 3-up at `sm`, 4-up at `lg`.
 * Keep in sync with `ProductGrid`'s column classes.
 */
const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw';

export function ProductCard({ product }: { product: ProductListItem }) {
  const { minVariantPrice, maxVariantPrice } = product.priceRange;

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-surface">
        {product.featuredImage && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes={CARD_SIZES}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        {!product.availableForSale && (
          <span className="absolute top-3 left-3 bg-bg px-2 py-1 text-[10px] tracking-[0.15em] text-ink-muted uppercase">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm text-ink">{product.title}</h3>
        <Price
          min={minVariantPrice}
          max={
            minVariantPrice.amount === maxVariantPrice.amount
              ? undefined
              : maxVariantPrice
          }
          className="text-sm text-ink-muted"
        />
      </div>
    </Link>
  );
}
