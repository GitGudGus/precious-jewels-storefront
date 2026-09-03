import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
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
    <div className="space-y-12">
      <ProductJsonLd product={product} />

      <nav className="text-sm text-neutral-500">
        <Link
          href="/collections"
          className="hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          Collections
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700 dark:text-neutral-300">
          {product.title}
        </span>
      </nav>

      <ProductPurchasePanel product={product} />

      {product.descriptionHtml && (
        <section className="max-w-2xl space-y-3">
          <h2 className="text-lg font-medium">Details</h2>
          <div
            className="text-sm leading-relaxed text-neutral-600 [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_ul]:space-y-1 dark:text-neutral-300"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </section>
      )}

      {details.length > 0 && (
        <section className="max-w-2xl divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {details.map((section) => (
            <div key={section.key} className="py-4">
              <h3 className="text-sm font-medium">{section.label}</h3>
              <p className="mt-1 text-sm whitespace-pre-line text-neutral-600 dark:text-neutral-300">
                {product.metafields[section.key]}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
