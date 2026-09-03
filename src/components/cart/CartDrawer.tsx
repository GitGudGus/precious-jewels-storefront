'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { Price } from '@/components/Price';
import { formatPrice } from '@/lib/shopify/format';
import type { CartLine } from '@/lib/shopify/types';

import { useCart } from './CartProvider';
import { FreeShippingBar } from './FreeShippingBar';

function QuantityStepper({
  line,
  disabled,
  onChange,
}: {
  line: CartLine;
  disabled: boolean;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-neutral-300 text-sm dark:border-neutral-700">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled}
        onClick={() => onChange(line.quantity - 1)}
        className="px-2.5 py-1 disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-6 text-center tabular-nums">{line.quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(line.quantity + 1)}
        className="px-2.5 py-1 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

export function CartDrawer() {
  const {
    cart,
    warnings,
    isPending,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, closeDrawer]);

  const lines = cart?.lines ?? [];

  return (
    <div
      className={`fixed inset-0 z-50 ${isDrawerOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isDrawerOpen}
    >
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        aria-label="Cart"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 dark:bg-neutral-950 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="text-sm font-medium tracking-wide uppercase">
            Cart{cart?.totalQuantity ? ` (${cart.totalQuantity})` : ''}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            ✕
          </button>
        </header>

        {warnings.length > 0 && (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            {warnings.map((warning) => (
              <p key={`${warning.target}:${warning.code}`}>{warning.message}</p>
            ))}
          </div>
        )}

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-neutral-500">Your cart is empty.</p>
            <Link
              href="/collections"
              onClick={closeDrawer}
              className="rounded-full border border-neutral-300 px-5 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <ul
              className={`flex-1 divide-y divide-neutral-200 overflow-y-auto px-5 dark:divide-neutral-800 ${
                isPending ? 'opacity-60' : ''
              }`}
            >
              {lines.map((line) => {
                const { merchandise } = line;
                const showVariant =
                  merchandise.variantTitle &&
                  merchandise.variantTitle !== 'Default Title';
                return (
                  <li key={line.id} className="flex gap-4 py-4">
                    <Link
                      href={`/products/${merchandise.productHandle}`}
                      onClick={closeDrawer}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900"
                    >
                      {merchandise.image && (
                        <Image
                          src={merchandise.image.url}
                          alt={
                            merchandise.image.altText ??
                            merchandise.productTitle
                          }
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="flex justify-between gap-3 text-sm">
                        <Link
                          href={`/products/${merchandise.productHandle}`}
                          onClick={closeDrawer}
                          className="font-medium hover:underline"
                        >
                          {merchandise.productTitle}
                        </Link>
                        <Price
                          min={line.cost.totalAmount}
                          className="shrink-0 text-neutral-600 dark:text-neutral-300"
                        />
                      </div>
                      {showVariant && (
                        <p className="text-xs text-neutral-500">
                          {merchandise.variantTitle}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <QuantityStepper
                          line={line}
                          disabled={isPending}
                          onChange={(quantity) =>
                            updateQuantity(line.id, quantity)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(line.id)}
                          disabled={isPending}
                          className="text-xs text-neutral-500 underline hover:text-neutral-900 disabled:opacity-40 dark:hover:text-neutral-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="space-y-4 border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
              {cart && <FreeShippingBar subtotal={cart.cost.subtotalAmount} />}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium">
                  {cart && formatPrice(cart.cost.subtotalAmount)}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Shipping and taxes calculated at checkout.
              </p>
              <a
                href={cart?.checkoutUrl}
                className="block w-full rounded-full bg-neutral-950 px-6 py-3 text-center text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-neutral-950"
              >
                Checkout
              </a>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
