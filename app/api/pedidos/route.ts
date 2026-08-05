import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
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

console.log("========== PEDIDO NUEVO ==========");
console.log(JSON.stringify(body, null, 2));

console.log("DESCUENTO RECIBIDO:", body.descuento);
console.log("ENVIO RECIBIDO:", body.envio);
console.log("PREMIO RECIBIDO:", body.premio);
console.log("HAPPY HOUR RECIBIDO:", body.happyHour);

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

  let descuento =
    body.descuento;

  let envio =
    body.envio;

  const caja =
    body.items.find(
      (item: any) =>
        item.nombre
          .toLowerCase()
          .includes("caja")
    );

  const happyHour =
    await prisma.happyHour.findFirst({
      where: {
        activo: true,
      },
    });

  console.log(
    "HAPPY HOUR AL CREAR PEDIDO:",
    happyHour
  );

  if (happyHour) {
    if (
      happyHour.tipo ===
      "ENVIO_GRATIS"
    ) {
      envio = 0;
    }

   if (
  happyHour.tipo ===
  "DESCUENTO"
) {
  descuento +=
    body.subtotal *
    ((happyHour.valor ?? 0) / 100);
}

if (
  happyHour.tipo ===
  "GUAYMALLEN"
) {
  //descuento +=
  //  happyHour.valor ?? 0;
}

if (
  happyHour.tipo ===
  "CAJA_10" &&
  caja
) {
  descuento +=
    caja.precio * 0.1;
}
  }

  if (
    descuento >
    body.subtotal
  ) {
    descuento =
      body.subtotal;
  }

  const total =
    Math.max(
      body.subtotal -
        descuento +
        envio,
      0
    );

  console.log(
    "TOTAL FINAL:",
    {
      subtotal:
        body.subtotal,
      descuento,
      envio,
      total,
    }
  );

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
console.log("========== ANTES DE GUARDAR ==========");
console.log("descuento:", descuento);
console.log("envio:", envio);
console.log("total:", total);
console.log("happyHour DB:", happyHour);
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
          descuento,

        envio:
          envio,

        premio:
          body.premio,

        happyHour:
          happyHour?.titulo ??
          null,

        total:
          total,

        observaciones:
          body.observaciones,

        items: {
          create:
            body.items.map(
              (item: any) => ({
                nombre:
                  item.nombre,
                cantidad:
                  item.cantidad,
                precio:
                  item.precio,
              })
            ),
        },
      },

      include: {
        items: true,
      },
    });

    await fetch(
  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      parse_mode: "HTML",
      text: `
🛒 <b>NUEVO PEDIDO #${pedido.numero}</b>

👤 <b>Cliente:</b> ${pedido.nombre}
📞 <b>Teléfono:</b> ${pedido.telefono}
📍 <b>Dirección:</b> ${pedido.direccion}

💳 <b>Método de pago:</b> ${
        pedido.metodoPago === "efectivo"
          ? "💵 Efectivo"
          : pedido.metodoPago === "transferencia"
          ? "🏦 Transferencia"
          : "No especificado"
      }

📦 <b>PRODUCTOS</b>

${pedido.items
  .map(
    (item) =>
      `• ${item.nombre} x${item.cantidad}`
  )
  .join("\n")}

${
  pedido.premio
    ? `\n🎁 <b>Premio:</b> ${pedido.premio}`
    : ""
}

${
  pedido.happyHour
    ? `\n🔥 <b>Happy Hour:</b> ${pedido.happyHour}`
    : ""
}

💰 <b>Subtotal:</b> $${pedido.subtotal}
💸 <b>Descuento:</b> -$${pedido.descuento}
🚚 <b>Envío:</b> $${pedido.envio}

✅ <b>TOTAL:</b> $${pedido.total}
      `,
    }),
  }
);

  console.log(
    "PEDIDO CREADO:",
    pedido
  );

  return NextResponse.json(
    pedido
  );
}