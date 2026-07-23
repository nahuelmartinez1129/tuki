import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
 const { phone } =
  await request.json();

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
      usuario: {
        phone,
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  if (lastSpin) {
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

console.log(
  "TIMEZONE VPS:",
  Intl.DateTimeFormat().resolvedOptions().timeZone
);

console.log(
  "HORA VPS:",
  new Date().toString()
);

console.log(
  "HORA ARGENTINA:",
  now.toString()
);

console.log(
  "PROXIMO RESET:",
  nextReset.toString()
);

console.log(
  "PUEDE GIRAR:",
  now >= nextReset
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