import type { Metadata } from 'next';

import { CollectionCard } from '@/components/collection/CollectionCard';
import { Section } from '@/components/ui/Section';
import { getCollectionProducts, getCollections } from '@/lib/shopify';

export const revalidate = 900;

export const metadata: Metadata = {
  title: 'All collections',
  description: 'Browse every Precious Jewels collection.',
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  // One cheap probe per collection: drop the empty ones from the index, and
  // borrow a product image where the collection has none of its own.
  const withPreview = await Promise.all(
    collections.map(async (collection) => {
      const page = await getCollectionProducts({
        handle: collection.handle,
        first: 1,
      });
      return {
        collection,
        isEmpty: !page || page.items.length === 0,
        fallbackImage: page?.items[0]?.featuredImage ?? null,
      };
    }),
  );

  const visible = withPreview.filter((entry) => !entry.isEmpty);

  return (
    <Section tone="bg" innerClassName="space-y-10">
      <h1 className="text-center text-3xl md:text-4xl">Collections</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map(({ collection, fallbackImage }) => (
          <CollectionCard
            key={collection.handle}
            collection={collection}
            fallbackImage={fallbackImage}
          />
        ))}
      </div>
    </Section>
  );
}
