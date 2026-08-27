import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const monto = Number(
      body.monto
    );

    const descripcion =
      body.descripcion ||
      "Retiro de efectivo";

    if (
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "El monto del retiro no es válido",
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

    const efectivoDisponible =
      caja.efectivoInicial +
      caja.efectivoVentas +
      caja.efectivoMixto -
      caja.retiros;

    if (
      monto >
      efectivoDisponible
    ) {
      return NextResponse.json(
        {
          error:
            "El retiro supera el efectivo disponible en caja",
          efectivoDisponible,
        },
        {
          status: 400,
        }
      );
    }

    const nuevoRetiro =
      await prisma.$transaction(
        async (tx) => {
          const movimiento =
            await tx.movimientoCaja.create(
              {
                data: {
                  tipo: "RETIRO",
                  monto,
                  descripcion,
                  cajaId: caja.id,
                },
              }
            );

          const nuevaCaja =
            await tx.caja.update({
              where: {
                id: caja.id,
              },
              data: {
                retiros: {
                  increment: monto,
                },
                efectivoEsperado:
                  efectivoDisponible -
                  monto,
              },
            });

          return {
            movimiento,
            caja: nuevaCaja,
          };
        }
      );

    return NextResponse.json(
      nuevoRetiro
    );
  } catch (error) {
    console.error(
      "ERROR REGISTRANDO RETIRO:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error registrando retiro",
      },
      {
        status: 500,
      }
    );
  }
}