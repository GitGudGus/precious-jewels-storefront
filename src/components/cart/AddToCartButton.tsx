'use client';

import { useCart } from './CartProvider';

export function AddToCartButton({
  variantId,
  available,
}: {
  variantId: string | undefined;
  available: boolean;
}) {
  const { addItem, isPending } = useCart();
  const disabled = !variantId || !available || isPending;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => variantId && addItem(variantId)}
      className="w-full rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-950"
    >
      {!available ? 'Sold out' : isPending ? 'Adding…' : 'Add to cart'}
    </button>
  );
}
