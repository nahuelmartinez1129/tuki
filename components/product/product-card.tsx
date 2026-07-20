"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/types/product";

const TAG_LABEL: Record<NonNullable<Product["tags"]>[number], string> = {
  nuevo: "Nuevo",
  "top-ventas": "Top ventas",
  picante: "Picante",
  misterioso: "Misterioso",
  recomendado: "Recomendado",
};

interface ProductCardProps {
  product: Product;
  className?: string;
  /** Ancho fijo pensado para carruseles horizontales en mobile */
  fixedWidth?: boolean;
}

export function ProductCard({ product, className, fixedWidth }: ProductCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const hasDiscount =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  function handleAddToCart() {
    addItem(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 900);
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg",
        fixedWidth && "w-[168px] shrink-0 snap-start sm:w-[200px]",
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-tuki-night-soft">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 45vw, 220px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {product.tags?.[0] && (
          <Badge
            variant={product.tags[0] === "misterioso" ? "yellow" : "lime"}
            className="absolute left-2 top-2 shadow-soft"
          >
            {TAG_LABEL[product.tags[0]]}
          </Badge>
        )}

        {hasDiscount && (
          <Badge
            variant="turquoise"
            className="absolute right-2 top-2 shadow-soft"
          >
            Oferta
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-display text-sm font-bold leading-tight text-card-foreground sm:text-base">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                ${product.compareAtPrice}
              </span>
            )}
            <span className="font-display text-base font-extrabold text-tuki-lime sm:text-lg">
              ${product.price}
            </span>
          </div>

          <Button
            size="icon"
            variant="lime"
            onClick={handleAddToCart}
            className={cn(
              "h-9 w-9 shrink-0 rounded-2xl active:scale-90",
              justAdded && "animate-pop"
            )}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {justAdded ? (
              <Check className="h-5 w-5" strokeWidth={3} />
            ) : (
              <Plus className="h-5 w-5" strokeWidth={3} />
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
