import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { InfoPage } from "@/components/layout/info-page";
import { formatPrice } from "@/lib/format";
import { REGLAS } from "@/lib/promociones";

export const metadata: Metadata = {
  title: "Preguntas frecuentes | Tuki",
};

const PREGUNTAS: { pregunta: string; respuesta: ReactNode }[] = [
  {
    pregunta: "¿A dónde hacen envíos?",
    respuesta: (
      <>
        Repartimos en Miramar. Mirá las distancias y precios en{" "}
        <Link href="/zonas-envio" className="text-tuki-lime hover:underline">
          Zonas de envío
        </Link>
        . En el checkout te confirmamos si llegamos a tu dirección.
      </>
    ),
  },
  {
    pregunta: "¿Hay compra mínima?",
    respuesta:
      "Sí, la compra mínima y el costo del envío dependen de tu zona. Los ves antes de confirmar el pedido.",
  },
  {
    pregunta: "¿Tienen envío gratis?",
    respuesta: `Sí: en pedidos desde ${formatPrice(
      REGLAS.envioGratisDesde
    )} el envío es gratis en todas nuestras zonas, y se suma a cualquier promo.`,
  },
  {
    pregunta: "¿Cómo puedo pagar?",
    respuesta:
      "En efectivo al recibir, por transferencia (te pasamos el alias al confirmar) o una parte de cada forma.",
  },
  {
    pregunta: "¿Puedo seguir mi pedido?",
    respuesta:
      "Sí. Al confirmar el pedido te damos un número y una página para ver en qué estado está.",
  },
  {
    pregunta: "¿Cómo funciona la ruleta?",
    respuesta: (
      <>
        Podés girar la{" "}
        <Link href="/ruleta" className="text-tuki-lime hover:underline">
          ruleta
        </Link>{" "}
        una vez por día. Se vuelve a habilitar a las 21:00 del día siguiente
        (los giros de madrugada cuentan como la noche anterior). El premio
        dura 48 horas y se usa en tu próximo pedido, con su compra mínima.
      </>
    ),
  },
  {
    pregunta: "¿Puedo usar más de una promo en el mismo pedido?",
    respuesta:
      "No: se aplica un beneficio por pedido. Si tenés varios (cupón, premio de la ruleta, Happy Hour o bono de bienvenida), elegimos automáticamente el que más te conviene.",
  },
  {
    pregunta: "¿Qué es la Caja Misteriosa?",
    respuesta: (
      <>
        Una caja sorpresa con golosinas elegidas por nosotros. Mirá los
        tamaños en{" "}
        <Link
          href="/caja-misteriosa"
          className="text-tuki-lime hover:underline"
        >
          Caja Misteriosa
        </Link>
        .
      </>
    ),
  },
  {
    pregunta: "¿Puedo retirar en persona?",
    respuesta: "No, por ahora trabajamos solo con envío a domicilio.",
  },
];

export default function PreguntasFrecuentesPage() {
  return (
    <InfoPage
      titulo="Preguntas frecuentes"
      bajada="Todo lo que necesitás saber antes de pedir."
    >
      {PREGUNTAS.map((p) => (
        <details
          key={p.pregunta}
          className="group rounded-3xl bg-tuki-night-soft p-5 shadow-soft ring-1 ring-white/5"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-bold text-tuki-cream">
            {p.pregunta}
            <span className="text-tuki-lime transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="mt-3 text-sm leading-relaxed text-tuki-cream/70">
            {p.respuesta}
          </div>
        </details>
      ))}
    </InfoPage>
  );
}
