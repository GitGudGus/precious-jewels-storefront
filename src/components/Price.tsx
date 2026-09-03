import { formatPrice, formatPriceRange, type Money } from '@/lib/shopify';

type PriceProps = {
  min: Money;
  /** When provided and different from `min`, renders a range. */
  max?: Money;
  className?: string;
};

export function Price({ min, max, className }: PriceProps) {
  const text = max ? formatPriceRange(min, max) : formatPrice(min);
  return <span className={className}>{text}</span>;
}
