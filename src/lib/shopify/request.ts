import { getShopifyClient } from './client';

/**
 * Run a Storefront API operation and return its `data`.
 *
 * Throws on a transport/GraphQL error or a missing `data` payload rather than
 * letting `undefined` leak out — the same contract the first `getShopName()`
 * query established. Operations that need "not found means null" (e.g. lookups by
 * handle) still get a `data` object back and check the specific field themselves.
 */
export async function storefront<T>(
  operation: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const { data, errors } = await getShopifyClient().request<T>(operation, {
    variables,
  });

  if (errors) {
    throw new Error(
      `Shopify Storefront API error: ${errors.message ?? 'unknown error'}`,
    );
  }

  if (!data) {
    throw new Error('Shopify Storefront API returned no data.');
  }

  return data;
}
