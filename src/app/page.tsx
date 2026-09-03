import { CollectionCard } from '@/components/collection/CollectionCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import {
  getCollectionProducts,
  getCollections,
  getProducts,
} from '@/lib/shopify';
import type { ProductListItem } from '@/lib/shopify/types';

export const revalidate = 900;

const FEATURED_COLLECTION_HANDLES = [
  'necklaces',
  'bracelets',
  'rings',
  'hoops',
  'pendants',
  'anklets',
];

const VALUE_PROPS = [
  { title: 'Gold-filled & 18k', body: 'Real gold that lasts, not plating.' },
  {
    title: 'Tarnish resistant',
    body: 'Wear it in the shower, the ocean, everywhere.',
  },
  { title: 'Hypoallergenic', body: 'Nickel free — kind to sensitive skin.' },
  { title: 'Made in Miami', body: 'Designed and shipped from South Florida.' },
];

async function getNewArrivals(): Promise<ProductListItem[]> {
  const page = await getCollectionProducts({
    handle: 'new-arrivals',
    first: 8,
  });
  if (page && page.items.length > 0) return page.items;
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
    <>
      <Section
        tone="bg"
        innerClassName="flex flex-col items-center gap-6 py-24 text-center md:py-32"
      >
        <Reveal className="flex flex-col items-center gap-6">
          <p className="text-[11px] tracking-[0.25em] text-ink-muted uppercase">
            Precious Jewels · Miami
          </p>
          <h1 className="max-w-3xl text-4xl leading-tight md:text-6xl">
            Everyday gold, made to last
          </h1>
          <p className="max-w-md text-ink-muted">
            Gold-filled, 18k gold, and silver jewelry. Tarnish resistant,
            hypoallergenic, nickel free.
          </p>
          <ButtonLink href="/collections" className="mt-2">
            Shop the collection
          </ButtonLink>
        </Reveal>
      </Section>

      <Section tone="surface" innerClassName="py-14">
        <Reveal className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="space-y-1.5">
              <h3 className="text-sm tracking-[0.08em]">{prop.title}</h3>
              <p className="text-xs text-ink-muted">{prop.body}</p>
            </div>
          ))}
        </Reveal>
      </Section>

      <Section tone="bg">
        <Reveal>
          <div className="mb-10 flex items-baseline justify-between">
            <h2 className="text-2xl md:text-3xl">New arrivals</h2>
            <ButtonLink
              href="/collections/new-arrivals"
              variant="outline"
              className="hidden px-6 py-2.5 sm:inline-flex"
            >
              View all
            </ButtonLink>
          </div>
          <ProductGrid products={newArrivals} />
        </Reveal>
      </Section>

      {featured.length > 0 && (
        <Section tone="surface">
          <Reveal>
            <h2 className="mb-10 text-center text-2xl md:text-3xl">
              Shop by category
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {featured.map((collection) => (
                <CollectionCard
                  key={collection.handle}
                  collection={collection}
                />
              ))}
            </div>
          </Reveal>
        </Section>
      )}

      <Section
        tone="ink"
        innerClassName="flex flex-col items-center gap-5 py-20 text-center"
      >
        <h2 className="max-w-xl text-2xl md:text-3xl">
          Join the list for first access
        </h2>
        <p className="max-w-sm text-sm text-ink-invert/70">
          New drops, restocks, and the occasional discount. No spam.
        </p>
        {/* Visual only for now — wiring email capture (Shopify marketing
            consent) is a later milestone. */}
        <div className="mt-2 flex w-full max-w-sm border border-ink-invert/30">
          <input
            type="email"
            placeholder="Email address"
            aria-label="Email address"
            className="flex-1 bg-transparent px-4 py-3 text-sm text-ink-invert placeholder:text-ink-invert/50 focus:outline-none"
          />
          <button
            type="button"
            className="bg-ink-invert px-6 text-[11px] tracking-[0.15em] text-ink uppercase"
          >
            Sign up
          </button>
        </div>
      </Section>
    </>
  );
}
