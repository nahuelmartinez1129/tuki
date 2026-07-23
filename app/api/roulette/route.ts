import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    return NextResponse.json({
      canSpin: true,
    });
  }

  const lastSpin =
    await prisma.ruleta.findFirst({
      where: {
        usuario: {
          phone,
        },
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

  const now = new Date(
  new Date().toLocaleString(
    "en-US",
    {
      timeZone:
        "America/Argentina/Buenos_Aires",
    }
  )
);

const nextReset =
  new Date(
    new Date(
      lastSpin.createdAt
    ).toLocaleString(
      "en-US",
      {
        timeZone:
          "America/Argentina/Buenos_Aires",
      }
    )
  );
  nextReset.setDate(
    nextReset.getDate() + 1
  );

  nextReset.setHours(
    21,
    0,
    0,
    0
  );

  if (now >= nextReset) {
    return NextResponse.json({
      canSpin: true,
    });
  }

  return NextResponse.json({
    canSpin: false,
    prize:
      lastSpin.premio,
    secondsLeft:
      Math.floor(
        (
          nextReset.getTime() -
          now.getTime()
        ) / 1000
      ),
  });
}

export async function POST(
  request: Request
) {
  const {
    phone,
    premio,
  } =
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

  let user =
    await prisma.usuario.findUnique({
      where: {
        phone,
      },
    });

  // Si no existe, lo creamos
  if (!user) {
    user =
      await prisma.usuario.create({
        data: {
          phone,
        },
      });
  }

  const spin =
    await prisma.ruleta.create({
      data: {
        usuarioId:
          user.id,
        premio,
      },
    });

  return NextResponse.json(
    spin
  );
}