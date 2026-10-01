import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Punto = {
  lat: number;
  lng: number;
};

type ResultadoNominatim = {
  lat?: string;
  lon?: string;
  display_name?: string;
  type?: string;
  class?: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

/**
 * ==========================================
 * POINT IN POLYGON
 * ==========================================
 *
 * Determina si una coordenada está dentro
 * del polígono de una zona de envío.
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

    const obj = punto as {
      lat?: unknown;
      lng?: unknown;
    };

    if (
      typeof obj.lat !== "number" ||
      !Number.isFinite(obj.lat) ||
      typeof obj.lng !== "number" ||
      !Number.isFinite(obj.lng)
    ) {
      return null;
    }

    puntos.push({
      lat: obj.lat,
      lng: obj.lng,
    });
  }

  if (puntos.length < 3) {
    return null;
  }

  return puntos;
}

/**
 * ==========================================
 * VALIDAR RESULTADO DE NOMINATIM
 * ==========================================
 *
 * Evitamos aceptar resultados que sean
 * simplemente:
 *
 * Miramar
 * Provincia de Buenos Aires
 * Argentina
 * etc.
 *
 * Necesitamos una ubicación concreta.
 */
function esDireccionValida(
  resultado: ResultadoNominatim
): boolean {
  const tiposNoValidos = [
    "administrative",
    "city",
    "town",
    "village",
    "municipality",
    "county",
    "state",
    "country",
    "postcode",
    "boundary",
    "place",
  ];

  if (
    resultado.type &&
    tiposNoValidos.includes(
      resultado.type
    )
  ) {
    return false;
  }

  /**
   * Caso ideal:
   *
   * calle + número
   */
  if (
    resultado.address?.road &&
    resultado.address?.house_number
  ) {
    return true;
  }

  /**
   * Algunos resultados pueden representar
   * una vivienda o edificio.
   */
  const tiposDireccion = [
    "house",
    "building",
    "residential",
    "apartments",
    "commercial",
    "retail",
    "yes",
  ];

  if (
    resultado.type &&
    tiposDireccion.includes(
      resultado.type
    )
  ) {
    return true;
  }

  return false;
}

/**
 * ==========================================
 * NORMALIZAR TEXTO
 * ==========================================
 */
function normalizarTexto(
  texto: string
): string {
  return texto
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

/**
 * ==========================================
 * GET
 * ==========================================
 *
 * Recibe:
 *
 * ?calle=44&numero=1029
 *
 * También mantenemos compatibilidad con
 * ?direccion=44 1029 por si alguna parte
 * vieja del frontend todavía lo utiliza.
 */
export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    /**
     * ========================================
     * OBTENER CALLE Y NÚMERO
     * ========================================
     */

    let calle = (
      searchParams.get("calle") ?? ""
    ).trim();

    let numero = (
      searchParams.get("numero") ?? ""
    ).trim();

    /**
     * ========================================
     * COMPATIBILIDAD CON DIRECCION
     * ========================================
     *
     * Si todavía llega:
     *
     * direccion=44 1029
     *
     * intentamos separarla.
     */
    if (
      (!calle || !numero) &&
      searchParams.has("direccion")
    ) {
      const direccionAnterior = (
        searchParams.get(
          "direccion"
        ) ?? ""
      )
        .replace(/º/g, "")
        .replace(/n°/gi, "")
        .replace(/nro/gi, "")
        .replace(/numero/gi, "")
        .trim();

      const partes =
        direccionAnterior
          .split(/\s+/)
          .filter(Boolean);

      if (partes.length >= 2) {
        const indiceNumero =
          partes.findIndex((parte) =>
            /^\d+$/.test(parte)
          );

        if (
          indiceNumero >= 0
        ) {
          numero =
            partes[indiceNumero];

          calle = partes
            .filter(
              (_, index) =>
                index !==
                indiceNumero
            )
            .join(" ");
        }
      }
    }

    /**
     * ========================================
     * VALIDACIÓN
     * ========================================
     */

    if (!calle) {
      return NextResponse.json(
        {
          disponible: false,
          direccionEncontrada: false,
          zona: null,
          error:
            "Ingresá la calle.",
        },
        {
          status: 400,
        }
      );
    }

    if (!numero) {
      return NextResponse.json(
        {
          disponible: false,
          direccionEncontrada: false,
          zona: null,
          error:
            "Ingresá el número de la dirección.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * El número debe contener al menos
     * un número.
     *
     * Permitimos formatos como:
     *
     * 1029
     * 1029A
     * 1029 bis
     */
    if (
      !/\d/.test(numero)
    ) {
      return NextResponse.json(
        {
          disponible: false,
          direccionEncontrada: false,
          zona: null,
          error:
            "El número de la dirección no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ========================================
     * LIMPIAR CALLE
     * ========================================
     */

    calle = calle
      .replace(
        /^calle\s+/i,
        ""
      )
      .trim();

    const direccion =
      `${calle} ${numero}`.trim();

    /**
     * ========================================
     * CONSULTAS A NOMINATIM
     * ========================================
     *
     * Probamos varias formas porque las
     * direcciones de Miramar pueden estar
     * cargadas de diferentes maneras.
     *
     * Ejemplo:
     *
     * 44 1029
     * Calle 44 1029
     * 44 1029, Miramar...
     */

    const consultas = [
      `${calle} ${numero}, Miramar, Buenos Aires, Argentina`,
      `Calle ${calle} ${numero}, Miramar, Buenos Aires, Argentina`,
    ];

    /**
     * Eliminamos consultas duplicadas.
     */
    const consultasUnicas =
      Array.from(
        new Set(
          consultas.map(
            normalizarTexto
          )
        )
      ).map(
        (consultaNormalizada) => {
          const original =
            consultas.find(
              (consulta) =>
                normalizarTexto(
                  consulta
                ) ===
                consultaNormalizada
            );

          return (
            original ??
            consultaNormalizada
          );
        }
      );

    let ubicacion:
      | ResultadoNominatim
      | null = null;

    /**
     * ========================================
     * BUSCAR EN NOMINATIM
     * ========================================
     */

    for (const consulta of consultasUnicas) {
      const url =
        "https://nominatim.openstreetmap.org/search?" +
        new URLSearchParams({
          q: consulta,
          format: "json",
          limit: "5",
          addressdetails: "1",
          countrycodes: "ar",
          "accept-language": "es",
        }).toString();

      console.log(
        "Buscando dirección en Nominatim:",
        consulta
      );

      const response =
        await fetch(url, {
          headers: {
            "User-Agent":
              "TUKI Delivery - zonas de envio",
            Accept:
              "application/json",
          },
          cache: "no-store",
        });

      if (!response.ok) {
        console.error(
          "Nominatim respondió con estado:",
          response.status
        );

        continue;
      }

      const resultados =
        (await response.json()) as ResultadoNominatim[];

      /**
       * Buscamos solamente una ubicación
       * concreta.
       */
      const encontrada =
        resultados.find(
          (resultado) =>
            esDireccionValida(
              resultado
            )
        );

      if (encontrada) {
        ubicacion =
          encontrada;

        break;
      }
    }

    /**
     * ========================================
     * NO SE ENCONTRÓ LA DIRECCIÓN
     * ========================================
     */

    if (!ubicacion) {
      console.warn(
        "No se encontró una dirección exacta:",
        {
          calle,
          numero,
        }
      );

      return NextResponse.json({
        disponible: false,
        direccionEncontrada: false,
        zona: null,
        error:
          "No pudimos ubicar exactamente esa dirección en Miramar. Revisá la calle y el número.",
      });
    }

    /**
     * ========================================
     * OBTENER COORDENADAS
     * ========================================
     */

    const lat = Number(
      ubicacion.lat
    );

    const lng = Number(
      ubicacion.lon
    );

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return NextResponse.json({
        disponible: false,
        direccionEncontrada: false,
        zona: null,
        error:
          "La ubicación encontrada no es válida.",
      });
    }

    console.log(
      "Dirección encontrada:",
      {
        direccion,
        display_name:
          ubicacion.display_name,
        lat,
        lng,
        type: ubicacion.type,
        address:
          ubicacion.address,
      }
    );

    /**
     * ========================================
     * BUSCAR ZONAS ACTIVAS
     * ========================================
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

    const punto: Punto = {
      lat,
      lng,
    };

    /**
     * ========================================
     * DETERMINAR ZONA
     * ========================================
     */

    for (const zona of zonas) {
      const poligono =
        convertirPoligono(
          zona.poligono
        );

      if (!poligono) {
        continue;
      }

      if (
        puntoDentroPoligono(
          punto,
          poligono
        )
      ) {
        console.log(
          "Zona encontrada:",
          {
            zona: zona.nombre,
            lat,
            lng,
          }
        );

        return NextResponse.json({
          disponible: true,

          direccionEncontrada: true,

          direccion:
            ubicacion.display_name,

          coordenadas: {
            lat,
            lng,
          },

          zona: {
            id: zona.id,
            nombre: zona.nombre,
            precio: zona.precio,
            compraMinima:
              zona.compraMinima,
          },
        });
      }
    }

    /**
     * ========================================
     * DIRECCIÓN VÁLIDA PERO FUERA DE ZONAS
     * ========================================
     */

    return NextResponse.json({
      disponible: false,

      direccionEncontrada: true,

      direccion:
        ubicacion.display_name,

      coordenadas: {
        lat,
        lng,
      },

      zona: null,

      error:
        "Esta dirección está fuera de nuestras zonas de reparto.",
    });
  } catch (error) {
    console.error(
      "Error verificando dirección:",
      error
    );

    return NextResponse.json(
      {
        disponible: false,
        direccionEncontrada: false,
        zona: null,
        error:
          "No se pudo verificar la dirección.",
      },
      {
        status: 500,
      }
    );
  }
}