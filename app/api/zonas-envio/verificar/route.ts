import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Punto = {
  lat: number;
  lng: number;
};

/**
 * ==========================================
 * POINT IN POLYGON
 * ==========================================
 *
 * Determina si un punto está dentro
 * de un polígono utilizando el algoritmo
 * Ray Casting.
 */
function puntoDentroPoligono(
  punto: Punto,
  poligono: Punto[]
): boolean {
  let dentro = false;

  const x = punto.lng;
  const y = punto.lat;

  for (
    let i = 0, j = poligono.length - 1;
    i < poligono.length;
    j = i++
  ) {
    const xi = poligono[i].lng;
    const yi = poligono[i].lat;

    const xj = poligono[j].lng;
    const yj = poligono[j].lat;

    const intersecta =
      yi > y !== yj > y &&
      x <
        ((xj - xi) * (y - yi)) /
          (yj - yi) +
          xi;

    if (intersecta) {
      dentro = !dentro;
    }
  }

  return dentro;
}

/**
 * ==========================================
 * VALIDAR COORDENADAS
 * ==========================================
 */
function validarCoordenadas(
  lat: unknown,
  lng: unknown
): lat is number {
  return (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng)
  );
}

/**
 * ==========================================
 * CONVERTIR POLÍGONO
 * ==========================================
 */
function convertirPoligono(
  poligono: unknown
): Punto[] | null {
  if (!Array.isArray(poligono)) {
    return null;
  }

  const puntos: Punto[] = [];

  for (const punto of poligono) {
    if (
      !punto ||
      typeof punto !== "object"
    ) {
      return null;
    }

    const puntoObj = punto as {
      lat?: unknown;
      lng?: unknown;
    };

    if (
      typeof puntoObj.lat !== "number" ||
      !Number.isFinite(puntoObj.lat) ||
      typeof puntoObj.lng !== "number" ||
      !Number.isFinite(puntoObj.lng)
    ) {
      return null;
    }

    puntos.push({
      lat: puntoObj.lat,
      lng: puntoObj.lng,
    });
  }

  if (puntos.length < 3) {
    return null;
  }

  return puntos;
}

/**
 * ==========================================
 * GET
 * ==========================================
 *
 * Ejemplo:
 *
 * /api/zonas-envio/verificar?lat=-38.263&lng=-57.846
 *
 * Recibe coordenadas y determina en cuál
 * de las zonas activas se encuentra el punto.
 */
export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const latParam =
      searchParams.get("lat");

    const lngParam =
      searchParams.get("lng");

    /**
     * Verificamos que ambos parámetros
     * hayan sido enviados.
     */
    if (
      !latParam ||
      !lngParam
    ) {
      return NextResponse.json(
        {
          error:
            "Latitud y longitud son obligatorias.",
        },
        {
          status: 400,
        }
      );
    }

    const lat = Number(
      latParam
    );

    const lng = Number(
      lngParam
    );

    /**
     * Validamos que sean coordenadas
     * numéricas válidas.
     */
    if (
      !validarCoordenadas(
        lat,
        lng
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Latitud y longitud deben ser válidas.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ========================================
     * OBTENER ZONAS ACTIVAS
     * ========================================
     *
     * Se obtienen todas las zonas configuradas
     * en la base de datos.
     *
     * Actualmente:
     *
     * Zona A
     * Zona B
     * Zona C
     * Zona D
     * Zona E
     * Zona F
     * Zona G
     * Zona H
     *
     * No necesitamos escribirlas manualmente.
     */

    const zonas =
      await prisma.zonaEnvio.findMany({
        where: {
          activo: true,
        },
        orderBy: [
          {
            orden: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      });

    /**
     * Si no hay zonas activas,
     * no hay servicio de delivery.
     */
    if (zonas.length === 0) {
      return NextResponse.json({
        disponible: false,
        zona: null,
        error:
          "No hay zonas de envío activas.",
      });
    }

    const punto: Punto = {
      lat,
      lng,
    };

    /**
     * ========================================
     * BUSCAR ZONA
     * ========================================
     */

    for (const zona of zonas) {
      const poligono =
        convertirPoligono(
          zona.poligono
        );

      /**
       * Si una zona tiene un polígono
       * inválido o vacío, simplemente
       * continuamos con la siguiente.
       */
      if (!poligono) {
        console.warn(
          `La zona "${zona.nombre}" tiene un polígono inválido.`
        );

        continue;
      }

      const pertenece =
        puntoDentroPoligono(
          punto,
          poligono
        );

      if (pertenece) {
        console.log(
          "Punto encontrado dentro de zona:",
          {
            zona: zona.nombre,
            lat,
            lng,
          }
        );

        return NextResponse.json({
          disponible: true,

          zona: {
            id: zona.id,
            nombre: zona.nombre,
            precio: zona.precio,
            compraMinima:
              zona.compraMinima,
          },

          coordenadas: {
            lat,
            lng,
          },
        });
      }
    }

    /**
     * ========================================
     * FUERA DE TODAS LAS ZONAS
     * ========================================
     */

    return NextResponse.json({
      disponible: false,

      zona: null,

      coordenadas: {
        lat,
        lng,
      },

      error:
        "La ubicación está fuera de nuestras zonas de reparto.",
    });
  } catch (error) {
    console.error(
      "Error verificando zona de envío:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo verificar la zona de envío.",
      },
      {
        status: 500,
      }
    );
  }
}