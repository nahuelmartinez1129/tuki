import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { anonymousId } = await request.json();

  const existing = await prisma.usuario.findUnique({
    where: {
      anonymousId,
    },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  const user = await prisma.usuario.create({
    data: {
      anonymousId,
    },
  });

  return NextResponse.json(user);
}