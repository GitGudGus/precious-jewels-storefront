import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Prose } from '@/components/ui/Prose';
import { Section } from '@/components/ui/Section';
import { formatDate } from '@/lib/date';
import { getArticle, getArticleHandles } from '@/lib/shopify';

export const revalidate = 900;
// New articles need a redeploy to appear (same call as products/collections).
export const dynamicParams = false;

export async function generateStaticParams() {
  const handles = await getArticleHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps<'/journal/[handle]'>): Promise<Metadata> {
  const { handle } = await params;
  const article = await getArticle(handle);
  if (!article) return {};
  return {
    title: article.seo.title || article.title,
    description: article.seo.description || article.excerpt || undefined,
    alternates: { canonical: `/journal/${handle}` },
    openGraph: article.image
      ? { images: [{ url: article.image.url, alt: article.title }] }
      : undefined,
  };
}

export default async function ArticlePage({
  params,
}: PageProps<'/journal/[handle]'>) {
  const { handle } = await params;
  const article = await getArticle(handle);
  if (!article) notFound();

  return (
    <Section tone="bg">
      <article className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3 text-center">
          <p className="text-[11px] tracking-[0.16em] text-ink-muted uppercase">
            {formatDate(article.publishedAt)}
            {article.authorName ? ` · ${article.authorName}` : ''}
          </p>
          <h1 className="text-3xl md:text-4xl">{article.title}</h1>
        </header>

        {article.image && (
          <Image
            src={article.image.url}
            alt={article.image.altText ?? article.title}
            width={article.image.width ?? 1200}
            height={article.image.height ?? 800}
            className="w-full"
            priority
          />
        )}

        <Prose html={article.contentHtml} className="text-base" />

        <p className="pt-4 text-center">
          <Link
            href="/journal"
            className="text-[11px] tracking-[0.16em] text-ink-muted uppercase transition-colors hover:text-ink"
          >
            ← All entries
          </Link>
        </p>
      </article>
    </Section>
  );
}
