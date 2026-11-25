"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { textoHappyHour } from "@/lib/promociones";

type HappyHour = {
  id: string;
  titulo: string;
  tipo: string;
  valor?: number | null;
};

export function HappyHourModal() {
  const [happyHour, setHappyHour] =
    useState<HappyHour | null>(null);

  useEffect(() => {
    async function loadHappyHour() {
      const response =
        await fetch(
          "/api/happy-hour",
          {
            cache:
              "no-store",
          }
        );

      const data =
        await response.json();

      if (!data) return;

      

      setHappyHour(data);

      confetti({
        particleCount: 150,
        spread: 100,
        origin: {
          y: 0.6,
        },
      });
    }

    loadHappyHour();
  }, []);

  if (!happyHour) {
    return null;
  }

  /*
   * El texto y el mínimo salen de
   * lib/promociones.ts, así el cartel siempre
   * coincide con lo que se cobra en el checkout.
   */
  const texto = textoHappyHour(happyHour);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-3xl bg-tuki-night-soft p-6 text-center shadow-2xl">
        <h2 className="font-display text-3xl font-extrabold text-tuki-lime">
          🎉 HAPPY HOUR
        </h2>

        <p className="mt-4 text-lg font-bold text-tuki-cream">
          {happyHour.titulo}
        </p>

        <p className="mt-3 text-sm text-tuki-cream/80">
          {texto}
        </p>

        <p className="mt-5 text-xs text-tuki-cream/60">
          Aprovechalo antes
          de que termine la
          noche 🌙
        </p>

        <button
          onClick={() =>
            setHappyHour(
              null
            )
          }
          className="mt-6 w-full rounded-2xl bg-tuki-lime p-3 font-bold text-tuki-night transition hover:opacity-90"
        >
          ¡Aprovechar!
        </button>
      </div>
    </div>
  );
}