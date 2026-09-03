/**
 * Shared GraphQL fragments. Compose these into query strings in `queries/*`.
 * Keep the selection sets here in sync with the raw types in `reshape.ts`.
 */

export const imageFragment = /* GraphQL */ `
  fragment Image on Image {
    url
    altText
    width
    height
  }
`;

export const moneyFragment = /* GraphQL */ `
  fragment Money on MoneyV2 {
    amount
    currencyCode
  }
`;

/** Everything `ProductCard` needs and nothing more. */
export const productListItemFragment = /* GraphQL */ `
  fragment ProductListItem on Product {
    handle
    title
    availableForSale
    featuredImage {
      ...Image
    }
    priceRange {
      minVariantPrice {
        ...Money
      }
      maxVariantPrice {
        ...Money
      }
    }
  }
`;

/** Full product for the detail page. Metafield keys are namespaced `custom.*`. */
export const productFragment = /* GraphQL */ `
  fragment Product on Product {
    ...ProductListItem
    id
    descriptionHtml
    updatedAt
    seo {
      title
      description
    }
    options {
      id
      name
      optionValues {
        name
      }
    }
    images(first: 20) {
      nodes {
        ...Image
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        price {
          ...Money
        }
        selectedOptions {
          name
          value
        }
        image {
          ...Image
        }
      }
    }
    metafields(
      identifiers: [
        { namespace: "custom", key: "materials" }
        { namespace: "custom", key: "care" }
        { namespace: "custom", key: "sizing" }
      ]
    ) {
      key
      value
    }
  }
`;

export const collectionFragment = /* GraphQL */ `
  fragment Collection on Collection {
    id
    handle
    title
    descriptionHtml
    image {
      ...Image
    }
  }
`;

export const cartFragment = /* GraphQL */ `
  fragment Cart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            ...Money
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            price {
              ...Money
            }
            image {
              ...Image
            }
            selectedOptions {
              name
              value
            }
            product {
              handle
              title
            }
          }
        }
      }
    }
  }
`;
