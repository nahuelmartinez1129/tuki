"use client";

import { ShoppingBag } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";

export function CartButton() {
  const { totalItems, subtotal, openCart, isOpen } = useCart();
  const isEmpty = totalItems === 0;

  // Oculto cuando el carrito está vacío o cuando el drawer ya está abierto,
  // para no duplicar la entrada al mismo panel.
  if (isEmpty || isOpen) return null;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Ver carrito, ${totalItems} productos, subtotal ${formatPrice(
        subtotal
      )}`}
      className="animate-in fade-in zoom-in-75 slide-in-from-bottom-2 fixed bottom-5 left-5 z-40 flex items-center gap-3 rounded-2xl bg-tuki-lime px-4 py-3 text-tuki-night shadow-soft-lg transition-transform duration-200 hover:scale-105 active:scale-95 sm:bottom-6 sm:left-6"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-tuki-night/10">
        <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-tuki-night text-[11px] font-bold text-tuki-lime">
          {totalItems}
        </span>
      </span>
      <span className="font-display text-sm font-extrabold leading-tight">
        {formatPrice(subtotal)}
      </span>
    </button>
  );
}
