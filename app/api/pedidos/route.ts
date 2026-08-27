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

  console.log(
    "========== PEDIDO NUEVO =========="
  );

  console.log(
    JSON.stringify(
      body,
      null,
      2
    )
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
   * 3. VALIDAR MÉTODO DE PAGO
   * ==========================================
   */

  const metodosValidos = [
    "efectivo",
    "transferencia",
    "mixto",
    "mercado-pago",
  ];

  const metodoPago =
    body.metodoPago;

  if (
    !metodosValidos.includes(
      metodoPago
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Método de pago inválido.",
      },
      {
        status: 400,
      }
    );
  }

  /*
   * ==========================================
   * 4. BUSCAR USUARIO
   * ==========================================
   */

  const usuario =
    await prisma.usuario.findUnique({
      where: {
        phone:
          body.telefono,
      },
    });

  /*
   * ==========================================
   * 5. BUSCAR PREMIO REAL
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
          createdAt:
            "desc",
        },
      });

    /*
     * Verificar vigencia
     */

    if (reward) {
      const now =
        new Date();

      const nextReset =
        new Date(
          reward.createdAt
        );

      nextReset.setDate(
        nextReset.getDate() +
          1
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
   * 6. HAPPY HOUR REAL
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
   * 7. PRODUCTOS REALES
   * ==========================================
   */

  let subtotal = 0;

  const itemsParaCrear: {
    nombre: string;
    cantidad: number;
    precio: number;
  }[] = [];

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
          name:
            item.nombre,
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

    if (
      !producto.activo
    ) {
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
     * PRECIO REAL DE LA DB
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
   * 8. ENVÍO REAL
   * ==========================================
   */

  let envio =
    configuracion.envio;

  /*
   * ==========================================
   * 9. DESCUENTOS
   * ==========================================
   */

  let descuento = 0;

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
        subtotal *
        ((happyHour.valor ??
          0) /
          100);
    }

    if (
      happyHour.tipo ===
        "CAJA_10" &&
      caja
    ) {
      descuento +=
        caja.precio *
        caja.cantidad *
        ((
          happyHour.valor ??
          10
        ) /
          100);
    }

    /*
     * Guaymallén:
     * beneficio gratuito.
     */

    if (
      happyHour.tipo ===
      "GUAYMALLEN"
    ) {
      // No modifica el total.
    }

    /*
     * Gomitas:
     * beneficio gratuito.
     */

    if (
      happyHour.tipo ===
      "GOMITAS"
    ) {
      // No modifica el total.
    }
  }

  /*
   * ==========================================
   * PREMIO RULETA
   * ==========================================
   */

  if (
    reward &&
    reward.premio !==
      "SIN_PREMIO"
  ) {
    if (
      reward.premio ===
      "ENVIO_GRATIS"
    ) {
      envio = 0;
    }

    if (
      reward.premio ===
      "DESCUENTO"
    ) {
      descuento +=
        subtotal * 0.1;
    }

    if (
      reward.premio ===
        "CAJA_10" &&
      caja
    ) {
      descuento +=
        caja.precio *
        caja.cantidad *
        0.1;
    }

    /*
     * Guaymallén
     */

    if (
      reward.premio ===
      "GUAYMALLEN"
    ) {
      // Beneficio gratuito.
    }

    /*
     * Gomitas
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
   * 10. SEGURIDAD DESCUENTO
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
   * 11. TOTAL REAL
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
   * 12. VALIDAR PAGO MIXTO
   * ==========================================
   */

  let montoEfectivo:
    number | null = null;

  let montoTransferencia:
    number | null = null;

  if (
    metodoPago ===
    "mixto"
  ) {
    montoEfectivo =
      Number(
        body.montoEfectivo
      );

    montoTransferencia =
      Number(
        body.montoTransferencia
      );

    /*
     * Deben ser números válidos
     */

    if (
      !Number.isFinite(
        montoEfectivo
      ) ||
      !Number.isFinite(
        montoTransferencia
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Los importes del pago mixto no son válidos.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * No permitimos negativos
     */

    if (
      montoEfectivo < 0 ||
      montoTransferencia < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Los importes no pueden ser negativos.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Deben ser números enteros
     */

    if (
      !Number.isInteger(
        montoEfectivo
      ) ||
      !Number.isInteger(
        montoTransferencia
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Los importes deben ser números enteros.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * SEGURIDAD:
     * la suma tiene que coincidir
     * con el TOTAL REAL calculado
     * por el servidor.
     */

    if (
      montoEfectivo +
        montoTransferencia !==
      total
    ) {
      return NextResponse.json(
        {
          error:
            "Los importes del pago mixto no coinciden con el total del pedido.",
        },
        {
          status: 400,
        }
      );
    }
  }

  /*
   * ==========================================
   * 13. NÚMERO DE PEDIDO
   * ==========================================
   */

  const ultimoPedido =
    await prisma.pedido.findFirst({
      orderBy: {
        numero: "desc",
      },
    });

  const numero =
    (ultimoPedido?.numero ??
      0) + 1;

  /*
   * ==========================================
   * 14. CREAR PEDIDO
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

        metodoPago,

        montoEfectivo,

        montoTransferencia,

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
   * 15. MARCAR PREMIO UTILIZADO
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
   * 16. TELEGRAM
   * ==========================================
   */

  try {
    let informacionPago =
      "No especificado";

    if (
      pedido.metodoPago ===
      "efectivo"
    ) {
      informacionPago =
        "💵 Efectivo";
    }

    if (
      pedido.metodoPago ===
      "transferencia"
    ) {
      informacionPago =
        "🏦 Transferencia";
    }

    if (
      pedido.metodoPago ===
      "mixto"
    ) {
      informacionPago = `
💵 Efectivo: $${pedido.montoEfectivo ?? 0}
🏦 Transferencia: $${pedido.montoTransferencia ?? 0}
`;
    }

    const mensaje = `
🛒 <b>NUEVO PEDIDO #${pedido.numero}</b>

👤 <b>Cliente:</b> ${pedido.nombre}
📞 <b>Teléfono:</b> ${pedido.telefono}
📍 <b>Dirección:</b> ${
      pedido.direccion ??
      "No especificada"
    }

💳 <b>Método de pago:</b>
${informacionPago}

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

  /*
   * ==========================================
   * 17. RESPUESTA
   * ==========================================
   */

  console.log(
    "PEDIDO CREADO:",
    pedido
  );

  return NextResponse.json(
    pedido
  );
}