import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!storeDomain || !storefrontAccessToken) {
  throw new Error(
    'Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variables. See .env.example.',
  );
}

export const shopifyClient = createStorefrontApiClient({
  storeDomain,
  publicAccessToken: storefrontAccessToken,
  apiVersion: '2025-10',
});
