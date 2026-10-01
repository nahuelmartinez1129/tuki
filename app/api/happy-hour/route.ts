import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ======================================================
// GET
// Devuelve el Happy Hour actualmente visible para el público
// ======================================================

export async function GET() {
  try {
    const now = new Date();

    const happyHour = await prisma.happyHour.findFirst({
      where: {
        activo: true,

        AND: [
          {
            OR: [
              {
                fechaInicio: null,
              },
              {
                fechaInicio: {
                  lte: now,
                },
              },
            ],
          },
          {
            OR: [
              {
                fechaFin: null,
              },
              {
                fechaFin: {
                  gte: now,
                },
              },
            ],
          },
        ],
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(happyHour);
  } catch (error) {
    console.error(
      "ERROR GET /api/happy-hour:",
      error
    );

    return NextResponse.json(
      {
        error: "No se pudo obtener el Happy Hour.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// POST
// Crea un nuevo Happy Hour
// ======================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      titulo,
      descripcion,
      tipo,
      valor,
      fechaInicio,
      fechaFin,
    } = body;

    // --------------------------------------------------
    // VALIDACIONES BÁSICAS
    // --------------------------------------------------

    if (
      typeof titulo !== "string" ||
      !titulo.trim()
    ) {
      return NextResponse.json(
        {
          error: "El título es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof descripcion !== "string" ||
      !descripcion.trim()
    ) {
      return NextResponse.json(
        {
          error: "La descripción es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof tipo !== "string" ||
      !tipo.trim()
    ) {
      return NextResponse.json(
        {
          error: "El tipo de promoción es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // TIPOS PERMITIDOS
    // --------------------------------------------------

    const tiposPermitidos = [
      "ENVIO_GRATIS",
      "DESCUENTO",
      "CAJA_10",
      "GOMITAS",
      "GUAYMALLEN",
    ];

    if (!tiposPermitidos.includes(tipo)) {
      return NextResponse.json(
        {
          error:
            "El tipo de promoción no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // VALOR
    // --------------------------------------------------

    let valorFinal: number | null = null;

    const tiposQueRequierenValor = [
      "DESCUENTO",
      "CAJA_10",
    ];

    if (tiposQueRequierenValor.includes(tipo)) {
      const numero = Number(valor);

      if (
        Number.isNaN(numero) ||
        numero <= 0 ||
        numero > 100
      ) {
        return NextResponse.json(
          {
            error:
              "El porcentaje debe estar entre 1 y 100.",
          },
          {
            status: 400,
          }
        );
      }

      valorFinal = numero;
    }

    // --------------------------------------------------
    // FECHAS
    // --------------------------------------------------

    let fechaInicioFinal: Date | null = null;
    let fechaFinFinal: Date | null = null;

    if (fechaInicio) {
      const fecha = new Date(fechaInicio);

      if (Number.isNaN(fecha.getTime())) {
        return NextResponse.json(
          {
            error:
              "La fecha de inicio no es válida.",
          },
          {
            status: 400,
          }
        );
      }

      fechaInicioFinal = fecha;
    }

    if (fechaFin) {
      const fecha = new Date(fechaFin);

      if (Number.isNaN(fecha.getTime())) {
        return NextResponse.json(
          {
            error:
              "La fecha de finalización no es válida.",
          },
          {
            status: 400,
          }
        );
      }

      fechaFinFinal = fecha;
    }

    // --------------------------------------------------
    // VALIDAR ORDEN DE FECHAS
    // --------------------------------------------------

    if (
      fechaInicioFinal &&
      fechaFinFinal &&
      fechaFinFinal <= fechaInicioFinal
    ) {
      return NextResponse.json(
        {
          error:
            "La fecha de finalización debe ser posterior a la fecha de inicio.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // CREAR HAPPY HOUR
    //
    // IMPORTANTE:
    // Se crea INACTIVO.
    //
    // El administrador después decide cuándo activarlo.
    // --------------------------------------------------

    const happyHour = await prisma.happyHour.create({
      data: {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        valor: valorFinal,
        fechaInicio: fechaInicioFinal,
        fechaFin: fechaFinFinal,
        activo: false,
      },
    });

    return NextResponse.json(
      happyHour,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "ERROR POST /api/happy-hour:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo crear el Happy Hour.",
      },
      {
        status: 500,
      }
    );
  }
}