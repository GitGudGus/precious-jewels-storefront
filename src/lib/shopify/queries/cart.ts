import { cartFragment, imageFragment, moneyFragment } from '../fragments';

const CART_FRAGMENTS = `
  ${cartFragment}
  ${imageFragment}
  ${moneyFragment}
`;

/** Every mutation returns the same shape: the cart, hard errors, soft warnings. */
const MUTATION_PAYLOAD = `
    cart {
      ...Cart
    }
    userErrors {
      field
      message
    }
    warnings {
      code
      message
      target
    }
`;

export const getCartQuery = /* GraphQL */ `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...Cart
    }
  }
  ${CART_FRAGMENTS}
`;

export const createCartMutation = /* GraphQL */ `
  mutation createCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      ${MUTATION_PAYLOAD}
    }
  }
  ${CART_FRAGMENTS}
`;

export const addCartLinesMutation = /* GraphQL */ `
  mutation addCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      ${MUTATION_PAYLOAD}
    }
  }
  ${CART_FRAGMENTS}
`;

export const updateCartLinesMutation = /* GraphQL */ `
  mutation updateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      ${MUTATION_PAYLOAD}
    }
  }
  ${CART_FRAGMENTS}
`;

export const removeCartLinesMutation = /* GraphQL */ `
  mutation removeCartLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      ${MUTATION_PAYLOAD}
    }
  }
  ${CART_FRAGMENTS}
`;
