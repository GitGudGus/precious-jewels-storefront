import { Skeleton } from '@/components/Skeleton';
import { Section } from '@/components/ui/Section';

export default function Loading() {
  return (
    <Section tone="bg" innerClassName="space-y-10">
      <Skeleton className="mx-auto h-9 w-48" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-4/5 w-full" />
        ))}
      </div>
    </Section>
  );
}
