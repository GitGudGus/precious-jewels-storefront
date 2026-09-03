import type { Metadata } from 'next';

import { ArticleCard } from '@/components/content/ArticleCard';
import { PageHeader } from '@/components/content/PageHeader';
import { Section } from '@/components/ui/Section';
import { getArticles } from '@/lib/shopify';

export const revalidate = 900;

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Notes on jewelry, care, and the Precious Jewels story.',
  alternates: { canonical: '/journal' },
};

export default async function JournalPage() {
  const articles = await getArticles({ first: 12 });

  return (
    <Section tone="bg">
      <div className="mx-auto max-w-5xl space-y-12">
        <PageHeader eyebrow="Precious Jewels" title="Journal" />
        {articles.length === 0 ? (
          <p className="text-center text-sm text-ink-muted">
            No journal entries yet — check back soon.
          </p>
        ) : (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.handle} article={article} />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
