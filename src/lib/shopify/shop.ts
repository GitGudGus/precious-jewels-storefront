import { getShopNameQuery } from './queries/shop';
import { storefront } from './request';

type GetShopNameResponse = {
  shop: {
    name: string;
  };
};

export async function getShopName(): Promise<string> {
  const data = await storefront<GetShopNameResponse>(getShopNameQuery);
  return data.shop.name;
}
