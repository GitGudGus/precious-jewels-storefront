import {
  articleFragment,
  articleListItemFragment,
  imageFragment,
  pageFragment,
} from '../fragments';

/** The one blog in this store. */
export const BLOG_HANDLE = 'news';

export const getPageQuery = /* GraphQL */ `
  query getPage($handle: String!) {
    page(handle: $handle) {
      ...Page
    }
  }
  ${pageFragment}
`;

export const getPageHandlesQuery = /* GraphQL */ `
  query getPageHandles($first: Int!, $after: String) {
    pages(first: $first, after: $after) {
      nodes {
        handle
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const POLICY_FIELDS = `
  handle
  title
  body
`;

export const getPoliciesQuery = /* GraphQL */ `
  query getPolicies {
    shop {
      privacyPolicy { ${POLICY_FIELDS} }
      refundPolicy { ${POLICY_FIELDS} }
      termsOfService { ${POLICY_FIELDS} }
      shippingPolicy { ${POLICY_FIELDS} }
    }
  }
`;

export const getArticlesQuery = /* GraphQL */ `
  query getArticles($first: Int!, $after: String) {
    blog(handle: "${BLOG_HANDLE}") {
      articles(
        first: $first
        after: $after
        sortKey: PUBLISHED_AT
        reverse: true
      ) {
        nodes {
          ...ArticleListItem
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${articleListItemFragment}
  ${imageFragment}
`;

export const getArticleQuery = /* GraphQL */ `
  query getArticle($handle: String!) {
    blog(handle: "${BLOG_HANDLE}") {
      articleByHandle(handle: $handle) {
        ...Article
      }
    }
  }
  ${articleFragment}
  ${articleListItemFragment}
  ${imageFragment}
`;
