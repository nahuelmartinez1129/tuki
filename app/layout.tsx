import type { Metadata, Viewport } from "next";

import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import AnonymousUserProvider from "@/components/AnonymousUserProvider";
import { CartManager } from "@/components/cart/cart-manager";

export const metadata: Metadata = {
  title: "TUKI — Delivery nocturno de golosinas y antojos",
  description:
    "¿Pintó algo dulce? La noche pide Tuki. Pedí alfajores, gomitas, chocolates y combos, con envío nocturno y recompensas en cada pedido.",
};

export const viewport: Viewport = {
  themeColor: "#0B1F1E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          {children}
          <CartManager />
        </CartProvider>
        <AnonymousUserProvider />
      </body>
    </html>
  );
}
