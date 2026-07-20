import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const anonymousId =
    searchParams.get("anonymousId");

  if (!anonymousId) {
    return NextResponse.json(null);
  }

  const user = await prisma.usuario.findUnique({
    where: {
      anonymousId,
    },
  });

  if (!user) {
    return NextResponse.json(null);
  }

  const reward = await prisma.ruleta.findFirst({
    where: {
      usuarioId: user.id,
      utilizado: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(reward);
}