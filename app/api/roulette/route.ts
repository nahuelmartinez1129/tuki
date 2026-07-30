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
    hour: argentinaTime.getUTCHours(),
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
  // La ruleta vuelve a habilitarse a las 21:00
  // del día siguiente al último giro.
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

export async function GET(
  request: Request
) {
  const { searchParams } =
    new URL(request.url);

  const phone =
    searchParams.get("phone");

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

  const user =
    await prisma.usuario.findUnique({
      where: {
        phone,
      },
    });

  if (!user) {
    return NextResponse.json({
      canSpin: true,
    });
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

  if (!lastSpin) {
    return NextResponse.json({
      canSpin: true,
    });
  }

  const now =
    new Date();

  const nextReset =
    getNextRouletteReset(
      lastSpin.createdAt
    );

  if (
    now.getTime() >=
    nextReset.getTime()
  ) {
    return NextResponse.json({
      canSpin: true,
    });
  }

  return NextResponse.json({
    canSpin: false,

    prize:
      lastSpin.premio,

    secondsLeft:
      Math.max(
        0,
        Math.floor(
          (
            nextReset.getTime() -
            now.getTime()
          ) / 1000
        )
      ),

    nextReset:
      nextReset.toISOString(),
  });
}