"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

type HappyHour = {
  id: string;
  titulo: string;
  tipo: string;
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

  const messages: Record<
    string,
    string
  > = {
    ENVIO_GRATIS:
      "🚚 ¡Envío gratis en todos los pedidos!",

    DESCUENTO:
      "💸 ¡Descuento especial activo!",

    CUPON_1500:
      "🎁 ¡$1500 de regalo en tu pedido!",

    GOMITAS:
      "🍬 ¡Caramelos gratis esta noche!",

    CAJA_10:
      "📦 ¡10% OFF en cajas misteriosas!",
  };

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
          {
            messages[
              happyHour.tipo
            ]
          }
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