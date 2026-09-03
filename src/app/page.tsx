import Link from 'next/link';

import { CollectionCard } from '@/components/collection/CollectionCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import {
  getCollectionProducts,
  getCollections,
  getProducts,
  type ProductListItem,
} from '@/lib/shopify';

export const revalidate = 900;

const FEATURED_COLLECTION_HANDLES = [
  'necklaces',
  'bracelets',
  'rings',
  'hoops',
  'pendants',
  'anklets',
];

async function getNewArrivals(): Promise<ProductListItem[]> {
  const page = await getCollectionProducts({
    handle: 'new-arrivals',
    first: 8,
  });
  if (page && page.items.length > 0) return page.items;
  // Fall back to the most recently created products if the collection is missing
  // or empty.
  return getProducts({ first: 8, sortKey: 'CREATED_AT', reverse: true });
}

export default async function Home() {
  const [newArrivals, collections] = await Promise.all([
    getNewArrivals(),
    getCollections(),
  ]);

  const byHandle = new Map(collections.map((c) => [c.handle, c]));
  const featured = FEATURED_COLLECTION_HANDLES.map((h) =>
    byHandle.get(h),
  ).filter((c): c is NonNullable<typeof c> => c !== undefined);

  return (
    <div className="space-y-20">
      <section className="flex flex-col items-center gap-5 py-14 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Everyday gold, made to last
        </h1>
        <p className="max-w-xl text-neutral-600 dark:text-neutral-300">
          Gold-filled, 18k gold, and silver jewelry from Miami. Tarnish
          resistant, hypoallergenic, nickel free.
        </p>
        <Link
          href="/collections"
          className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          Shop the collection
        </Link>
      </section>

      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            New arrivals
          </h2>
          <Link
            href="/collections/new-arrivals"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            View all
          </Link>
        </div>
        <ProductGrid products={newArrivals} />
      </section>

      {featured.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Shop by category
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {featured.map((collection) => (
              <CollectionCard key={collection.handle} collection={collection} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
