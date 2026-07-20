"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  XCircle,
  PartyPopper,
  Percent,
  Gift,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

type PedidoEstado =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "PREPARANDO"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO";

const STATUS_FLOW: PedidoEstado[] = [
  "PENDIENTE",
  "CONFIRMADO",
  "PREPARANDO",
  "EN_CAMINO",
  "ENTREGADO",
];

const STATUS_CONFIG: Record<
  PedidoEstado,
  {
    emoji: string;
    message: string;
    icon: typeof Clock;
    short: string;
  }
> = {
  PENDIENTE: {
    emoji: "🟡",
    message: "Estamos revisando tu pedido.",
    icon: Clock,
    short: "Pendiente",
  },

  CONFIRMADO: {
    emoji: "🔵",
    message: "Tu pedido fue confirmado.",
    icon: CheckCircle2,
    short: "Confirmado",
  },

  PREPARANDO: {
    emoji: "👨‍🍳",
    message: "Estamos preparando tu pedido.",
    icon: ChefHat,
    short: "Preparando",
  },

  EN_CAMINO: {
    emoji: "🛵",
    message: "Tu pedido está en camino.",
    icon: Bike,
    short: "En camino",
  },

  ENTREGADO: {
    emoji: "✅",
    message: "Gracias por elegir TUKI.",
    icon: PartyPopper,
    short: "Entregado",
  },

  CANCELADO: {
    emoji: "❌",
    message: "Tu pedido fue cancelado.",
    icon: XCircle,
    short: "Cancelado",
  },
};

function getStepState(
  step: PedidoEstado,
  currentIndex: number
) {
  const stepIndex =
    STATUS_FLOW.indexOf(step);

  if (stepIndex < currentIndex)
    return "completed";

  if (stepIndex === currentIndex)
    return "current";

  return "upcoming";
}

function formatPrice(
  value: number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
    }
  ).format(value);
}

export default function PedidoPage() {
  const params = useParams();

  const [pedido, setPedido] =
    useState<any>(null);

  useEffect(() => {
    async function load() {
      const response =
        await fetch(
          `/api/pedidos/${params.numero}`
        );

      const data =
        await response.json();

      console.log(data);

      setPedido(data);
    }

    load();

    const interval =
      setInterval(load, 2000);

    return () =>
      clearInterval(interval);
  }, [params.numero]);

  if (!pedido) {
    return (
      <h1>Cargando...</h1>
    );
  }
  const isCancelado =
  pedido.estado === "CANCELADO";

const currentIndex =
  isCancelado
    ? -1
    : STATUS_FLOW.indexOf(
        pedido.estado
      );

const currentConfig =
  STATUS_CONFIG[
    pedido.estado as PedidoEstado
  ];

const CurrentIcon =
  currentConfig.icon;

 return (
  <main className="min-h-screen bg-tuki-night px-4 py-8">
    <div className="mx-auto flex max-w-2xl flex-col gap-4">

      <div className="flex justify-center">
        <h1 className="font-display text-4xl font-extrabold text-tuki-lime">
          TUKI
        </h1>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-tuki-cream/50">
          Seguimiento de pedido
        </p>

        <h1 className="text-3xl font-bold text-tuki-cream">
          Pedido #{pedido.numero}
        </h1>
      </div>

      <div className="rounded-3xl bg-tuki-night-soft p-6">
        <div className="flex items-center justify-between">
          <p className="text-tuki-cream">
            Estado actual
          </p>

          <Badge>
            {currentConfig.short}
          </Badge>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="text-4xl">
            {currentConfig.emoji}
          </span>

          <div>
            <p className="font-bold text-tuki-cream">
              {currentConfig.message}
            </p>

            <p className="text-sm text-tuki-cream/60">
              Actualizando
              automáticamente...
            </p>

            {pedido.estado ===
              "PREPARANDO" && (
              <p className="mt-2 text-xs text-tuki-cream/50">
                Tiempo estimado:
                20-30 minutos
              </p>
            )}

            {pedido.estado ===
              "EN_CAMINO" && (
              <p className="mt-2 text-xs text-tuki-cream/50">
                Llegando en pocos
                minutos.
              </p>
            )}
          </div>

          <CurrentIcon
            className={`ml-auto hidden h-8 w-8 sm:block ${
              pedido.estado ===
              "EN_CAMINO"
                ? "animate-bounce text-tuki-lime"
                : "text-tuki-lime"
            }`}
          />
        </div>
      </div>

      <div className="rounded-3xl bg-tuki-night-soft p-6">
        <h2 className="font-bold text-tuki-lime">
          Productos
        </h2>

        <div className="mt-4 space-y-2">
          {pedido.items.map(
            (item: any) => (
              <div
                key={item.id}
                className="flex justify-between"
              >
                <span className="text-tuki-cream">
                  {item.cantidad}x{" "}
                  {item.nombre}
                </span>

                <span className="text-tuki-cream">
                  {formatPrice(
                    item.precio *
                      item.cantidad
                  )}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {(pedido.premio ||
        pedido.happyHour) && (
        <div className="rounded-3xl bg-tuki-night-soft p-6">
          <h2 className="font-bold text-tuki-lime">
            Beneficios
          </h2>

          {pedido.premio && (
            <p className="mt-3 text-tuki-cream">
              🎁 {pedido.premio}
            </p>
          )}

          {pedido.happyHour && (
            <p className="text-tuki-cream">
              🔥 {pedido.happyHour}
            </p>
          )}
        </div>
      )}

      <div className="rounded-3xl bg-tuki-night-soft p-6">
        <h2 className="font-bold text-tuki-lime">
          Resumen
        </h2>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {formatPrice(
                pedido.subtotal
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Descuento</span>
            <span>
              -{formatPrice(
                pedido.descuento
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Envío</span>
            <span>
              {pedido.envio === 0
                ? "Gratis"
                : formatPrice(
                    pedido.envio
                  )}
            </span>
          </div>

          <div className="flex justify-between border-t border-white/10 pt-4 text-xl font-bold text-tuki-lime">
            <span>Total</span>

            <span>
              {formatPrice(
                pedido.total
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="pb-10 text-center text-xs text-tuki-cream/50">
        Horario de atención:
        19:00 - 02:00
      </div>
    </div>
  </main>
);
}