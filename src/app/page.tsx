import { getShopName } from '@/lib/shopify/shop';

export default async function Home() {
  const shopName = await getShopName();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-2 px-6 text-center">
        <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Connected to Shopify
        </p>
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          {shopName}
        </h1>
      </main>
    </div>
  );
}
