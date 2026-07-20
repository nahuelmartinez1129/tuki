import Link from "next/link";
import { Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { MYSTERY_BOX_OPTIONS } from "@/lib/data/rewards";

export function MysteryBoxSection() {
  return (
    <section
      id="caja-misteriosa-preview"
      className="relative overflow-hidden bg-tuki-night-soft py-16"
    >
      <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-tuki-lime/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-tuki-yellow/10 blur-3xl" />

      <div className="container relative flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tuki-yellow shadow-glow">
          <Gift className="h-7 w-7 text-tuki-night" strokeWidth={2.5} />
        </span>

        <h2 className="mt-4 font-display text-2xl font-extrabold text-tuki-cream sm:text-3xl">
          🎁 CAJA MISTERIOSA
        </h2>
        <p className="mt-1 font-display text-sm font-bold text-tuki-lime sm:text-base">
          La noche eligió por vos.
        </p>
        <p className="mt-3 max-w-sm text-sm text-tuki-cream/70">
          No sabemos qué vas a recibir. Solo sabemos que va a ser rico.
        </p>

        <div className="mt-8 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          {MYSTERY_BOX_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="flex flex-col items-center gap-1 rounded-3xl bg-tuki-night p-5 shadow-soft ring-1 ring-white/5"
            >
              <span className="font-display text-sm font-bold text-tuki-cream">
                {option.size}
              </span>
              <span className="font-display text-xl font-extrabold text-tuki-lime">
                {formatPrice(option.price)}
              </span>
              <span className="text-xs text-tuki-cream/50">
                {option.itemsRange}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-xs text-xs text-tuki-cream/50 sm:max-w-sm">
          El contenido se revela cuando llega a tu casa.
        </p>

        <Button size="lg" variant="yellow" asChild className="mt-6">
          <Link href="/caja-misteriosa">
            <Gift className="h-5 w-5" strokeWidth={2.5} />
            QUIERO SORPRENDERME
          </Link>
        </Button>
      </div>
    </section>
  );
}
