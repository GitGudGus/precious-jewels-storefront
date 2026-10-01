'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/Button';

import { DROP_PENDING, UNAVAILABLE_LABEL } from '@/lib/shopify/constants';

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
    <>
      <Button
        variant="primary"
        disabled={disabled}
        onClick={() => variantId && addItem(variantId)}
        className="w-full"
      >
        {!available ? UNAVAILABLE_LABEL : isPending ? 'Adding…' : 'Add to cart'}
      </Button>
      {DROP_PENDING && !available && (
        <Link
          href="/#newsletter"
          className="mt-3 block text-center text-xs text-accent-deep underline"
        >
          Get first access to the drop
        </Link>
      )}
    </>
  );
}
