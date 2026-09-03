'use client';

import Image from 'next/image';
import { useState } from 'react';

import type { ShopImage } from '@/lib/shopify';

const MAIN_SIZES = '(min-width: 1024px) 45vw, 100vw';

/**
 * Hero image + thumbnail strip with click-to-zoom. When the selected variant has
 * its own image the parent remounts this with a new `key`, so the initial index
 * just needs to honour `initialImageUrl`.
 */
export function ProductGallery({
  images,
  title,
  initialImageUrl,
}: {
  images: ShopImage[];
  title: string;
  initialImageUrl?: string | null;
}) {
  const [index, setIndex] = useState(() => {
    const match = images.findIndex((image) => image.url === initialImageUrl);
    return match >= 0 ? match : 0;
  });
  const [zoomed, setZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-lg bg-neutral-100 dark:bg-neutral-900" />
    );
  }

  const active = images[Math.min(index, images.length - 1)];

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setZoomed((value) => !value)}
        className="relative block aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900"
        aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
      >
        <Image
          src={active.url}
          alt={active.altText ?? title}
          fill
          priority
          sizes={MAIN_SIZES}
          className={`object-cover transition-transform duration-300 ${
            zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
        />
      </button>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => {
                setIndex(i);
                setZoomed(false);
              }}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border ${
                i === index
                  ? 'border-neutral-900 dark:border-white'
                  : 'border-transparent'
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
