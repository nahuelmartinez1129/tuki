import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const premios = await prisma.premio.findMany({
      where: {
        activo: true,
        tipo: {
          notIn: [
            "CAJA_10",
          ],
        },
      },
      orderBy: {
        nombre: "asc",
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        valor: true,
        probabilidad: true,
        activo: true,
      },
    });

    return NextResponse.json(premios);
  } catch (error) {
    console.error(
      "Error obteniendo premios de ruleta:",
      error
    );

    return NextResponse.json(
      {
        error: "No se pudieron cargar los premios",
      },
      {
        status: 500,
      }
    );
  }
}