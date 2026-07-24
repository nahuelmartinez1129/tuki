import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const body =
    await request.json();

  const pedido =
  await prisma.pedido.findUnique({
    where: {
      id: body.id,
    },
    include: {
      items: true,
    },
  });

if (!pedido) {
  return NextResponse.json(
    { error: "Pedido no encontrado" },
    { status: 404 }
  );
}
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
          decrement:
            item.cantidad,
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

const updatedPedido =
  await prisma.pedido.update({
    where: {
      id: body.id,
    },
    data: {
      estado:
        body.estado,
    },
  });

return NextResponse.json(
  updatedPedido
);

  return NextResponse.json(
    pedido
  );
}