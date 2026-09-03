import { shopifyClient } from '@/lib/shopify/client';
import { getShopNameQuery } from '@/lib/shopify/queries/shop';

type GetShopNameResponse = {
  shop: {
    name: string;
  };
};

export async function getShopName(): Promise<string> {
  const { data, errors } =
    await shopifyClient.request<GetShopNameResponse>(getShopNameQuery);

  if (errors) {
    throw new Error(`Shopify Storefront API error: ${errors.message}`);
  }

  if (!data) {
    throw new Error('Shopify Storefront API returned no data.');
  }

  return data.shop.name;
}
