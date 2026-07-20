"use client";

import { usePathname } from "next/navigation";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartButton } from "@/components/cart/cart-button";
import { CartToast } from "@/components/cart/cart-toast";

export function CartManager() {
  const pathname = usePathname();

  const hideCart =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/admin");

  if (hideCart) {
    return null;
  }

  return (
    <>
      <CartDrawer />
      <CartButton />
      <CartToast />
    </>
  );
}