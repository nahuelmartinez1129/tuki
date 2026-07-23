import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request
) {
  const { searchParams } =
    new URL(request.url);

  const anonymousId =
    searchParams.get(
      "anonymousId"
    );

  if (!anonymousId) {
    return NextResponse.json(
      null
    );
  }

  const user =
    await prisma.usuario.findUnique(
      {
        where: {
          anonymousId,
        },
      }
    );

  if (!user) {
    return NextResponse.json(
      null
    );
  }

  const reward =
    await prisma.ruleta.findFirst(
      {
        where: {
          usuarioId: user.id,
          utilizado: false,
        },

        orderBy: {
          createdAt: "desc",
        },
      }
    );

  if (!reward) {
    return NextResponse.json(
      null
    );
  }

  const now = new Date();

  const nextReset =
    new Date(
      reward.createdAt
    );

  nextReset.setDate(
    nextReset.getDate() +
      1
  );

  nextReset.setHours(
    21,
    0,
    0,
    0
  );

  if (now >= nextReset) {
    return NextResponse.json(
      null
    );
  }

  return NextResponse.json(
    reward
  );
}