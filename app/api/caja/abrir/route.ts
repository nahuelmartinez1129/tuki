import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const efectivoInicial = Number(
      body.efectivoInicial
    );

    if (
      !Number.isFinite(
        efectivoInicial
      ) ||
      efectivoInicial < 0
    ) {
      return NextResponse.json(
        {
          error:
            "El efectivo inicial no es válido",
        },
        {
          status: 400,
        }
      );
    }

    const cajaExistente =
      await prisma.caja.findFirst({
        where: {
          estado: "ABIERTA",
        },
      });

    if (cajaExistente) {
      return NextResponse.json(
        {
          error:
            "Ya existe una caja abierta",
          caja: cajaExistente,
        },
        {
          status: 400,
        }
      );
    }

    const caja =
      await prisma.caja.create({
        data: {
          efectivoInicial,
          efectivoVentas: 0,
          efectivoMixto: 0,
          retiros: 0,
          efectivoEsperado:
            efectivoInicial,
          estado: "ABIERTA",
        },
      });

    return NextResponse.json(
      caja
    );
  } catch (error) {
    console.error(
      "ERROR ABRIENDO CAJA:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error abriendo la caja",
      },
      {
        status: 500,
      }
    );
  }
}