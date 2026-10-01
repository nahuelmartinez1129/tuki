import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ROULETTE_TEST_MODE =
  process.env.ROULETTE_TEST_MODE === "false";

const ARGENTINA_OFFSET_MS =
  3 * 60 * 60 * 1000;

function getArgentinaParts(date: Date) {
  const argentinaTime = new Date(
    date.getTime() - ARGENTINA_OFFSET_MS
  );

  return {
    year: argentinaTime.getUTCFullYear(),
    month: argentinaTime.getUTCMonth(),
    day: argentinaTime.getUTCDate(),
  };
}

function getNextRouletteReset(lastSpin: Date) {
  const {
    year,
    month,
    day,
  } = getArgentinaParts(lastSpin);

  // 21:00 Argentina = 00:00 UTC del día siguiente.
  //
  // La ruleta vuelve a habilitarse
  // a las 21:00 del día siguiente al último giro.
  return new Date(
    Date.UTC(
      year,
      month,
      day + 2,
      0,
      0,
      0,
      0
    )
  );
}

// ======================================================
// SELECCIÓN DEL PREMIO SEGÚN PROBABILIDAD
// ======================================================

function seleccionarPremio<
  T extends { probabilidad: number }
>(premios: T[]): T {
  const totalProbabilidad =
    premios.reduce(
      (total, premio) =>
        total +
        Math.max(
          0,
          premio.probabilidad
        ),
      0
    );

  if (totalProbabilidad <= 0) {
    throw new Error(
      "La suma de las probabilidades debe ser mayor a 0."
    );
  }

  const random =
    Math.random() *
    totalProbabilidad;

  let acumulado = 0;

  for (const premio of premios) {
    acumulado += Math.max(
      0,
      premio.probabilidad
    );

    if (random < acumulado) {
      return premio;
    }
  }

  return premios[premios.length - 1];
}

// ======================================================
// POST
// GIRAR RULETA
// ======================================================

export async function POST(
  request: Request
) {
  try {
    const { phone } =
      await request.json();

    // --------------------------------------------------
    // VALIDAR TELÉFONO
    // --------------------------------------------------

    if (!phone) {
      return NextResponse.json(
        {
          error: "phone requerido",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // BUSCAR USUARIO
    // --------------------------------------------------

    const user =
      await prisma.usuario.findUnique({
        where: {
          phone,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error: "Usuario no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // BUSCAR ÚLTIMO GIRO
    // --------------------------------------------------

    const lastSpin =
      await prisma.ruleta.findFirst({
        where: {
          usuarioId: user.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // --------------------------------------------------
    // VERIFICAR COOLDOWN
    //
    // Si el último premio fue VOLVER_A_GIRAR,
    // NO se aplica cooldown porque el usuario
    // tiene derecho a volver a girar.
    // --------------------------------------------------

    if (
      lastSpin &&
      lastSpin.premio !== "VOLVER_A_GIRAR" &&
      !ROULETTE_TEST_MODE
    ) {
      const now = new Date();

      const nextReset =
        getNextRouletteReset(
          lastSpin.createdAt
        );

      if (
        now.getTime() <
        nextReset.getTime()
      ) {
        return NextResponse.json(
          {
            error:
              "La ruleta se reinicia a las 21:00. Volvé mañana.",

            nextReset:
              nextReset.toISOString(),
          },
          {
            status: 403,
          }
        );
      }
    }

    // --------------------------------------------------
    // DESACTIVAR PREMIOS ANTERIORES
    // --------------------------------------------------

    await prisma.ruleta.updateMany({
      where: {
        usuarioId: user.id,
        utilizado: false,
      },

      data: {
        utilizado: true,
      },
    });

    // --------------------------------------------------
    // OBTENER PREMIOS ACTIVOS
    //
    // CAJA_10 y GUAYMALLEN quedan excluidos.
    // --------------------------------------------------

    const premios =
      await prisma.premio.findMany({
        where: {
          activo: true,

          tipo: {
            notIn: [
              "CAJA_10",
              "GUAYMALLEN",
            ],
          },
        },

        orderBy: {
          nombre: "asc",
        },
      });

    // --------------------------------------------------
    // VERIFICAR PREMIOS
    // --------------------------------------------------

    if (premios.length === 0) {
      return NextResponse.json(
        {
          error:
            "No hay premios activos.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // VERIFICAR PROBABILIDADES
    // --------------------------------------------------

    const totalProbabilidad =
      premios.reduce(
        (total, premio) =>
          total +
          Math.max(
            0,
            premio.probabilidad
          ),
        0
      );

    if (totalProbabilidad <= 0) {
      return NextResponse.json(
        {
          error:
            "La suma de las probabilidades debe ser mayor a 0.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // SORTEAR PREMIO
    // --------------------------------------------------
    //
    // Ahora VOLVER_A_GIRAR es un premio real.
    //
    // Si tiene 100% y los demás 0%,
    // va a salir VOLVER_A_GIRAR.
    // --------------------------------------------------

    const premio =
      seleccionarPremio(
        premios
      );

    // --------------------------------------------------
    // GUARDAR GIRO
    // --------------------------------------------------

    await prisma.ruleta.create({
      data: {
        usuarioId:
          user.id,

        premio:
          premio.tipo,

        utilizado: false,
      },
    });

    // --------------------------------------------------
    // RESPUESTA
    // --------------------------------------------------

    return NextResponse.json({
      premio,
    });
  } catch (error) {
    console.error(
      "ERROR POST /api/roulette/spin:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo realizar el giro de la ruleta.",
      },
      {
        status: 500,
      }
    );
  }
}