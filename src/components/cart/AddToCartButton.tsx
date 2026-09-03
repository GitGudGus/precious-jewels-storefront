'use client';

import { Button } from '@/components/ui/Button';

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
    <Button
      variant="primary"
      disabled={disabled}
      onClick={() => variantId && addItem(variantId)}
      className="w-full"
    >
      {!available ? 'Sold out' : isPending ? 'Adding…' : 'Add to cart'}
    </Button>
  );
}
