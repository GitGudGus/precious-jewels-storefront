import type { Money } from './types';

/**
 * Format a Shopify `Money` value for display. Shopify returns `amount` as a
 * decimal string (e.g. `"15.0"`); keep it a string until here and never do float
 * math on prices.
 */
export function formatPrice(money: Money, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode,
  }).format(Number(money.amount));
}

/**
 * Format a price range. Collapses to a single value when min === max, otherwise
 * renders `"$X – $Y"`.
 */
export function formatPriceRange(
  min: Money,
  max: Money,
  locale = 'en-US',
): string {
  if (min.amount === max.amount && min.currencyCode === max.currencyCode) {
    return formatPrice(min, locale);
  }
  return `${formatPrice(min, locale)} – ${formatPrice(max, locale)}`;
}
