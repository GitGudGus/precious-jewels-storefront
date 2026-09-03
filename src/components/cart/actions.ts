'use server';

import { cookies } from 'next/headers';

import {
  addCartLines,
  CART_COOKIE,
  CART_COOKIE_MAX_AGE,
  createCart,
  getCart,
  removeCartLines,
  updateCartLines,
  type CartMutationResult,
} from '@/lib/shopify';

const EMPTY: CartMutationResult = { cart: null, warnings: [] };

const VARIANT_ID = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const LINE_ID = /^gid:\/\/shopify\/CartLine\//;

async function readCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE)?.value;
}

async function writeCartId(id: string): Promise<void> {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: CART_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
}

async function clearCartId(): Promise<void> {
  (await cookies()).delete(CART_COOKIE);
}

/** Create a fresh cart with one line and persist its id. */
async function startCart(variantId: string): Promise<CartMutationResult> {
  const result = await createCart([{ merchandiseId: variantId, quantity: 1 }]);
  if (result.cart) await writeCartId(result.cart.id);
  return result;
}

/** Hydrate the client cart on mount. No cookie / expired cart → empty. */
export async function getCartAction(): Promise<CartMutationResult> {
  const cartId = await readCartId();
  if (!cartId) return EMPTY;

  const cart = await getCart(cartId);
  if (!cart) {
    await clearCartId();
    return EMPTY;
  }
  return { cart, warnings: [] };
}

export async function addItemAction(
  variantId: string,
): Promise<CartMutationResult> {
  if (!VARIANT_ID.test(variantId)) {
    throw new Error('Invalid variant id');
  }

  const cartId = await readCartId();
  if (!cartId) return startCart(variantId);

  try {
    const result = await addCartLines(cartId, [
      { merchandiseId: variantId, quantity: 1 },
    ]);
    // Stored cart no longer exists — start a new one.
    if (!result.cart) return startCart(variantId);
    return result;
  } catch {
    return startCart(variantId);
  }
}

export async function updateItemAction(input: {
  lineId: string;
  quantity: number;
}): Promise<CartMutationResult> {
  const { lineId, quantity } = input;
  if (!LINE_ID.test(lineId) || !Number.isInteger(quantity) || quantity < 0) {
    throw new Error('Invalid cart line update');
  }

  const cartId = await readCartId();
  if (!cartId) return EMPTY;

  const result =
    quantity === 0
      ? await removeCartLines(cartId, [lineId])
      : await updateCartLines(cartId, [{ id: lineId, quantity }]);

  if (!result.cart) await clearCartId();
  return result;
}

export async function removeItemAction(
  lineId: string,
): Promise<CartMutationResult> {
  if (!LINE_ID.test(lineId)) {
    throw new Error('Invalid cart line id');
  }

  const cartId = await readCartId();
  if (!cartId) return EMPTY;

  const result = await removeCartLines(cartId, [lineId]);
  if (!result.cart) await clearCartId();
  return result;
}
