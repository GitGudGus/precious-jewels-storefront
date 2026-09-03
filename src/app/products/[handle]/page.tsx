import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { Prose } from '@/components/ui/Prose';
import { Section } from '@/components/ui/Section';
import { getProduct, getProductHandles, type Product } from '@/lib/shopify';

export const revalidate = 900;
// Only products that exist at build time are served; unknown handles get a real
// 404. A newly added product needs a redeploy to appear (same call as collections).
export const dynamicParams = false;

/** Metafield keys surfaced on the page, in display order. */
const DETAIL_SECTIONS: { key: string; label: string }[] = [
  { key: 'materials', label: 'Materials' },
  { key: 'care', label: 'Care' },
  { key: 'sizing', label: 'Sizing' },
];

export async function generateStaticParams() {
  const handles = await getProductHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps<'/products/[handle]'>): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};

  const description =
    product.seo.description ||
    product.descriptionHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const image = product.featuredImage;

  return {
    title: product.seo.title || product.title,
    description: description.slice(0, 160),
    openGraph: image
      ? {
          title: product.title,
          description: description.slice(0, 160),
          images: [
            {
              url: image.url,
              width: image.width ?? undefined,
              height: image.height ?? undefined,
              alt: image.altText ?? product.title,
            },
          ],
        }
      : undefined,
  };
}

function ProductJsonLd({ product }: { product: Product }) {
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.descriptionHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
    image: product.images.map((image) => image.url),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: minVariantPrice.currencyCode,
      lowPrice: minVariantPrice.amount,
      highPrice: maxVariantPrice.amount,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductPage({
  params,
}: PageProps<'/products/[handle]'>) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const details = DETAIL_SECTIONS.filter(
    (section) => product.metafields[section.key],
  );

  return (
    <Section tone="bg" innerClassName="space-y-14">
      <ProductJsonLd product={product} />

      <nav className="text-[11px] tracking-[0.16em] text-ink-muted uppercase">
        <Link href="/collections" className="transition-colors hover:text-ink">
          Collections
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.title}</span>
      </nav>

      <ProductPurchasePanel product={product} />

      {(product.descriptionHtml || details.length > 0) && (
        <div className="mx-auto max-w-2xl">
          {product.descriptionHtml && (
            <section className="space-y-3 border-b border-line pb-8">
              <h2 className="text-xl">Details</h2>
              <Prose html={product.descriptionHtml} />
            </section>
          )}

          {details.map((section) => (
            <details
              key={section.key}
              className="group border-b border-line py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm tracking-[0.06em]">
                {section.label}
                <span className="text-ink-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm whitespace-pre-line text-ink-muted">
                {product.metafields[section.key]}
              </p>
            </details>
          ))}
        </div>
      )}
    </Section>
  );
}
