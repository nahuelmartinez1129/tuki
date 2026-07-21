"use client";

import { useEffect, useState } from "react";

export function StatusBanner() {
  const [abierto, setAbierto] =
    useState(true);

  useEffect(() => {
    async function load() {
      const response =
        await fetch(
          "/api/configuracion"
        );

      const data =
        await response.json();

      setAbierto(
        data.abierto
      );
    }

    load();

    const interval =
      setInterval(
        load,
        10000 // mejor 10 segundos
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  return abierto ? (
    <div className="bg-tuki-lime py-2 text-center font-display text-sm font-bold text-black">
      🟢 TUKI está abierto y esperando tu pedido.
    </div>
  ) : (
    <div className="bg-tuki-night-soft py-3 text-center font-display text-sm font-bold text-tuki-cream">
      🌙 TUKI está descansando. Volvemos pronto.
    </div>
  );
}