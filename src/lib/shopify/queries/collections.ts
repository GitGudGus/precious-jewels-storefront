import {
  collectionFragment,
  imageFragment,
  moneyFragment,
  productListItemFragment,
} from '../fragments';

export const getCollectionsQuery = /* GraphQL */ `
  query getCollections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      nodes {
        ...Collection
      }
    }
  }
  ${collectionFragment}
  ${imageFragment}
`;

export const getCollectionQuery = /* GraphQL */ `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      ...Collection
    }
  }
  ${collectionFragment}
  ${imageFragment}
`;

export const getCollectionProductsQuery = /* GraphQL */ `
  query getCollectionProducts(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
      ) {
        nodes {
          ...ProductListItem
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${productListItemFragment}
  ${imageFragment}
  ${moneyFragment}
`;

/** Handles only — for `generateStaticParams`. Paginate with `after`. */
export const getCollectionHandlesQuery = /* GraphQL */ `
  query getCollectionHandles($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
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
