import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { anonymousId } = await request.json();

  const user = await prisma.usuario.findUnique({
    where: {
      anonymousId,
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
  const diff =
    Date.now() -
    new Date(
      lastSpin.createdAt
    ).getTime();

  const HOURS_24 =
    24 * 60 * 60 * 1000;

  if (diff < HOURS_24) {
    return NextResponse.json(
      {
        error:
          "Debes esperar 24 horas.",
      },
      {
        status: 403,
      }
    );
  }
}
  const premios = await prisma.premio.findMany({
    where: {
      activo: true,
    },
  });

  const premio =
    premios[Math.floor(Math.random() * premios.length)];

  await prisma.ruleta.create({
    data: {
      usuarioId: user.id,
      premio: premio.tipo,
    },
  });

  return NextResponse.json({
    premio,
  });
}