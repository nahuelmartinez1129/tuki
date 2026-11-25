import type { Metadata } from "next";

import { InfoCard, InfoPage } from "@/components/layout/info-page";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { REGLAS } from "@/lib/promociones";

export const metadata: Metadata = {
  title: "Zonas de envío | Tuki",
};

// Las zonas se editan desde el admin: siempre
// leer las actuales.
export const dynamic = "force-dynamic";

// Centro de las zonas (C. 44 1796, Miramar).
const CENTRO = { lat: -38.2684915, lng: -57.8526209 };

type Punto = { lat: number; lng: number };

function distanciaMetros(p: Punto) {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(p.lat - CENTRO.lat);
  const dLng = rad(p.lng - CENTRO.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(CENTRO.lat)) *
      Math.cos(rad(p.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const km = (metros: number) =>
  (Math.round(metros / 500) / 2).toLocaleString("es-AR");

type Tramo = {
  desde: number;
  hasta: number;
  precio: number;
  compraMinima: number;
};

/*
 * Junta las zonas (anillos) seguidas que tienen
 * el mismo precio y compra mínima en un solo
 * tramo: "hasta 2,5 km: $1.500".
 */
async function tramosDeEnvio(): Promise<Tramo[]> {
  const zonas = await prisma.zonaEnvio.findMany({
    where: { activo: true },
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
  });

  const conAlcance = zonas
    .map((z) => {
      const puntos = Array.isArray(z.poligono)
        ? (z.poligono as unknown as Punto[])
        : [];
      return {
        precio: z.precio,
        compraMinima: z.compraMinima,
        alcance: puntos.length
          ? Math.max(...puntos.map(distanciaMetros))
          : 0,
      };
    })
    .filter((z) => z.alcance > 0)
    .sort((a, b) => a.alcance - b.alcance);

  const tramos: Tramo[] = [];
  for (const z of conAlcance) {
    const ultimo = tramos[tramos.length - 1];
    if (
      ultimo &&
      ultimo.precio === z.precio &&
      ultimo.compraMinima === z.compraMinima
    ) {
      ultimo.hasta = z.alcance;
    } else {
      tramos.push({
        desde: ultimo?.hasta ?? 0,
        hasta: z.alcance,
        precio: z.precio,
        compraMinima: z.compraMinima,
      });
    }
  }
  return tramos;
}

export default async function ZonasEnvioPage() {
  const tramos = await tramosDeEnvio();

  return (
    <InfoPage
      titulo="Zonas de envío"
      bajada="Repartimos en Miramar. El costo del envío depende de la distancia a tu casa."
    >
      {tramos.length > 0 ? (
        <section className="overflow-hidden rounded-3xl bg-tuki-night-soft shadow-soft ring-1 ring-white/5">
          {tramos.map((t) => (
            <div
              key={t.hasta}
              className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4 last:border-b-0"
            >
              <div>
                <p className="font-display font-bold text-tuki-cream">
                  {t.desde === 0
                    ? `Hasta ${km(t.hasta)} km`
                    : `De ${km(t.desde)} a ${km(t.hasta)} km`}
                </p>
                <p className="text-xs text-tuki-cream/50">
                  Compra mínima {formatPrice(t.compraMinima)}
                </p>
              </div>
              <span className="font-display text-lg font-extrabold text-tuki-lime">
                {formatPrice(t.precio)}
              </span>
            </div>
          ))}
        </section>
      ) : (
        <InfoCard>
          En este momento no tenemos zonas de envío habilitadas.
        </InfoCard>
      )}

      <InfoCard titulo="🚲 Envío gratis">
        En pedidos desde {formatPrice(REGLAS.envioGratisDesde)}, el envío es
        gratis en todas nuestras zonas.
      </InfoCard>

      <InfoCard titulo="¿Llegamos a tu casa?">
        Cargá tu dirección en el checkout y te confirmamos al instante si
        estás dentro de la zona y cuánto sale el envío. Si quedás afuera, te
        avisamos antes de que hagas el pedido.
      </InfoCard>
    </InfoPage>
  );
}
