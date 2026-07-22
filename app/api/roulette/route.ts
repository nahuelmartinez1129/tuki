import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const anonymousId = searchParams.get("anonymousId");

  if (!anonymousId) {
    return NextResponse.json(
      { error: "anonymousId requerido" },
      { status: 400 }
    );
  }

  const user = await prisma.usuario.findUnique({
    where: {
      anonymousId,
    },
  });
  const phone = user?.phone;

  if (!user) {
    return NextResponse.json({
      canSpin: true,
    });
  }

const lastSpin =
  await prisma.ruleta.findFirst({
    where: phone
      ? {
          usuario: {
            phone,
          },
        }
      : {
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

  const now = new Date();

const nextReset = new Date(
  lastSpin.createdAt
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
    prize: lastSpin.premio,
    secondsLeft: Math.floor(
  (
    nextReset.getTime() -
    now.getTime()
  ) / 1000
),
  });
}

export async function POST(request: Request) {
  const { anonymousId, premio } = await request.json();

  const user = await prisma.usuario.findUnique({
    where: {
      anonymousId,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 }
    );
  }

  const spin = await prisma.ruleta.create({
    data: {
      usuarioId: user.id,
      premio,
    },
  });

  return NextResponse.json(spin);
}