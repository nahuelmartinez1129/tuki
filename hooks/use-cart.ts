"use client";

import { useContext } from "react";

import { CartContext } from "@/contexts/cart-context";

/**
 * Hook de acceso al carrito. Lanza un error explícito si se usa fuera
 * de `<CartProvider>`, para detectar temprano un mal armado del árbol
 * de componentes en vez de fallar en silencio.
 */
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }

  return context;
}
