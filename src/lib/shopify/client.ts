// Build-time guard: if this module ever reaches a client bundle again (e.g. via a
// barrel re-export imported from a Client Component), the build fails here
// instead of shipping a broken site. See CLAUDE.md, "M2 (cart) gotchas".
import 'server-only';
import {
  createStorefrontApiClient,
  type StorefrontApiClient,
} from '@shopify/storefront-api-client';

let client: StorefrontApiClient | undefined;

/**
 * The Shopify Storefront API client, created on first use.
 *
 * Deliberately lazy: this module can end up in a client bundle via a barrel
 * re-export, and a top-level `throw` (or client construction) there would crash
 * the browser. Nothing client-side ever calls this — `request.ts` is the only
 * caller, and only from server code — so the missing-env error still surfaces
 * clean at build/render time, just not at module evaluation.
 */
export function getShopifyClient(): StorefrontApiClient {
  if (client) return client;

  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!storeDomain || !storefrontAccessToken) {
    throw new Error(
      'Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variables. See .env.example.',
    );
  }

  client = createStorefrontApiClient({
    storeDomain,
    publicAccessToken: storefrontAccessToken,
    apiVersion: '2025-10',
  });
  return client;
}
