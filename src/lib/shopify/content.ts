import {
  getArticleQuery,
  getArticlesQuery,
  getPageHandlesQuery,
  getPageQuery,
  getPoliciesQuery,
} from './queries/content';
import { storefront } from './request';
import {
  reshapeArticle,
  reshapeArticleListItem,
  reshapePage,
  type RawArticle,
  type RawPage,
} from './reshape';
import type {
  Article,
  ArticleListItem,
  PageInfo,
  Page as StorePage,
  Policy,
} from './types';

const MAX_PAGE_SIZE = 250;

/** Shop-policy handles → the `shop.*Policy` field that backs them. */
const POLICY_FIELD_BY_HANDLE = {
  'privacy-policy': 'privacyPolicy',
  'refund-policy': 'refundPolicy',
  'terms-of-service': 'termsOfService',
  'shipping-policy': 'shippingPolicy',
} as const;

export type PolicyHandle = keyof typeof POLICY_FIELD_BY_HANDLE;

/** In footer/nav display order. */
export const POLICY_HANDLES = Object.keys(
  POLICY_FIELD_BY_HANDLE,
) as PolicyHandle[];

export async function getPage(handle: string): Promise<StorePage | null> {
  const data = await storefront<{ page: RawPage | null }>(getPageQuery, {
    handle,
  });
  return data.page ? reshapePage(data.page) : null;
}

/** Every online-store page handle — for `generateStaticParams`. */
export async function getPageHandles(): Promise<string[]> {
  const handles: string[] = [];
  let after: string | null = null;

  do {
    const data: {
      pages: { nodes: { handle: string }[]; pageInfo: PageInfo };
    } = await storefront(getPageHandlesQuery, { first: MAX_PAGE_SIZE, after });
    handles.push(...data.pages.nodes.map((node) => node.handle));
    after = data.pages.pageInfo.hasNextPage
      ? data.pages.pageInfo.endCursor
      : null;
  } while (after);

  return handles;
}

type RawPolicy = { handle: string; title: string; body: string } | null;

export async function getPolicy(handle: string): Promise<Policy | null> {
  if (!(handle in POLICY_FIELD_BY_HANDLE)) return null;

  const data = await storefront<{ shop: Record<string, RawPolicy> }>(
    getPoliciesQuery,
  );
  const raw = data.shop[POLICY_FIELD_BY_HANDLE[handle as PolicyHandle]];
  if (!raw) return null;

  return { handle: raw.handle, title: raw.title, bodyHtml: raw.body };
}

export async function getArticles({
  first = 12,
}: { first?: number } = {}): Promise<ArticleListItem[]> {
  const data = await storefront<{
    blog: { articles: { nodes: RawArticle[] } } | null;
  }>(getArticlesQuery, { first });
  return (data.blog?.articles.nodes ?? []).map(reshapeArticleListItem);
}

export async function getArticleHandles(): Promise<string[]> {
  return (await getArticles({ first: MAX_PAGE_SIZE })).map(
    (article) => article.handle,
  );
}

export async function getArticle(handle: string): Promise<Article | null> {
  const data = await storefront<{
    blog: { articleByHandle: RawArticle | null } | null;
  }>(getArticleQuery, { handle });
  const raw = data.blog?.articleByHandle;
  return raw ? reshapeArticle(raw) : null;
}
