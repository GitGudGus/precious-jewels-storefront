import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/Skeleton';
import type { ProductListItem } from '@/lib/shopify';

const GRID_CLASS =
  'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4';

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  return (
    <ul className={GRID_CLASS}>
      {products.map((product) => (
        <li key={product.handle}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID_CLASS}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="mt-3 flex justify-between gap-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
