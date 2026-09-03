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

/**
 * Customer-facing contact address (the store's main inbox — a branded address is
 * planned later). Department pages still route to `returns@` / `wholesale@`.
 */
export const CONTACT_EMAIL = 'preciousjewelsmia@gmail.com';

/** Shopify page handle for the contact page (gets a mailto CTA on its route). */
export const CONTACT_PAGE_HANDLE = 'contact-us-1';

/**
 * Canonical site origin — the M5 production domain. Used for `metadataBase`,
 * `sitemap`, and JSON-LD. Correct once `preciousjewels.co` is cut over to Vercel
 * (Milestone 5); until then OG/canonical URLs point at the eventual home.
 */
export const SITE_URL = 'https://preciousjewels.co';
