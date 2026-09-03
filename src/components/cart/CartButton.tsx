'use client';

import { useCart } from './CartProvider';

export function CartButton() {
  const { cart, openDrawer } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      className="relative text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-950 px-1 text-[10px] leading-none font-medium text-white dark:bg-white dark:text-neutral-950">
          {count}
        </span>
      )}
    </button>
  );
}
