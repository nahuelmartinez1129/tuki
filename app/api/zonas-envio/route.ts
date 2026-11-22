import { Prisma } from "@prisma/client";
import { exigirAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function validarPoligono(poligono: unknown): boolean {
  if (!Array.isArray(poligono)) {
    return false;
  }

  if (poligono.length < 3) {
    return false;
  }

  return poligono.every((punto) => {
    if (!punto || typeof punto !== "object") {
      return false;
    }

    const puntoObj = punto as {
      lat?: unknown;
      lng?: unknown;
    };

    return (
      typeof puntoObj.lat === "number" &&
      Number.isFinite(puntoObj.lat) &&
      typeof puntoObj.lng === "number" &&
      Number.isFinite(puntoObj.lng)
    );
  });
}

export async function GET() {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const zonas = await prisma.zonaEnvio.findMany({
      orderBy: [
        { orden: "asc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json(zonas);
  } catch (error) {
    console.error("Error obteniendo zonas de envío:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener las zonas de envío",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const body = await request.json();

    const nombre = String(body.nombre ?? "").trim();
    const precio = Number(body.precio);
    const compraMinima = Number(body.compraMinima);
    const activo = body.activo !== false;
    const orden = Number(body.orden ?? 0);

    const poligono =
      body.poligono !== undefined
        ? body.poligono
        : null;

    if (!nombre) {
      return NextResponse.json(
        {
          error: "El nombre de la zona es obligatorio",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isInteger(precio) || precio < 0) {
      return NextResponse.json(
        {
          error: "El precio de envío no es válido",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(compraMinima) ||
      compraMinima < 0
    ) {
      return NextResponse.json(
        {
          error: "La compra mínima no es válida",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isInteger(orden) || orden < 0) {
      return NextResponse.json(
        {
          error: "El orden no es válido",
        },
        {
          status: 400,
        }
      );
    }

    if (
      poligono !== null &&
      !validarPoligono(poligono)
    ) {
      return NextResponse.json(
        {
          error:
            "El polígono no es válido. Debe tener al menos 3 puntos con latitud y longitud.",
        },
        {
          status: 400,
        }
      );
    }

const zona = await prisma.zonaEnvio.create({
  data: {
    nombre,
    precio,
    compraMinima,
    activo,
    orden,
    poligono:
      poligono === null
        ? Prisma.JsonNull
        : poligono,
  },
});

    return NextResponse.json(zona, {
      status: 201,
    });
  } catch (error) {
    console.error("Error creando zona de envío:", error);

    return NextResponse.json(
      {
        error: "No se pudo crear la zona de envío",
      },
      {
        status: 500,
      }
    );
  }
}