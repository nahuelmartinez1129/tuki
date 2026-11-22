"use client";

import { formatPrice } from "@/lib/format";
import { REGLAS } from "@/lib/promociones";
import { useBienvenida } from "@/hooks/use-bienvenida";

const DESCUENTO = formatPrice(REGLAS.bienvenidaDescuento);
const MINIMO = formatPrice(REGLAS.bienvenidaMinimo);

/**
 * Banner para el inicio y el menú.
 * Solo se ve si el visitante todavía no compró.
 */
export function BonoBienvenidaBanner({
  className = "",
}: {
  className?: string;
}) {
  const disponible = useBienvenida();

  if (!disponible) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-3 rounded-2xl border border-tuki-lime/30 bg-tuki-night-soft px-4 py-3">
        <span aria-hidden className="text-2xl">
          🎁
        </span>

        <p className="text-sm text-tuki-cream">
          <span className="font-display font-bold text-tuki-lime">
            Primera compra: {DESCUENTO} OFF
          </span>{" "}
          en pedidos desde {MINIMO}. Se aplica solo en el checkout.
        </p>
      </div>
    </div>
  );
}

/**
 * Barra de progreso para el carrito.
 */
export function BonoBienvenidaProgreso({
  subtotal,
}: {
  subtotal: number;
}) {
  const disponible = useBienvenida();

  if (!disponible || subtotal <= 0) return null;

  const falta = REGLAS.bienvenidaMinimo - subtotal;

  const progreso = Math.min(
    100,
    Math.round(
      (subtotal / REGLAS.bienvenidaMinimo) * 100
    )
  );

  return (
    <div className="mb-4 rounded-2xl bg-tuki-night p-3">
      <p className="text-sm text-tuki-cream">
        {falta > 0 ? (
          <>
            🎁 Primera compra: te faltan{" "}
            <span className="font-bold text-tuki-lime">
              {formatPrice(falta)}
            </span>{" "}
            para {DESCUENTO} OFF
          </>
        ) : (
          <>
            ✅{" "}
            <span className="font-bold text-tuki-lime">
              ¡Tenés {DESCUENTO} OFF en tu primera compra!
            </span>
          </>
        )}
      </p>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-tuki-lime transition-all duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </div>
  );
}
