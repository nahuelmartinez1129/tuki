import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const {
    nombre,
    phone,
  } = await request.json();

  // ¿Existe alguien con ese teléfono?
  const existingUser =
    await prisma.usuario.findUnique({
      where: {
        phone,
      },
    });

  // SI YA EXISTE EL TELÉFONO
  if (existingUser) {
    return NextResponse.json({
      success: true,
      isNewUser: false,
      nombre:
        existingUser.nombre,
      phone:
        existingUser.phone,
    });
  }

  // Crear usuario nuevo
  await prisma.usuario.create({
    data: {
      nombre,
      phone,
    },
  });

  return NextResponse.json({
    success: true,
    isNewUser: true,
    nombre,
    phone,
  });
}