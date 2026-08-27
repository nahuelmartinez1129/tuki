import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getFechaArgentina(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getInicioDiaArgentina() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = partes.find(
    (p) => p.type === "year"
  )?.value;

  const month = partes.find(
    (p) => p.type === "month"
  )?.value;

  const day = partes.find(
    (p) => p.type === "day"
  )?.value;

  return new Date(
    `${year}-${month}-${day}T00:00:00-03:00`
  );
}

export async function GET() {
  try {
    /*
     * =====================================================
     * HOY
     * =====================================================
     */

    const hoy = getInicioDiaArgentina();

    /*
     * =====================================================
     * PEDIDOS DE HOY
     * =====================================================
     */

    const pedidosHoy =
      await prisma.pedido.count({
        where: {
          createdAt: {
            gte: hoy,
          },
        },
      });

    /*
     * =====================================================
     * VENTAS ENTREGADAS DE HOY
     * =====================================================
     *
     * Solamente contamos pedidos ENTREGADOS
     * como ventas realizadas.
     */

    const pedidosEntregadosHoy =
      await prisma.pedido.findMany({
        where: {
          createdAt: {
            gte: hoy,
          },
          estado: "ENTREGADO",
        },
        select: {
          total: true,
          subtotal: true,
          descuento: true,
          envio: true,
          metodoPago: true,
          montoEfectivo: true,
          montoTransferencia: true,
        },
      });

    /*
     * =====================================================
     * FACTURACIÓN DE HOY
     * =====================================================
     */

    const facturacion =
      pedidosEntregadosHoy.reduce(
        (acc, pedido) =>
          acc + pedido.total,
        0
      );

    /*
     * =====================================================
     * DESCUENTOS Y ENVÍOS
     * =====================================================
     */

    const descuentos =
      pedidosEntregadosHoy.reduce(
        (acc, pedido) =>
          acc + pedido.descuento,
        0
      );

    const envios =
      pedidosEntregadosHoy.reduce(
        (acc, pedido) =>
          acc + pedido.envio,
        0
      );

    /*
     * =====================================================
     * FACTURACIÓN BRUTA
     * =====================================================
     *
     * Total antes de aplicar descuentos.
     *
     * total = subtotal - descuento + envio
     *
     * Por lo tanto:
     *
     * bruto = total + descuento
     */

    const facturacionBruta =
      pedidosEntregadosHoy.reduce(
        (acc, pedido) =>
          acc +
          pedido.total +
          pedido.descuento,
        0
      );

    /*
     * =====================================================
     * MÉTODOS DE PAGO
     * =====================================================
     */

    let efectivo = 0;
    let transferencias = 0;
    let mixtos = 0;

    for (const pedido of pedidosEntregadosHoy) {
      if (
        pedido.metodoPago ===
        "efectivo"
      ) {
        efectivo +=
          pedido.total;
      }

      if (
        pedido.metodoPago ===
        "transferencia"
      ) {
        transferencias +=
          pedido.total;
      }

      if (
        pedido.metodoPago ===
        "mixto"
      ) {
        /*
         * Un pedido mixto se divide
         * entre efectivo y transferencia.
         */

        efectivo +=
          pedido.montoEfectivo ?? 0;

        transferencias +=
          pedido.montoTransferencia ?? 0;

        mixtos +=
          pedido.total;
      }
    }

    /*
     * =====================================================
     * HISTORIAL DE FACTURACIÓN
     * =====================================================
     *
     * Agrupamos todos los pedidos entregados
     * por día.
     */

    const pedidosEntregados =
      await prisma.pedido.findMany({
        where: {
          estado: "ENTREGADO",
        },
        select: {
          total: true,
          subtotal: true,
          descuento: true,
          envio: true,
          metodoPago: true,
          montoEfectivo: true,
          montoTransferencia: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const historialMap =
      new Map<
        string,
        {
          fecha: string;
          pedidos: number;
          facturacion: number;
          descuentos: number;
          envios: number;
          efectivo: number;
          transferencias: number;
          mixtos: number;
        }
      >();

    for (const pedido of pedidosEntregados) {
      const fecha =
        getFechaArgentina(
          pedido.createdAt
        );

      const actual =
        historialMap.get(fecha);

      /*
       * Calculamos los medios de pago
       * del pedido actual.
       */

      let efectivoPedido = 0;
      let transferenciaPedido = 0;
      let mixtoPedido = 0;

      if (
        pedido.metodoPago ===
        "efectivo"
      ) {
        efectivoPedido =
          pedido.total;
      }

      if (
        pedido.metodoPago ===
        "transferencia"
      ) {
        transferenciaPedido =
          pedido.total;
      }

      if (
        pedido.metodoPago ===
        "mixto"
      ) {
        efectivoPedido =
          pedido.montoEfectivo ?? 0;

        transferenciaPedido =
          pedido.montoTransferencia ?? 0;

        mixtoPedido =
          pedido.total;
      }

      if (actual) {
        actual.pedidos += 1;

        actual.facturacion +=
          pedido.total;

        actual.descuentos +=
          pedido.descuento;

        actual.envios +=
          pedido.envio;

        actual.efectivo +=
          efectivoPedido;

        actual.transferencias +=
          transferenciaPedido;

        actual.mixtos +=
          mixtoPedido;
      } else {
        historialMap.set(
          fecha,
          {
            fecha,
            pedidos: 1,

            facturacion:
              pedido.total,

            descuentos:
              pedido.descuento,

            envios:
              pedido.envio,

            efectivo:
              efectivoPedido,

            transferencias:
              transferenciaPedido,

            mixtos:
              mixtoPedido,
          }
        );
      }
    }

    const historialFacturacion =
      Array.from(
        historialMap.values()
      );

    /*
     * =====================================================
     * RESTO DE ESTADÍSTICAS
     * =====================================================
     */

    const usuarios =
      await prisma.usuario.count();

    const premios =
      await prisma.ruleta.count({
        where: {
          utilizado: true,
        },
      });

    const pendientes =
      await prisma.pedido.count({
        where: {
          estado: {
            in: [
              "PENDIENTE",
              "CONFIRMADO",
              "PREPARANDO",
              "EN_CAMINO",
            ],
          },
        },
      });

    const ultimosPedidos =
      await prisma.pedido.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

    /*
     * =====================================================
     * RESPUESTA
     * =====================================================
     */

    return NextResponse.json({
      /*
       * Pedidos
       */
      pedidosHoy,

      /*
       * Facturación
       */
      ventasRealizadas:
        pedidosEntregadosHoy.length,

      facturacion,

      facturacionBruta,

      descuentos,

      envios,

      /*
       * Métodos de pago
       */
      efectivo,

      transferencias,

      mixtos,

      /*
       * Otras estadísticas
       */
      usuarios,

      premios,

      pendientes,

      ultimosPedidos,

      /*
       * Historial
       */
      historialFacturacion,
    });
  } catch (error) {
    console.error(
      "ERROR DASHBOARD:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error al cargar el dashboard",
      },
      {
        status: 500,
      }
    );
  }
}