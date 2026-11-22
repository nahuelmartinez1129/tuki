import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  const { abierto } =
    await request.json();

  const config =
    await prisma.configuracion.findFirst();

  if (!config) {
    return NextResponse.json(
      { error: "No encontrado" },
      { status: 404 }
    );
  }

  await prisma.configuracion.update({
    where: {
      id: config.id,
    },
    data: {
      abierto,
    },
  });

  return NextResponse.json({
    success: true,
  });
}