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

  return NextResponse.json(pedidos);
}

export async function POST(
  request: Request
) {
  const body = await request.json();

  console.log(
    "========== PEDIDO NUEVO =========="
  );

  console.log(
    JSON.stringify(body, null, 2)
  );

  /*
   * ==========================================
   * 1. VERIFICAR QUE TUKI ESTÉ ABIERTO
   * ==========================================
   */

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

  /*
   * ==========================================
   * 2. VALIDAR DATOS BÁSICOS
   * ==========================================
   */

  if (
    !body.nombre ||
    !body.telefono ||
    !body.items ||
    body.items.length === 0
  ) {
    return NextResponse.json(
      {
        error:
          "Faltan datos del pedido.",
      },
      {
        status: 400,
      }
    );
  }

  /*
   * ==========================================
   * 3. BUSCAR USUARIO POR TELÉFONO
   * ==========================================
   */

  const usuario =
    await prisma.usuario.findUnique({
      where: {
        phone: body.telefono,
      },
    });

  /*
   * ==========================================
   * 4. BUSCAR PREMIO REAL EN LA DB
   * ==========================================
   */

  let reward = null;

  if (usuario) {
    reward =
      await prisma.ruleta.findFirst({
        where: {
          usuarioId:
            usuario.id,

          utilizado: false,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    /*
     * Verificar que el premio
     * todavía esté dentro de su período.
     */

    if (reward) {
      const now = new Date();

      const nextReset =
        new Date(
          reward.createdAt
        );

      nextReset.setDate(
        nextReset.getDate() + 1
      );

      nextReset.setHours(
        21,
        0,
        0,
        0
      );

      if (
        now >= nextReset
      ) {
        reward = null;
      }
    }
  }

  /*
   * ==========================================
   * 5. BUSCAR HAPPY HOUR REAL EN LA DB
   * ==========================================
   */

  const happyHour =
    await prisma.happyHour.findFirst({
      where: {
        activo: true,
      },
    });

  /*
   * ==========================================
   * 6. BUSCAR PRODUCTOS REALES
   * ==========================================
   */

  let subtotal = 0;

  const itemsParaCrear = [];

  for (
    const item of body.items
  ) {
    if (
      !item.nombre ||
      !item.cantidad ||
      item.cantidad <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Producto o cantidad inválida.",
        },
        {
          status: 400,
        }
      );
    }

    const producto =
      await prisma.producto.findFirst({
        where: {
          name: item.nombre,
        },
      });

    if (!producto) {
      return NextResponse.json(
        {
          error:
            `${item.nombre} no existe.`,
        },
        {
          status: 400,
        }
      );
    }

    if (!producto.activo) {
      return NextResponse.json(
        {
          error:
            `${item.nombre} no está disponible.`,
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
          error:
            `No hay stock suficiente de ${item.nombre}.`,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * IMPORTANTE:
     * El precio sale de la DB.
     */

    subtotal +=
      producto.price *
      item.cantidad;

    itemsParaCrear.push({
      nombre:
        producto.name,

      cantidad:
        item.cantidad,

      precio:
        producto.price,
    });
  }

  /*
   * ==========================================
   * 7. ENVÍO REAL DESDE CONFIGURACIÓN
   * ==========================================
   */

  let envio =
    configuracion.envio;

  /*
   * ==========================================
   * 8. CALCULAR DESCUENTOS EN EL SERVIDOR
   * ==========================================
   */

  let descuento = 0;

  /*
   * Buscar si hay una caja.
   */

  const caja =
    itemsParaCrear.find(
      (item) =>
        item.nombre
          .toLowerCase()
          .includes("caja")
    );

  /*
   * ==========================================
   * HAPPY HOUR
   * ==========================================
   */

  if (happyHour) {

    /*
     * Envío gratis
     */

    if (
      happyHour.tipo ===
      "ENVIO_GRATIS"
    ) {
      envio = 0;
    }

    /*
     * 10% de descuento
     */

    if (
      happyHour.tipo ===
      "DESCUENTO"
    ) {
      descuento +=
        subtotal *
        ((happyHour.valor ?? 0) / 100);
    }

    /*
     * 10% en Caja Misteriosa
     */

    if (
      happyHour.tipo ===
        "CAJA_10" &&
      caja
    ) {
      descuento +=
        caja.precio *
        ((
          happyHour.valor ?? 10
        ) / 100) *
        caja.cantidad;
    }

    /*
     * GUAYMALLEN
     * No modifica el precio.
     * Solamente queda registrado
     * como beneficio.
     */

    if (
      happyHour.tipo ===
      "GUAYMALLEN"
    ) {
      // Beneficio gratuito.
      // Se registra en el pedido.
    }

    /*
     * GOMITAS
     * No modifica el precio.
     */

    if (
      happyHour.tipo ===
      "GOMITAS"
    ) {
      // Beneficio gratuito.
    }
  }

  /*
   * ==========================================
   * PREMIO DE RULETA
   * ==========================================
   */

  if (
    reward &&
    reward.premio !==
      "SIN_PREMIO"
  ) {

    /*
     * Envío gratis
     */

    if (
      reward.premio ===
      "ENVIO_GRATIS"
    ) {
      envio = 0;
    }

    /*
     * 10% OFF
     */

    if (
      reward.premio ===
      "DESCUENTO"
    ) {
      descuento +=
        subtotal * 0.10;
    }

    /*
     * 10% Caja Misteriosa
     */

    if (
      reward.premio ===
        "CAJA_10" &&
      caja
    ) {
      descuento +=
        caja.precio *
        0.10 *
        caja.cantidad;
    }

    /*
     * Guaymallén gratis
     */

    if (
      reward.premio ===
      "GUAYMALLEN"
    ) {
      // Beneficio gratuito.
    }

    /*
     * Gomitas gratis
     */

    if (
      reward.premio ===
      "GOMITAS"
    ) {
      // Beneficio gratuito.
    }
  }

  /*
   * ==========================================
   * 9. SEGURIDAD DEL DESCUENTO
   * ==========================================
   */

  if (
    descuento >
    subtotal
  ) {
    descuento =
      subtotal;
  }

  /*
   * ==========================================
   * 10. CALCULAR TOTAL REAL
   * ==========================================
   */

  const total =
    Math.max(
      subtotal -
        descuento +
        envio,
      0
    );

  console.log(
    "========== CÁLCULO REAL =========="
  );

  console.log({
    subtotal,
    descuento,
    envio,
    total,
    premio:
      reward?.premio ??
      null,
    happyHour:
      happyHour?.tipo ??
      null,
  });

  /*
   * ==========================================
   * 11. NÚMERO DE PEDIDO
   * ==========================================
   */

  const ultimoPedido =
    await prisma.pedido.findFirst({
      orderBy: {
        numero: "desc",
      },
    });

  const numero =
    (ultimoPedido?.numero ?? 0) + 1;

  /*
   * ==========================================
   * 12. CREAR PEDIDO
   * ==========================================
   */

  const pedido =
    await prisma.pedido.create({
      data: {
        numero,

        nombre:
          body.nombre,

        telefono:
          body.telefono,

        direccion:
          body.direccion,

        metodoPago:
          body.metodoPago,

        subtotal,

        descuento,

        envio,

        total,

        premio:
          reward?.premio ??
          null,

        happyHour:
          happyHour?.titulo ??
          null,

        observaciones:
          body.observaciones,

        items: {
          create:
            itemsParaCrear,
        },
      },

      include: {
        items: true,
      },
    });

  /*
   * ==========================================
   * 13. MARCAR PREMIO COMO UTILIZADO
   * ==========================================
   */

  if (reward) {
    await prisma.ruleta.update({
      where: {
        id: reward.id,
      },

      data: {
        utilizado: true,
      },
    });
  }

  /*
   * ==========================================
   * 14. TELEGRAM
   * ==========================================
   */

  try {
    const mensaje = `
🛒 <b>NUEVO PEDIDO #${pedido.numero}</b>

👤 <b>Cliente:</b> ${pedido.nombre}
📞 <b>Teléfono:</b> ${pedido.telefono}
📍 <b>Dirección:</b> ${
      pedido.direccion ??
      "No especificada"
    }

💳 <b>Método de pago:</b> ${
      pedido.metodoPago ===
      "efectivo"
        ? "💵 Efectivo"
        : pedido.metodoPago ===
          "transferencia"
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
`;

    await sendTelegramMessage(
      mensaje
    );

  } catch (error) {
    console.error(
      "Error enviando pedido a Telegram:",
      error
    );
  }

  console.log(
    "PEDIDO CREADO:",
    pedido
  );

  return NextResponse.json(
    pedido
  );
}