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
    await prisma.usuario.updateMany({
  where: {
    anonymousId: body.anonymousId,
  },
  data: {
    phone: body.telefono,
  },
});
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

for (const item of body.items) {
  const producto =
    await prisma.producto.findFirst({
      where: {
        name: item.nombre,
      },
    });

  if (!producto) {
    return NextResponse.json(
      {
        error: `${item.nombre} no existe`,
      },
      {
        status: 400,
      }
    );
  }

  if (
    producto.stock <
    item.cantidad
  ) {
    return NextResponse.json(
      {
        error: `No hay stock suficiente de ${item.nombre}`,
      },
      {
        status: 400,
      }
    );
  }
}

  const pedido =
    await prisma.pedido.create({
      data: {
        numero,

        nombre: body.nombre,
        telefono:
          body.telefono,
        direccion:
          body.direccion,

          metodoPago:
        body.metodoPago,

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
   for (const item of body.items) {
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

for (const item of body.items) {
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

  return NextResponse.json(
    pedido
  );
}