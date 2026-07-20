import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const pedidos =
    await prisma.pedido.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return NextResponse.json(
    pedidos
  );
}

export async function POST(
  request: Request
) {
  const body =
    await request.json();
    const configuracion =
  await prisma.configuracion.findFirst();

if (!configuracion?.abierto) {
  return NextResponse.json(
    {
      error:
        "TUKI está descansando 🌙 Volvemos pronto.",
    },
    {
      status: 403,
    }
  );
}

  const ultimoPedido =
    await prisma.pedido.findFirst({
      orderBy: {
        numero: "desc",
      },
    });

  const numero =
    (ultimoPedido?.numero ?? 0) + 1;

  const pedido =
    await prisma.pedido.create({
      data: {
        numero,

        nombre: body.nombre,
        telefono:
          body.telefono,
        direccion:
          body.direccion,

        subtotal:
          body.subtotal,

        descuento:
          body.descuento,

        envio:
          body.envio,

          premio: body.premio,
happyHour: body.happyHour,

        total:
          body.total,

        observaciones:
          body.observaciones,

        items: {
  create: body.items.map(
    (item: any) => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
    })
  ),
},
      },

      include: {
        items: true,
      },
    });

  return NextResponse.json(
    pedido
  );
}