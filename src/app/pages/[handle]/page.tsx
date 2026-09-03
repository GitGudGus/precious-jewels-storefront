import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/content/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { Prose } from '@/components/ui/Prose';
import { Section } from '@/components/ui/Section';
import {
  CONTACT_EMAIL,
  CONTACT_PAGE_HANDLE,
  getPage,
  getPageHandles,
} from '@/lib/shopify';

export const revalidate = 900;
export const dynamicParams = false;

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateStaticParams() {
  const handles = await getPageHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps<'/pages/[handle]'>): Promise<Metadata> {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) return {};
  return {
    title: page.seo.title || page.title,
    description:
      page.seo.description ||
      plainText(page.bodyHtml).slice(0, 160) ||
      undefined,
    alternates: { canonical: `/pages/${handle}` },
  };
}

export default async function ContentPage({
  params,
}: PageProps<'/pages/[handle]'>) {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) notFound();

  const isContact = handle === CONTACT_PAGE_HANDLE;

  return (
    <Section tone="bg">
      <div className="mx-auto max-w-2xl space-y-10">
        <PageHeader title={page.title} />
        {page.bodyHtml && <Prose html={page.bodyHtml} className="text-base" />}
        {isContact && (
          <div className="text-center">
            <ButtonLink href={`mailto:${CONTACT_EMAIL}`}>Email us</ButtonLink>
          </div>
        )}
      </div>
    </Section>
  );
}
