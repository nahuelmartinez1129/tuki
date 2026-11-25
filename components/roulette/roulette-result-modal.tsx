"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import {
  REGLAS,
  minimoPremioRuleta,
} from "@/lib/promociones";

interface RouletteResultModalProps {
  prize: {
    id?: string;
    nombre: string;
    tipo: string;
    valor?: number | null;
  };
  onClose: () => void;
}

export function RouletteResultModal({
  prize,
  onClose,
}: RouletteResultModalProps) {
  const isNoPrize =
    prize.tipo === "SIN_PREMIO";

  const isRetry =
    prize.tipo === "VOLVER_A_GIRAR";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-tuki-night/80 backdrop-blur-sm animate-in fade-in duration-300"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="animate-in zoom-in-90 fade-in slide-in-from-bottom-4 relative w-full max-w-xs rounded-3xl bg-tuki-night-soft p-6 text-center shadow-soft-lg ring-1 ring-white/10 duration-300 sm:max-w-sm"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 text-tuki-cream/50 hover:text-tuki-cream"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Emoji */}
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-4xl">
          {getEmoji(prize.tipo)}
        </span>

        {/* Título */}
        <p className="mt-4 font-display text-xs font-bold uppercase tracking-widest text-tuki-lime">
          {isNoPrize
            ? "Esta vez no hubo suerte"
            : isRetry
            ? "¡Otra oportunidad!"
            : "¡Ganaste!"}
        </p>

        {/* Nombre del premio */}
        <h3 className="mt-1 font-display text-2xl font-extrabold text-tuki-cream">
          {prize.nombre}
        </h3>

        {/* Descripción */}
        {!isNoPrize && !isRetry && (
          <p className="mt-2 text-sm text-tuki-cream/70">
            Se aplica automáticamente en tu próximo pedido
            desde{" "}
            {formatPrice(
              minimoPremioRuleta(prize.tipo)
            )}
            . Válido por {REGLAS.premioVigenciaHoras} horas.
          </p>
        )}

        {isRetry && (
          <p className="mt-2 text-sm text-tuki-cream/70">
            ¡La suerte te dio otra oportunidad!
          </p>
        )}

        {/* Botones */}
        <div className="mt-6 flex flex-col gap-2">
          {!isNoPrize && !isRetry && (
            <Button
              variant="lime"
              size="lg"
              asChild
            >
              <Link href="/menu">
                Usar ahora
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

function getEmoji(tipo: string) {
  switch (tipo) {
    case "ENVIO_GRATIS":
      return "🚀";

    case "DESCUENTO":
    case "PORCENTAJE":
      return "🏷️";

    case "ALFAJOR":
    case "GUAYMALLEN":
      return "🍫";

    case "GOMITAS":
      return "🍬";

    case "VOLVER_A_GIRAR":
      return "🎡";

    case "SIN_PREMIO":
      return "🌙";

    default:
      return "🎁";
  }
}