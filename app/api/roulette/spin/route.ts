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