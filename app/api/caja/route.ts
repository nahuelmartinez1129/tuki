import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const caja = await prisma.caja.findFirst({
      where: {
        estado: "ABIERTA",
      },
      orderBy: {
        abiertaAt: "desc",
      },
      include: {
        movimientos: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!caja) {
      return NextResponse.json({
        abierta: false,
        caja: null,
      });
    }

    const efectivoEsperado =
      caja.efectivoInicial +
      caja.efectivoVentas +
      caja.efectivoMixto -
      caja.retiros;

    return NextResponse.json({
      abierta: true,
      caja: {
        ...caja,
        efectivoEsperado,
      },
    });
  } catch (error) {
    console.error(
      "ERROR OBTENIENDO CAJA:",
      error
    );

    return NextResponse.json(
      {
        error: "Error obteniendo la caja",
      },
      {
        status: 500,
      }
    );
  }
}