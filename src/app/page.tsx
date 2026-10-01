import Image from 'next/image';
import Link from 'next/link';

import heroImage from '@/assets/home/hero-hoops.jpg';
import hoopsImage from '@/assets/home/hoops-satin.jpg';
import silverImage from '@/assets/home/silver-bracelets-satin.jpg';
import { CollectionCard } from '@/components/collection/CollectionCard';
import { NewsletterForm } from '@/components/newsletter/NewsletterForm';
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

const EDITORIAL = [
  {
    image: hoopsImage,
    alt: 'Four gold-filled tube hoop earrings in two sizes on cream satin',
    title: 'The hoop edit',
    body: 'Lightweight gold-filled hoops, from everyday to statement.',
    href: '/collections/hoops',
    cta: 'See the hoops',
  },
  {
    image: silverImage,
    alt: 'Two silver box-chain bracelets, one with an evil-eye charm, on satin',
    title: 'A little protection',
    body: 'Evil-eye charms and fine chains to stack or wear alone.',
    href: '/collections/bracelets',
    cta: 'See the bracelets',
  },
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
      {/* Split hero. No <Reveal> on purpose — it's in view on load, so a
          scroll-triggered fade only adds hydration-gated delay to the LCP. */}
      <section className="grid bg-accent-tint md:grid-cols-2">
        <div className="flex w-full flex-col items-start justify-center gap-6 px-6 py-20 md:max-w-[37.5rem] md:justify-self-end md:px-10 md:py-28">
          <p className="text-[11px] tracking-[0.25em] text-ink-muted uppercase">
            Miami · First drop November 2026
          </p>
          <h1 className="text-4xl leading-tight md:text-6xl">
            Everyday gold, made to last
          </h1>
          <p className="max-w-md text-ink-muted">
            Gold-filled, 18k gold, and silver jewelry. Tarnish resistant,
            hypoallergenic, nickel free.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <ButtonLink href="/collections">Preview the drop</ButtonLink>
            <ButtonLink href="#newsletter" variant="outline">
              Get first access
            </ButtonLink>
          </div>
        </div>
        <div className="relative aspect-4/5 md:aspect-auto md:min-h-[40rem]">
          <Image
            src={heroImage}
            alt="Woman in profile wearing a thin gold hoop earring"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="eager"
            fetchPriority="high"
            placeholder="blur"
            className="object-cover object-top"
          />
        </div>
      </section>

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
            <h2 className="text-2xl md:text-3xl">Coming in the drop</h2>
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

      <Section tone="surface">
        <Reveal className="grid gap-10 md:grid-cols-2 md:gap-8">
          {EDITORIAL.map((tile) => (
            <Link key={tile.href} href={tile.href} className="group block">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={tile.image}
                  alt={tile.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  placeholder="blur"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <h2 className="mt-5 text-2xl">{tile.title}</h2>
              <p className="mt-1.5 text-sm text-ink-muted">{tile.body}</p>
              <p className="mt-3 text-[11px] tracking-[0.15em] text-accent-deep uppercase underline">
                {tile.cta}
              </p>
            </Link>
          ))}
        </Reveal>
      </Section>

      {featured.length > 0 && (
        <Section tone="bg">
          <Reveal>
            <h2 className="mb-10 text-center text-2xl md:text-3xl">
              Browse by category
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
        id="newsletter"
        className="scroll-mt-24"
        innerClassName="on-ink flex flex-col items-center gap-5 py-20 text-center"
      >
        <h2 className="max-w-xl text-2xl md:text-3xl">
          Join the list for first access
        </h2>
        <p className="max-w-sm text-sm text-ink-invert/75">
          Be the first to know when the November drop goes live. No spam.
        </p>
        <NewsletterForm />
      </Section>
    </>
  );
}
