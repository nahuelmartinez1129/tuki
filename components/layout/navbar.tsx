"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

const NAV_LINKS = [
  { label: "Menú", href: "#destacados" },
  { label: "Combos", href: "#combos" },
  { label: "Caja Misteriosa", href: "#noche" },
] as const;

export function Navbar() {
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-tuki-night/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
       <Link href="/" className="flex items-center">
  <Image
    src="/logo.png"
    alt="Tuki"
    width={260}
    height={100}
    priority
    className="h-20 w-auto"
  />
</Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-sm font-semibold text-tuki-cream/80 transition-colors hover:text-tuki-lime"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 sm:flex">
            
            <Link href="/ruleta" className="font-display text-xs font-semibold text-tuki-cream/90"> 
             🎡 Girar Ruleta
            </Link>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={openCart}
            className="relative rounded-2xl border border-white/10"
            aria-label="Ver carrito"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-tuki-lime text-[10px] font-bold text-tuki-night">
              {totalItems}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
