import {
  addCartLinesMutation,
  createCartMutation,
  getCartQuery,
  removeCartLinesMutation,
  updateCartLinesMutation,
} from './queries/cart';
import { storefront } from './request';
import { reshapeCart, type RawCart } from './reshape';
import type { Cart, CartMutationResult, CartWarning } from './types';

export type CartLineInput = { merchandiseId: string; quantity: number };
export type CartLineUpdate = { id: string; quantity: number };

type RawMutationPayload = {
  cart: RawCart | null;
  userErrors: { field: string[] | null; message: string }[];
  warnings: CartWarning[] | null;
};

/**
 * Shared handling for every cart mutation: throw on `userErrors` (real
 * failures), pass `warnings` through untouched (Shopify clamped something to
 * available stock but the mutation still applied).
 */
function resolveMutation(payload: RawMutationPayload): CartMutationResult {
  if (payload.userErrors.length > 0) {
    throw new Error(
      `Shopify cart error: ${payload.userErrors.map((e) => e.message).join('; ')}`,
    );
  }
  return {
    cart: payload.cart ? reshapeCart(payload.cart) : null,
    warnings: payload.warnings ?? [],
  };
}

/** Returns `null` if the cart no longer exists (expired / bad id). */
export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await storefront<{ cart: RawCart | null }>(getCartQuery, {
    cartId,
  });
  return data.cart ? reshapeCart(data.cart) : null;
}

export async function createCart(
  lines: CartLineInput[] = [],
): Promise<CartMutationResult> {
  const data = await storefront<{ cartCreate: RawMutationPayload }>(
    createCartMutation,
    { lines },
  );
  return resolveMutation(data.cartCreate);
}

export async function addCartLines(
  cartId: string,
  lines: CartLineInput[],
): Promise<CartMutationResult> {
  const data = await storefront<{ cartLinesAdd: RawMutationPayload }>(
    addCartLinesMutation,
    { cartId, lines },
  );
  return resolveMutation(data.cartLinesAdd);
}

export async function updateCartLines(
  cartId: string,
  lines: CartLineUpdate[],
): Promise<CartMutationResult> {
  const data = await storefront<{ cartLinesUpdate: RawMutationPayload }>(
    updateCartLinesMutation,
    { cartId, lines },
  );
  return resolveMutation(data.cartLinesUpdate);
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
): Promise<CartMutationResult> {
  const data = await storefront<{ cartLinesRemove: RawMutationPayload }>(
    removeCartLinesMutation,
    { cartId, lineIds },
  );
  return resolveMutation(data.cartLinesRemove);
}
