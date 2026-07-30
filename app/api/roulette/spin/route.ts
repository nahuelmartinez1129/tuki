import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ARGENTINA_OFFSET_MS =
  3 * 60 * 60 * 1000;

function getArgentinaParts(date: Date) {
  const argentinaTime =
    new Date(
      date.getTime() -
        ARGENTINA_OFFSET_MS
    );

  return {
    year: argentinaTime.getUTCFullYear(),
    month: argentinaTime.getUTCMonth(),
    day: argentinaTime.getUTCDate(),
  };
}

function getNextRouletteReset(
  lastSpin: Date
) {
  const {
    year,
    month,
    day,
  } = getArgentinaParts(
    lastSpin
  );

  // 21:00 Argentina = 00:00 UTC del día siguiente.
  // Como queremos las 21:00 del día siguiente al giro,
  // avanzamos dos días desde la fecha UTC "argentina".
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

export async function POST(
  request: Request
) {
  const { phone } =
    await request.json();

  if (!phone) {
    return NextResponse.json(
      {
        error:
          "phone requerido",
      },
      {
        status: 400,
      }
    );
  }

  const user =
    await prisma.usuario.findUnique({
      where: {
        phone,
      },
    });

  if (!user) {
    return NextResponse.json(
      {
        error:
          "Usuario no encontrado",
      },
      {
        status: 404,
      }
    );
  }

  const lastSpin =
    await prisma.ruleta.findFirst({
      where: {
        usuarioId: user.id,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  if (lastSpin) {
    const now =
      new Date();

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

  // Desactivar premios anteriores
  await prisma.ruleta.updateMany({
    where: {
      usuarioId:
        user.id,

      utilizado:
        false,
    },

    data: {
      utilizado:
        true,
    },
  });

  const premios =
    await prisma.premio.findMany({
      where: {
        activo: true,
      },
    });

  if (
    premios.length === 0
  ) {
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

  const premio =
    premios[
      Math.floor(
        Math.random() *
          premios.length
      )
    ];

  await prisma.ruleta.create({
    data: {
      usuarioId:
        user.id,

      premio:
        premio.tipo,
    },
  });

  return NextResponse.json({
    premio,
  });
}