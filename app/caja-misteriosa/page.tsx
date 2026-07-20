"use client";

import { useState } from "react";
import { Gift } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import {
  MYSTERY_BOX_OPTIONS,
  MYSTERY_BOX_POSSIBLE_ITEMS,
} from "@/lib/data/rewards";

export default function CajaMisteriosaPage() {
  const { addItem } = useCart();
  const [selectedId, setSelectedId] = useState(MYSTERY_BOX_OPTIONS[1].id);

  const selected = MYSTERY_BOX_OPTIONS.find((o) => o.id === selectedId)!;

  function handleAdd() {
    addItem({
      id: `caja-misteriosa-${selected.id}`,
      name: `Caja Misteriosa ${selected.size}`,
      description: selected.description,
      price: selected.price,
      image:
        "https://images.unsplash.com/photo-1607920591413-4ec007e70023?q=80&w=800&auto=format&fit=crop",
    });
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden bg-tuki-night bg-night-texture pb-20 pt-12">
        <div className="container flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-tuki-yellow shadow-glow">
            <Gift className="h-8 w-8 text-tuki-night" strokeWidth={2.5} />
          </span>

          <h1 className="mt-5 font-display text-3xl font-extrabold text-tuki-cream sm:text-4xl">
            🎁 CAJA MISTERIOSA
          </h1>
          <p className="mt-1 font-display text-sm font-bold text-tuki-lime">
            La noche eligió por vos.
          </p>
          <p className="mt-3 max-w-sm text-sm text-tuki-cream/70">
            No sabemos qué vas a recibir. Solo sabemos que va a ser rico.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {MYSTERY_BOX_POSSIBLE_ITEMS.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>

          <div className="mt-8 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
            {MYSTERY_BOX_OPTIONS.map((option) => {
              const isSelected = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedId(option.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-3xl p-5 text-left shadow-soft ring-1 transition-all",
                    isSelected
                      ? "bg-tuki-lime/10 ring-2 ring-tuki-lime"
                      : "bg-tuki-night-soft ring-white/5 hover:ring-white/20"
                  )}
                >
                  <span className="font-display text-sm font-bold text-tuki-cream">
                    {option.size}
                  </span>
                  <span className="font-display text-2xl font-extrabold text-tuki-lime">
                    {formatPrice(option.price)}
                  </span>
                  <span className="text-xs text-tuki-cream/50">
                    {option.itemsRange}
                  </span>
                  <span className="mt-1 text-xs text-tuki-cream/60">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-8 max-w-xs text-xs text-tuki-cream/50 sm:max-w-sm">
            El contenido se revela cuando llega a tu casa.
          </p>

          <Button size="lg" variant="yellow" onClick={handleAdd} className="mt-6">
            <Gift className="h-5 w-5" strokeWidth={2.5} />
            QUIERO SORPRENDERME
          </Button>
        </div>
      </main>
      <Footer />
     
    </>
  );
}
