import Image from 'next/image';
import Link from 'next/link';

import type { Collection, ShopImage } from '@/lib/shopify/types';

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
      className="group relative block aspect-4/5 overflow-hidden bg-surface"
    >
      {image && (
        <Image
          src={image.url}
          alt={image.altText ?? collection.title}
          fill
          sizes={CARD_SIZES}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
      <h3 className="absolute bottom-4 left-4 font-serif text-lg tracking-[0.12em] text-white uppercase">
        {collection.title}
      </h3>
    </Link>
  );
}
