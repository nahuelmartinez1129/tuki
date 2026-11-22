import { Prisma } from "@prisma/client";
import { exigirAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function PATCH(
  request: Request,
  context: Context
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const { id } = await context.params;
    const body = await request.json();

    const zonaExistente = await prisma.zonaEnvio.findUnique({
      where: {
        id,
      },
    });

    if (!zonaExistente) {
      return NextResponse.json(
        {
          error: "Zona de envío no encontrada",
        },
        {
          status: 404,
        }
      );
    }

const data: {
  nombre?: string;
  precio?: number;
  compraMinima?: number;
  activo?: boolean;
  orden?: number;
  poligono?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
} = {};

    if (body.nombre !== undefined) {
      const nombre = String(body.nombre).trim();

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

      data.nombre = nombre;
    }

    if (body.precio !== undefined) {
      const precio = Number(body.precio);

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

      data.precio = precio;
    }

    if (body.compraMinima !== undefined) {
      const compraMinima = Number(body.compraMinima);

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

      data.compraMinima = compraMinima;
    }

    if (body.activo !== undefined) {
      data.activo = Boolean(body.activo);
    }

    if (body.orden !== undefined) {
      const orden = Number(body.orden);

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

      data.orden = orden;
    }

    if (body.poligono !== undefined) {
      if (
        body.poligono !== null &&
        !validarPoligono(body.poligono)
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

      data.poligono =
  body.poligono === null
    ? Prisma.JsonNull
    : body.poligono;
    }

    const zona = await prisma.zonaEnvio.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json(zona);
  } catch (error) {
    console.error(
      "Error actualizando zona de envío:",
      error
    );

    return NextResponse.json(
      {
        error: "No se pudo actualizar la zona de envío",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  context: Context
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const { id } = await context.params;

    const zona = await prisma.zonaEnvio.findUnique({
      where: {
        id,
      },
    });

    if (!zona) {
      return NextResponse.json(
        {
          error: "Zona de envío no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.zonaEnvio.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Error eliminando zona de envío:",
      error
    );

    return NextResponse.json(
      {
        error: "No se pudo eliminar la zona de envío",
      },
      {
        status: 500,
      }
    );
  }
}