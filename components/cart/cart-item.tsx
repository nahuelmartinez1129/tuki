"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import type { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { incrementItem, decrementItem, removeItem } = useCart();

  return (
    <div className="flex gap-3 rounded-2xl bg-white/5 p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-tuki-night-soft">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display text-sm font-bold leading-tight text-tuki-cream truncate">
            {item.name}
          </h4>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            aria-label={`Quitar ${item.name} del carrito`}
            className="shrink-0 text-tuki-cream/40 transition-colors hover:text-destructive active:scale-90"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-display text-sm font-extrabold text-tuki-lime">
            {formatPrice(item.price * item.quantity)}
          </span>

          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
            <button
              type="button"
              onClick={() => decrementItem(item.id)}
              aria-label={`Quitar una unidad de ${item.name}`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-tuki-cream transition-colors hover:bg-white/10 active:scale-90"
            >
              <Minus className="h-3 w-3" strokeWidth={3} />
            </button>
            <span className="w-5 text-center font-display text-xs font-bold text-tuki-cream">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => incrementItem(item.id)}
              aria-label={`Agregar una unidad de ${item.name}`}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-tuki-lime text-tuki-night transition-transform active:scale-90"
            >
              <Plus className="h-3 w-3" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
