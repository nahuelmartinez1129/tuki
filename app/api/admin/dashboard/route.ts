import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const hoy = new Date();

  hoy.setHours(0, 0, 0, 0);

  const pedidosHoy =
    await prisma.pedido.count({
      where: {
        createdAt: {
          gte: hoy,
        },
      },
    });

  const pedidos =
    await prisma.pedido.findMany({
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
        estado:
          "ENTREGADO",
      },
    })
  ).reduce(
    (acc, pedido) =>
      acc + pedido.total,
    0
  );

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
  });
}