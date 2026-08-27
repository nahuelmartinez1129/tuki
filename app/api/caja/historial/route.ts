import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cajas =
      await prisma.caja.findMany({
        where: {
          estado: "CERRADA",
        },
        orderBy: {
          cerradaAt: "desc",
        },
        include: {
          movimientos: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    return NextResponse.json(
      cajas
    );
  } catch (error) {
    console.error(
      "ERROR OBTENIENDO HISTORIAL DE CAJAS:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error obteniendo historial de cajas",
      },
      {
        status: 500,
      }
    );
  }
}