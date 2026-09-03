import Image from 'next/image';
import Link from 'next/link';

import { formatDate } from '@/lib/date';
import type { ArticleListItem } from '@/lib/shopify/types';

const CARD_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';

export function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link href={`/journal/${article.handle}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {article.image && (
          <Image
            src={article.image.url}
            alt={article.image.altText ?? article.title}
            fill
            sizes={CARD_SIZES}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="mt-4 space-y-1.5">
        <p className="text-[11px] tracking-[0.16em] text-ink-muted uppercase">
          {formatDate(article.publishedAt)}
        </p>
        <h3 className="font-serif text-lg">{article.title}</h3>
        {article.excerpt && (
          <p className="line-clamp-2 text-sm text-ink-muted">
            {article.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
