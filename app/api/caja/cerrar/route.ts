import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const body = await request.json();

    const efectivoContado = Number(
      body.efectivoContado
    );

    if (
      !Number.isFinite(
        efectivoContado
      ) ||
      efectivoContado < 0
    ) {
      return NextResponse.json(
        {
          error:
            "El efectivo contado no es válido",
        },
        {
          status: 400,
        }
      );
    }

    const caja =
      await prisma.caja.findFirst({
        where: {
          estado: "ABIERTA",
        },
        orderBy: {
          abiertaAt: "desc",
        },
      });

    if (!caja) {
      return NextResponse.json(
        {
          error:
            "No hay una caja abierta",
        },
        {
          status: 400,
        }
      );
    }

    const efectivoEsperado =
      caja.efectivoInicial +
      caja.efectivoVentas +
      caja.efectivoMixto -
      caja.retiros;

    const diferencia =
      efectivoContado -
      efectivoEsperado;

    const cajaCerrada =
      await prisma.caja.update({
        where: {
          id: caja.id,
        },
        data: {
          efectivoEsperado,
          efectivoContado,
          diferencia,
          estado: "CERRADA",
          cerradaAt: new Date(),
        },
      });

    return NextResponse.json(
      cajaCerrada
    );
  } catch (error) {
    console.error(
      "ERROR CERRANDO CAJA:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error cerrando la caja",
      },
      {
        status: 500,
      }
    );
  }
}