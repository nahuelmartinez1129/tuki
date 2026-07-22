import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const {
    nombre,
    phone,
    anonymousId,
  } = await request.json();

  const existingUser =
    await prisma.usuario.findFirst({
      where: {
        OR: [
          { phone },
          { anonymousId },
        ],
      },
    });

  if (existingUser) {
    await prisma.usuario.update({
      where: {
        id: existingUser.id,
      },
      data: {
        nombre,
        phone,
      },
    });

    return NextResponse.json({
      success: true,
    });
  }

  await prisma.usuario.create({
    data: {
      nombre,
      phone,
      anonymousId,
    },
  });

  return NextResponse.json({
    success: true,
  });
}