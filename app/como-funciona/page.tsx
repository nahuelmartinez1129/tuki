import type { Metadata } from "next";
import Link from "next/link";

import { InfoCard, InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = {
  title: "Cómo funciona | Tuki",
};

const PASOS = [
  {
    titulo: "1. Elegí tus antojos",
    texto:
      "Entrá al menú y sumá al carrito golosinas, combos o una Caja Misteriosa.",
  },
  {
    titulo: "2. Cargá tu dirección",
    texto:
      "En el checkout verificamos que tu dirección esté dentro de nuestras zonas de envío y te mostramos el costo del envío.",
  },
  {
    titulo: "3. Elegí cómo pagar",
    texto:
      "Efectivo al recibir, transferencia (te pasamos el alias al confirmar) o una parte de cada forma.",
  },
  {
    titulo: "4. Seguí tu pedido",
    texto:
      "Al confirmar te damos un número de pedido para ver en qué estado está: confirmado, preparando y en camino.",
  },
  {
    titulo: "5. Disfrutá",
    texto: "Te lo llevamos a tu puerta. Porque las ganas no avisan. 🌙",
  },
];

export default function ComoFuncionaPage() {
  return (
    <InfoPage
      titulo="Cómo funciona"
      bajada="Pedir en Tuki es fácil: en pocos pasos tenés tus antojos en casa."
    >
      {PASOS.map((paso) => (
        <InfoCard key={paso.titulo} titulo={paso.titulo}>
          {paso.texto}
        </InfoCard>
      ))}

      <InfoCard titulo="Beneficios">
        Girá la{" "}
        <Link href="/ruleta" className="text-tuki-lime hover:underline">
          ruleta
        </Link>{" "}
        una vez por día para ganar premios, aprovechá el Happy Hour y el bono
        de bienvenida en tu primera compra. Se aplica un beneficio por
        pedido: siempre el que más te conviene.
      </InfoCard>
    </InfoPage>
  );
}
