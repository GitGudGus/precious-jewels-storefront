import {
  imageFragment,
  moneyFragment,
  productFragment,
  productListItemFragment,
} from '../fragments';

export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${productFragment}
  ${productListItemFragment}
  ${imageFragment}
  ${moneyFragment}
`;

export const getProductsQuery = /* GraphQL */ `
  query getProducts(
    $first: Int!
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) {
    products(
      first: $first
      sortKey: $sortKey
      reverse: $reverse
      query: $query
    ) {
      nodes {
        ...ProductListItem
      }
    }
  }
  ${productListItemFragment}
  ${imageFragment}
  ${moneyFragment}
`;

/** Handles only — for `generateStaticParams`. Paginate with `after`. */
export const getProductHandlesQuery = /* GraphQL */ `
  query getProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
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
