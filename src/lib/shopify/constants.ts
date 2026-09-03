import type { Money } from './types';

/**
 * Free-shipping threshold shown in the cart drawer's progress bar. Hardcoded —
 * the public Storefront token can't read the shop's real shipping rules. Matches
 * the announcement-bar copy ("FREE SHIPPING ON ORDERS OVER $100").
 */
export const FREE_SHIPPING_THRESHOLD: Money = {
  amount: '100.0',
  currencyCode: 'USD',
};

/** Cookie holding the Shopify cart id (see `src/components/cart/actions.ts`). */
export const CART_COOKIE = 'pj_cart';

/** ~14 days, in seconds. Shopify keeps abandoned carts around ~10 days. */
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;
