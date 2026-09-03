'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from 'react';

import type { Cart, CartMutationResult, CartWarning } from '@/lib/shopify';

import {
  addItemAction,
  getCartAction,
  removeItemAction,
  updateItemAction,
} from './actions';

type CartContextValue = {
  cart: Cart | null;
  warnings: CartWarning[];
  /** A cart mutation (or the initial hydration) is in flight. */
  isPending: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (variantId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const GENERIC_WARNING: CartWarning = {
  code: 'ERROR',
  message: 'Something went wrong updating your cart. Please try again.',
  target: '',
};

/**
 * Client-side cart state. The cart lives in a cookie server-side; this provider
 * hydrates it on mount via a server action so `layout.tsx` can stay statically
 * rendered (reading the cookie in the layout would make every route dynamic).
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [warnings, setWarnings] = useState<CartWarning[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getCartAction();
      setCart(result.cart);
    });
  }, []);

  const runMutation = useCallback(
    (action: () => Promise<CartMutationResult>) => {
      setWarnings([]);
      startTransition(async () => {
        try {
          const result = await action();
          setCart(result.cart);
          setWarnings(result.warnings);
        } catch (error) {
          console.error(error);
          setWarnings([GENERIC_WARNING]);
        }
      });
    },
    [],
  );

  const addItem = useCallback(
    (variantId: string) => {
      setDrawerOpen(true);
      runMutation(() => addItemAction(variantId));
    },
    [runMutation],
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => {
      runMutation(() => updateItemAction({ lineId, quantity }));
    },
    [runMutation],
  );

  const removeItem = useCallback(
    (lineId: string) => {
      runMutation(() => removeItemAction(lineId));
    },
    [runMutation],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      warnings,
      isPending,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem,
      updateQuantity,
      removeItem,
    }),
    [
      cart,
      warnings,
      isPending,
      isDrawerOpen,
      addItem,
      updateQuantity,
      removeItem,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within <CartProvider>');
  }
  return context;
}
