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
    <div className="space-y-2">
      <p className="text-xs text-ink-muted">
        {remaining > 0 ? (
          <>
            You&rsquo;re{' '}
            <span className="text-ink">
              {formatPrice({
                amount: remaining.toFixed(2),
                currencyCode: subtotal.currencyCode,
              })}
            </span>{' '}
            from free shipping
          </>
        ) : (
          'Your order qualifies for free shipping'
        )}
      </p>
      <div className="h-0.5 w-full bg-line">
        <div
          className="h-full bg-ink transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
