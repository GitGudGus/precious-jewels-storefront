import { CONTACT_EMAIL, SITE_URL } from '@/lib/shopify/constants';

/** Renders a `<script type="application/ld+json">` for the given structured data. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Precious Jewels',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        email: CONTACT_EMAIL,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Miami',
          addressRegion: 'FL',
          addressCountry: 'US',
        },
        sameAs: ['https://www.instagram.com/preciousjewelsmia/'],
      }}
    />
  );
}

/** `items` in order, root first. Paths are relative to `SITE_URL`. */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${SITE_URL}${item.path}`,
        })),
      }}
    />
  );
}
