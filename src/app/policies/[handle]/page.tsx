import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/content/PageHeader';
import { Prose } from '@/components/ui/Prose';
import { Section } from '@/components/ui/Section';
import { CONTACT_EMAIL, getPolicy, POLICY_HANDLES } from '@/lib/shopify';

export const revalidate = 900;
export const dynamicParams = false;

export function generateStaticParams() {
  return POLICY_HANDLES.map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: PageProps<'/policies/[handle]'>): Promise<Metadata> {
  const { handle } = await params;
  const policy = await getPolicy(handle);
  if (!policy) return {};
  return { title: policy.title };
}

export default async function PolicyPage({
  params,
}: PageProps<'/policies/[handle]'>) {
  const { handle } = await params;
  const policy = await getPolicy(handle);
  if (!policy) notFound();

  return (
    <Section tone="bg">
      <div className="mx-auto max-w-2xl space-y-10">
        <PageHeader title={policy.title} />
        {policy.bodyHtml.trim() ? (
          <Prose html={policy.bodyHtml} />
        ) : (
          <p className="text-center text-sm text-ink-muted">
            This policy is being finalised. In the meantime, reach us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        )}
      </div>
    </Section>
  );
}
