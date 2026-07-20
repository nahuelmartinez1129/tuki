"use client";

import Link from "next/link";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/cart/cart-item";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, clearCart } = useCart();
  const isEmpty = items.length === 0;

  const [showClosedModal, setShowClosedModal] =
  useState(false);

const router = useRouter();

  const [abierto, setAbierto] =
  useState(true);

useEffect(() => {
  async function load() {
    const response =
      await fetch(
        "/api/configuracion"
      );

    const data =
      await response.json();

    setAbierto(data.abierto);
  }

  load();
}, []);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-tuki-night/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col bg-tuki-night-soft shadow-soft-lg ring-1 ring-white/5 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-tuki-lime" />
            <h2 className="font-display text-lg font-extrabold text-tuki-cream">
              Tu pedido
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {!isEmpty && (
              <button
                type="button"
                onClick={clearCart}
                aria-label="Vaciar carrito"
                className="flex h-9 w-9 items-center justify-center rounded-2xl text-tuki-cream/50 transition-colors hover:bg-white/5 hover:text-destructive active:scale-90"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={closeCart}
              aria-label="Cerrar carrito"
              className="flex h-9 w-9 items-center justify-center rounded-2xl text-tuki-cream/70 transition-colors hover:bg-white/5 active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Lista de items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <ShoppingBag className="h-7 w-7 text-tuki-cream/30" />
              </span>
              <p className="font-display text-sm font-bold text-tuki-cream/80">
                Todavía no agregaste nada
              </p>
              <p className="text-xs text-tuki-cream/50">
                Elegí tus antojos favoritos y volvé por acá.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer: subtotal + acciones */}
        <div className="border-t border-white/5 px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-display text-sm font-semibold text-tuki-cream/70">
              Subtotal
            </span>
            <span className="font-display text-xl font-extrabold text-tuki-lime">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
 <Button
  variant="lime"
  size="lg"
  className="w-full"
  disabled={isEmpty}
  onClick={async () => {
    closeCart();

    const response =
      await fetch(
        "/api/configuracion"
      );

    const data =
      await response.json();

    if (!data.abierto) {
      setShowClosedModal(
        true
      );

      return;
    }

    router.push(
      "/checkout"
    );
  }}
>
  Finalizar pedido
</Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={closeCart}
            >
              Seguir comprando
            </Button>
          </div>
        </div>
      </aside>

      {showClosedModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="mx-4 w-full max-w-md rounded-3xl bg-tuki-night-soft p-8 text-center shadow-soft-lg ring-1 ring-white/10">
      <div className="text-6xl">
        🌙
      </div>

      <h2 className="mt-4 font-display text-3xl font-extrabold text-tuki-cream">
        TUKI está descansando
      </h2>

      <p className="mt-4 text-tuki-cream/70">
        Nuestro equipo se fue a recargar energías.
      </p>

      <p className="mt-2 text-tuki-cream/50">
        Volvemos pronto para seguir llevándote tus
        antojos favoritos.
      </p>

      <Button
        variant="lime"
        size="lg"
        className="mt-8 w-full"
        onClick={() => {
          setShowClosedModal(false);
          router.push("/");
        }}
      >
        Volver al inicio
      </Button>
    </div>
  </div>
)}
    </>
  );
}
