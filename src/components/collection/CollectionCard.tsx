import Image from 'next/image';
import Link from 'next/link';

import type { Collection, ShopImage } from '@/lib/shopify';

const CARD_SIZES = '(min-width: 768px) 33vw, 100vw';

/**
 * A collection tile. Falls back to a product image when the collection has no
 * image of its own in Shopify.
 */
export function CollectionCard({
  collection,
  fallbackImage,
}: {
  collection: Collection;
  fallbackImage?: ShopImage | null;
}) {
  const image = collection.image ?? fallbackImage ?? null;

  return (
    <Link
      href={`/collections/${collection.handle}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900"
    >
      {image && (
        <Image
          src={image.url}
          alt={image.altText ?? collection.title}
          fill
          sizes={CARD_SIZES}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <h3 className="absolute bottom-4 left-4 text-lg font-medium text-white">
        {collection.title}
      </h3>
    </Link>
  );
}
