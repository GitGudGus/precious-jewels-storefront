import { FREE_SHIPPING_THRESHOLD } from '@/lib/shopify/constants';
import { formatPrice } from '@/lib/shopify/format';
import type { Money } from '@/lib/shopify/types';

export function FreeShippingBar({ subtotal }: { subtotal: Money }) {
  const threshold = Number(FREE_SHIPPING_THRESHOLD.amount);
  const current = Number(subtotal.amount);
  const remaining = Math.max(0, threshold - current);
  const percent = Math.min(
    100,
    threshold > 0 ? (current / threshold) * 100 : 100,
  );

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-neutral-600 dark:text-neutral-300">
        {remaining > 0 ? (
          <>
            You&rsquo;re{' '}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {formatPrice({
                amount: remaining.toFixed(2),
                currencyCode: subtotal.currencyCode,
              })}
            </span>{' '}
            away from free shipping
          </>
        ) : (
          'Your order qualifies for free shipping'
        )}
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-neutral-950 transition-all duration-300 dark:bg-white"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
