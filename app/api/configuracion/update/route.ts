import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  const body =
    await request.json();

  const configuracion =
    await prisma.configuracion.findFirst();

  if (!configuracion) {
    return NextResponse.json(
      {
        error: "Configuración no encontrada",
      },
      {
        status: 404,
      }
    );
  }

  const updated =
    await prisma.configuracion.update({
      where: {
        id: configuracion.id,
      },
      data: {
        abierto: body.abierto,
        envio: body.envio,
      },
    });

  return NextResponse.json(updated);
}