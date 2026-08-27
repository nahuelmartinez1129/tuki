import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const pedido = await prisma.pedido.findUnique({
      where: {
        id: body.id,
      },
      include: {
        items: true,
      },
    });

    if (!pedido) {
      return NextResponse.json(
        {
          error: "Pedido no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * =====================================================
     * DESCONTAR STOCK
     * =====================================================
     *
     * Solamente cuando pasa de PENDIENTE a CONFIRMADO.
     */

    if (
      body.estado === "CONFIRMADO" &&
      pedido.estado === "PENDIENTE"
    ) {
      for (const item of pedido.items) {
        const producto =
          await prisma.producto.findFirst({
            where: {
              name: item.nombre,
            },
          });

        if (!producto) continue;

        await prisma.producto.update({
          where: {
            id: producto.id,
          },
          data: {
            stock: {
              decrement: item.cantidad,
            },
          },
        });
      }

      for (const item of pedido.items) {
        const producto =
          await prisma.producto.findFirst({
            where: {
              name: item.nombre,
            },
          });

        if (
          producto &&
          producto.stock <= 0
        ) {
          await prisma.producto.update({
            where: {
              id: producto.id,
            },
            data: {
              activo: false,
            },
          });
        }
      }
    }

    /*
     * =====================================================
     * CAJA
     * =====================================================
     *
     * El pedido solamente entra a caja cuando pasa
     * a ENTREGADO.
     *
     * Si ya estaba ENTREGADO, no volvemos a contabilizarlo.
     */

    if (
      body.estado === "ENTREGADO" &&
      pedido.estado !== "ENTREGADO"
    ) {
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
              "No hay una caja abierta. Abrí la caja antes de entregar el pedido.",
          },
          {
            status: 400,
          }
        );
      }

      let montoEfectivo = 0;

      if (
        pedido.metodoPago ===
        "efectivo"
      ) {
        montoEfectivo =
          pedido.total;
      }

      if (
        pedido.metodoPago ===
        "mixto"
      ) {
        montoEfectivo =
          pedido.montoEfectivo ?? 0;
      }

      /*
       * Transferencia:
       *
       * No aumenta el efectivo físico
       * de la caja.
       */

      if (montoEfectivo > 0) {
        await prisma.$transaction([
          prisma.movimientoCaja.create({
            data: {
              tipo: "INGRESO",
              monto: montoEfectivo,
              descripcion:
                `Pedido #${pedido.numero} - ${
                  pedido.metodoPago ===
                  "mixto"
                    ? "Pago mixto"
                    : "Efectivo"
                }`,
              cajaId: caja.id,
            },
          }),

          prisma.caja.update({
            where: {
              id: caja.id,
            },
            data: {
              ...(pedido.metodoPago ===
              "mixto"
                ? {
                    efectivoMixto: {
                      increment:
                        montoEfectivo,
                    },
                  }
                : {
                    efectivoVentas: {
                      increment:
                        montoEfectivo,
                    },
                  }),

              efectivoEsperado:
                caja.efectivoInicial +
                caja.efectivoVentas +
                caja.efectivoMixto +
                montoEfectivo -
                caja.retiros,
            },
          }),
        ]);
      }
    }

    /*
     * =====================================================
     * ACTUALIZAR PEDIDO
     * =====================================================
     */

    const updatedPedido =
      await prisma.pedido.update({
        where: {
          id: body.id,
        },
        data: {
          estado: body.estado,
        },
      });

    return NextResponse.json(
      updatedPedido
    );
  } catch (error) {
    console.error(
      "ERROR ACTUALIZANDO PEDIDO:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error actualizando pedido",
      },
      {
        status: 500,
      }
    );
  }
}