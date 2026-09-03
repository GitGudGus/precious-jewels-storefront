import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-40" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
