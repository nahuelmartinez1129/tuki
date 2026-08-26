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
  /*
   * =====================================================
   * HOY
   * =====================================================
   */

  const hoy = getInicioDiaArgentina();

  const pedidosHoy =
    await prisma.pedido.count({
      where: {
        createdAt: {
          gte: hoy,
        },
      },
    });

  const facturacion =
    (
      await prisma.pedido.findMany({
        where: {
          createdAt: {
            gte: hoy,
          },
          estado: "ENTREGADO",
        },
        select: {
          total: true,
        },
      })
    ).reduce(
      (acc, pedido) =>
        acc + pedido.total,
      0
    );

  /*
   * =====================================================
   * HISTORIAL DE FACTURACIÓN
   * =====================================================
   *
   * Se toman todos los pedidos entregados.
   * No se elimina ningún pedido.
   */

  const pedidosEntregados =
    await prisma.pedido.findMany({
      where: {
        estado: "ENTREGADO",
      },
      select: {
        total: true,
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
      }
    >();

  for (const pedido of pedidosEntregados) {
    const fecha =
      getFechaArgentina(
        pedido.createdAt
      );

    const actual =
      historialMap.get(fecha);

    if (actual) {
      actual.pedidos += 1;
      actual.facturacion +=
        pedido.total;
    } else {
      historialMap.set(fecha, {
        fecha,
        pedidos: 1,
        facturacion:
          pedido.total,
      });
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

  return NextResponse.json({
    pedidosHoy,
    facturacion,
    usuarios,
    premios,
    pendientes,
    ultimosPedidos,

    historialFacturacion,
  });
}