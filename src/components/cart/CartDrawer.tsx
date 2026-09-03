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
    <div className="inline-flex items-center rounded-pill border border-line text-sm">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled}
        onClick={() => onChange(line.quantity - 1)}
        className="px-3 py-1 disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-6 text-center tabular-nums">{line.quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(line.quantity + 1)}
        className="px-3 py-1 disabled:opacity-40"
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
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        aria-label="Cart"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-line bg-bg transition-transform duration-300 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-lg tracking-[0.14em] uppercase">
            Cart{cart?.totalQuantity ? ` (${cart.totalQuantity})` : ''}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            ✕
          </button>
        </header>

        {warnings.length > 0 && (
          <div className="border-b border-line bg-surface px-6 py-3 text-xs text-ink-muted">
            {warnings.map((warning) => (
              <p key={`${warning.target}:${warning.code}`}>{warning.message}</p>
            ))}
          </div>
        )}

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="text-sm text-ink-muted">Your cart is empty.</p>
            <Link
              href="/collections"
              onClick={closeDrawer}
              className="border border-ink px-6 py-2.5 text-xs tracking-[0.15em] uppercase transition-colors hover:bg-ink hover:text-ink-invert"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <ul
              className={`flex-1 divide-y divide-line overflow-y-auto px-6 ${
                isPending ? 'opacity-60' : ''
              }`}
            >
              {lines.map((line) => {
                const { merchandise } = line;
                const showVariant =
                  merchandise.variantTitle &&
                  merchandise.variantTitle !== 'Default Title';
                return (
                  <li key={line.id} className="flex gap-4 py-5">
                    <Link
                      href={`/products/${merchandise.productHandle}`}
                      onClick={closeDrawer}
                      className="relative h-24 w-20 shrink-0 overflow-hidden bg-surface"
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

                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex justify-between gap-3 text-sm">
                        <Link
                          href={`/products/${merchandise.productHandle}`}
                          onClick={closeDrawer}
                          className="hover:underline"
                        >
                          {merchandise.productTitle}
                        </Link>
                        <Price
                          min={line.cost.totalAmount}
                          className="shrink-0 text-ink-muted"
                        />
                      </div>
                      {showVariant && (
                        <p className="text-xs text-ink-muted">
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
                          className="text-xs text-ink-muted underline transition-colors hover:text-ink disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="space-y-4 border-t border-line px-6 py-5">
              {cart && <FreeShippingBar subtotal={cart.cost.subtotalAmount} />}
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Subtotal</span>
                <span>{cart && formatPrice(cart.cost.subtotalAmount)}</span>
              </div>
              <p className="text-xs text-ink-muted">
                Shipping and taxes calculated at checkout.
              </p>
              <a
                href={cart?.checkoutUrl}
                className="block w-full bg-ink px-6 py-3.5 text-center text-xs tracking-[0.15em] text-ink-invert uppercase transition-colors hover:bg-ink/85"
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
