"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { AddableProduct, CartItem } from "@/types/cart";

const STORAGE_KEY = "tuki-cart";

export interface CartToast {
  id: string;
  message: string;
}

export interface CartContextValue {
  /** Productos actualmente en el carrito. */
  items: CartItem[];
  /** Suma de las cantidades de todos los productos. */
  totalItems: number;
  /** Suma de price * quantity de todos los productos. */
  subtotal: number;
  /** Estado de apertura del cart drawer (sidebar). */
  isOpen: boolean;
  /** Cola de toasts pendientes de mostrar (microfeedback). */
  toasts: CartToast[];

  addItem: (product: AddableProduct, quantity?: number) => void;
  removeItem: (id: string) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  clearCart: () => void;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  dismissToast: (id: string) => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

function readInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<CartToast[]>([]);
  const hasHydrated = useRef(false);

  // Hidratar desde localStorage una sola vez, en cliente.
  useEffect(() => {
    setItems(readInitialCart());
    hasHydrated.current = true;
  }, []);

  // Persistir cada cambio (después de la hidratación inicial).
  useEffect(() => {
    if (!hasHydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage puede fallar (modo privado, cuota, etc). No es crítico.
    }
  }, [items]);

  const pushToast = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addItem = useCallback(
    (product: AddableProduct, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
       if (existing) {
  if (
    existing.quantity +
      quantity >
    (product.stock ?? 999)
  ) {
    pushToast(
      `Solo quedan ${product.stock} unidades de ${product.name}`
    );

    return prev;
  }

  return prev.map((item) =>
    item.id === product.id
      ? {
          ...item,
          quantity:
            item.quantity +
            quantity,
        }
      : item
  );
}
        return [
          ...prev,
         {
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  image: product.image,
  stock: product.stock ?? 0,
  quantity,
},
        ];
      });
      pushToast(`¡${product.name} agregado!`);
    },
    [pushToast]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const incrementItem =
  useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id)
          return item;

        if (
          item.quantity >=
          (item.stock ?? 999)
        ) {
          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity + 1,
        };
      })
    );
  }, []);

  const decrementItem = useCallback((id: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const { totalItems, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + item.quantity,
        subtotal: acc.subtotal + item.price * item.quantity,
      }),
      { totalItems: 0, subtotal: 0 }
    );
  }, [items]);

  const value: CartContextValue = {
    items,
    totalItems,
    subtotal,
    isOpen,
    toasts,
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    dismissToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
