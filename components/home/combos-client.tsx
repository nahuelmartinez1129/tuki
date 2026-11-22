"use client";

import Image from "next/image";
import { Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/types/product";

export function CombosClient({ combos }: { combos: Product[] }) {
  const { addItem } = useCart();

  return (
    <section id="combos" className="bg-tuki-night-soft py-14">
      <div className="container">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-tuki-yellow" />
          <h2 className="font-display text-2xl font-extrabold text-tuki-cream sm:text-3xl">
            Combos que rinden
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo) => {
            const agotado = (combo.stock ?? 0) <= 0;
            const ahorro =
              combo.compareAtPrice && combo.compareAtPrice > combo.price
                ? combo.compareAtPrice - combo.price
                : 0;
            const etiqueta = combo.tags?.[0];

            return (
              <article
                key={combo.id}
                className={`group flex gap-4 rounded-3xl bg-tuki-night p-4 shadow-soft ring-1 ring-white/5 transition-all hover:-translate-y-1 hover:shadow-soft-lg ${
                  agotado ? "opacity-60" : ""
                }`}
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-tuki-night-soft sm:h-28 sm:w-28">
                  <Image
                    src={combo.image}
                    alt={combo.name}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold leading-tight text-tuki-cream">
                      {combo.name}
                    </h3>
                    {agotado ? (
                      <Badge variant="turquoise" className="shrink-0">
                        Agotado
                      </Badge>
                    ) : (
                      (etiqueta === "top-ventas" || etiqueta === "nuevo") && (
                        <Badge variant="turquoise" className="shrink-0">
                          {etiqueta === "top-ventas" ? "Top" : "Nuevo"}
                        </Badge>
                      )
                    )}
                  </div>

                  <p className="mt-1 text-xs text-tuki-cream/60 sm:text-sm">
                    {combo.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex flex-col">
                      {ahorro > 0 && (
                        <span className="text-xs text-tuki-cream/40 line-through">
                          ${combo.compareAtPrice}
                        </span>
                      )}
                      <span className="font-display text-lg font-extrabold text-tuki-lime">
                        ${combo.price}
                      </span>
                      {ahorro > 0 && (
                        <span className="text-xs font-semibold text-tuki-yellow">
                          Ahorrás ${ahorro}
                        </span>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="lime"
                      disabled={agotado}
                      onClick={() => addItem(combo)}
                      className="h-9 w-9 rounded-2xl active:scale-90"
                      aria-label={`Agregar ${combo.name} al carrito`}
                    >
                      <Plus className="h-5 w-5" strokeWidth={3} />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
