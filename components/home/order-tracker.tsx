"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STATUS: Record<
  string,
  {
    emoji: string;
    title: string;
    description: string;
  }
> = {
  PENDIENTE: {
    emoji: "🟡",
    title: "Pedido recibido",
    description:
      "Estamos revisando tu pedido.",
  },

  CONFIRMADO: {
    emoji: "🔵",
    title: "Pedido confirmado",
    description:
      "¡Ya aceptamos tu pedido!",
  },

  PREPARANDO: {
    emoji: "👨‍🍳",
    title: "Preparando",
    description:
      "Estamos preparando tus antojos.",
  },

  EN_CAMINO: {
    emoji: "🛵",
    title:
      "LA KATONETA ESTÁ EN CAMINO",
    description:
      "Pone modo turbo y llega con tu pedido.",
  },

  ENTREGADO: {
    emoji: "🎉",
    title: "Pedido entregado",
    description:
      "¡Gracias por elegir TUKI!",
  },

  CANCELADO: {
    emoji: "❌",
    title: "Pedido cancelado",
    description:
      "Tu pedido fue cancelado.",
  },
};

export function OrderTracker() {
  const [pedido, setPedido] =
    useState<any>(null);

  useEffect(() => {
    async function load() {
      const numero =
        localStorage.getItem(
          "tuki_last_order"
        );

      if (!numero) {
        setPedido(null);
        return;
      }

      try {
        const response =
          await fetch(
            `/api/pedidos/${numero}`
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (
          data.estado ===
            "ENTREGADO" ||
          data.estado ===
            "CANCELADO"
        ) {
          localStorage.removeItem(
            "tuki_last_order"
          );

          setPedido(null);

          return;
        }

        setPedido(data);
      } catch (error) {
        console.log(error);
      }
    }

    load();

    const interval =
      setInterval(load, 5000);

    return () =>
      clearInterval(interval);
  }, []);

  if (!pedido) {
    return null;
  }

  const current =
    STATUS[pedido.estado];

 return (
  <section className="container mt-8 mb-14">
    <div
      className="
      overflow-hidden
      rounded-[32px]
      border
      border-tuki-lime/20
      bg-gradient-to-b
      from-tuki-night-soft
      to-tuki-night
      p-5
      sm:p-6
      shadow-2xl
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-tuki-cream/50">
            Pedido activo
          </p>

          <h2 className="mt-2 text-3xl font-bold text-tuki-cream">
            Pedido #{pedido.numero}
          </h2>
        </div>

        
      </div>

      {pedido.estado === "EN_CAMINO" ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <img
            src="/katoneta.png"
            alt="La Katoneta"
            className="
              animate-katoneta
              h-48
              sm:h-56
              object-contain
            "
          />

          <h3
            className="
            mt-6
            max-w-sm
            font-display
            text-3xl
            font-extrabold
            leading-tight
            text-tuki-lime
            "
          >
            LA KATONETA
            <br />
            ESTÁ EN CAMINO
          </h3>

          <p className="mt-4 text-lg text-tuki-cream">
            Kathy está llevando tu pedido.
          </p>

          <p className="mt-2 max-w-xs text-sm text-tuki-cream/70">
            Pone modo turbo y llega con tu pedido.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-tuki-lime">
            {current.title}
          </h3>

          <p className="mt-3 text-tuki-cream">
            {current.description}
          </p>
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          href={`/pedido/${pedido.numero}`}
          className="
            inline-flex
            items-center
            rounded-full
            bg-tuki-lime
            px-8
            py-4
            text-lg
            font-bold
            text-tuki-night
            transition
            hover:scale-105
          "
        >
          Ver seguimiento
        </Link>
      </div>
    </div>
  </section>
);
  
}