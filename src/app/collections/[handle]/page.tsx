import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CollectionProducts } from '@/components/collection/CollectionProducts';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Prose } from '@/components/ui/Prose';
import { Section } from '@/components/ui/Section';
import {
  COLLECTION_SORT_OPTIONS,
  DEFAULT_COLLECTION_SORT,
  getCollection,
  getCollectionHandles,
  getCollectionProducts,
} from '@/lib/shopify';

export const revalidate = 900;
// Only the collections that exist at build time are served; unknown handles get a
// real 404. The catalog's ~16 collections are stable — a new one needs a redeploy.
export const dynamicParams = false;

const PAGE_SIZE = 24;

export async function generateStaticParams() {
  const handles = await getCollectionHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps<'/collections/[handle]'>): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) return {};
  return {
    title: collection.title,
    description:
      collection.descriptionHtml.replace(/<[^>]+>/g, '').trim() ||
      `Shop ${collection.title} at Precious Jewels.`,
    alternates: { canonical: `/collections/${handle}` },
  };
}

export default async function CollectionPage({
  params,
}: PageProps<'/collections/[handle]'>) {
  const { handle } = await params;
  const { sortKey, reverse } = COLLECTION_SORT_OPTIONS[DEFAULT_COLLECTION_SORT];

  const [collection, firstPage] = await Promise.all([
    getCollection(handle),
    getCollectionProducts({ handle, first: PAGE_SIZE, sortKey, reverse }),
  ]);

  if (!collection || !firstPage) notFound();

  return (
    <Section tone="bg" innerClassName="space-y-10">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Collections', path: '/collections' },
          { name: collection.title, path: `/collections/${handle}` },
        ]}
      />
      <header className="space-y-3 text-center">
        <h1 className="text-3xl md:text-4xl">{collection.title}</h1>
        {collection.descriptionHtml && (
          <Prose
            html={collection.descriptionHtml}
            className="mx-auto max-w-xl text-center"
          />
        )}
      </header>

      {firstPage.items.length === 0 ? (
        <p className="text-center text-sm text-ink-muted">
          No products in this collection yet.
        </p>
      ) : (
        <CollectionProducts
          handle={handle}
          pageSize={PAGE_SIZE}
          initialItems={firstPage.items}
          initialPageInfo={firstPage.pageInfo}
        />
      )}
    </Section>
  );
}
