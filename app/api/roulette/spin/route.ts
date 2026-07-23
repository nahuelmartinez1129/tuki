import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const { anonymousId } =
    await request.json();

  const user =
    await prisma.usuario.findUnique({
      where: {
        anonymousId,
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

  const phone = user.phone;

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

  if (lastSpin) {
    const now = new Date();

    const nextReset =
      new Date(
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

    if (now < nextReset) {
      return NextResponse.json(
        {
          error:
            "La ruleta se reinicia a las 21:00. Volvé mañana.",
        },
        {
          status: 403,
        }
      );
    }
  }

  // DESACTIVAR TODOS LOS PREMIOS ANTERIORES
  await prisma.ruleta.updateMany(
    {
      where: {
        usuarioId: user.id,
        utilizado: false,
      },

      data: {
        utilizado: true,
      },
    }
  );

  const premios =
    await prisma.premio.findMany({
      where: {
        activo: true,
      },
    });

  const premio =
    premios[
      Math.floor(
        Math.random() *
          premios.length
      )
    ];

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