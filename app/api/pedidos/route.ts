import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

type Punto = {
  lat: number;
  lng: number;
};

/**
 * ==========================================
 * POINT IN POLYGON
 * ==========================================
 *
 * Determina si un punto está dentro de un
 * polígono utilizando Ray Casting.
 */
function puntoDentroPoligono(
  punto: Punto,
  poligono: Punto[]
): boolean {
  let dentro = false;

  const x = punto.lng;
  const y = punto.lat;

  for (
    let i = 0, j = poligono.length - 1;
    i < poligono.length;
    j = i++
  ) {
    const xi = poligono[i].lng;
    const yi = poligono[i].lat;

    const xj = poligono[j].lng;
    const yj = poligono[j].lat;

    const intersecta =
      yi > y !== yj > y &&
      x <
        ((xj - xi) * (y - yi)) /
          (yj - yi) +
          xi;

    if (intersecta) {
      dentro = !dentro;
    }
  }

  return dentro;
}

/**
 * ==========================================
 * CONVERTIR POLÍGONO
 * ==========================================
 */
function convertirPoligono(
  poligono: unknown
): Punto[] | null {
  if (!Array.isArray(poligono)) {
    return null;
  }

  const puntos: Punto[] = [];

  for (const punto of poligono) {
    if (
      !punto ||
      typeof punto !== "object"
    ) {
      return null;
    }

    const obj = punto as {
      lat?: unknown;
      lng?: unknown;
    };

    if (
      typeof obj.lat !== "number" ||
      !Number.isFinite(obj.lat) ||
      typeof obj.lng !== "number" ||
      !Number.isFinite(obj.lng)
    ) {
      return null;
    }

    puntos.push({
      lat: obj.lat,
      lng: obj.lng,
    });
  }

  if (puntos.length < 3) {
    return null;
  }

  return puntos;
}

/**
 * ==========================================
 * VALIDAR COORDENADAS
 * ==========================================
 */
function validarPunto(
  valor: unknown
): valor is Punto {
  if (
    !valor ||
    typeof valor !== "object"
  ) {
    return false;
  }

  const punto =
    valor as {
      lat?: unknown;
      lng?: unknown;
    };

  return (
    typeof punto.lat === "number" &&
    Number.isFinite(punto.lat) &&
    punto.lat >= -90 &&
    punto.lat <= 90 &&
    typeof punto.lng === "number" &&
    Number.isFinite(punto.lng) &&
    punto.lng >= -180 &&
    punto.lng <= 180
  );
}

/**
 * ==========================================
 * GET
 * ==========================================
 */
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

/**
 * ==========================================
 * POST
 * ==========================================
 */
export async function POST(
  request: Request
) {
  try {
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
      !body.direccion ||
      !body.items ||
      !Array.isArray(body.items) ||
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
     * 4. VALIDAR UBICACIÓN DE ENTREGA
     * ==========================================
     *
     * El checkout envía las coordenadas
     * obtenidas al verificar la dirección.
     *
     * El servidor vuelve a determinar la zona
     * utilizando los polígonos de PostgreSQL.
     *
     * Esto evita confiar en:
     *
     * zonaId
     * precio de envío
     * compra mínima
     *
     * enviados por el navegador.
     */

    const coordenadasEntrega =
      body.coordenadasEntrega;

    if (
      !validarPunto(
        coordenadasEntrega
      )
    ) {
      return NextResponse.json(
        {
          error:
            "La dirección de entrega no fue verificada correctamente.",
        },
        {
          status: 400,
        }
      );
    }

    const puntoEntrega: Punto = {
      lat:
        coordenadasEntrega.lat,
      lng:
        coordenadasEntrega.lng,
    };

    /*
     * ==========================================
     * 5. BUSCAR ZONA REAL
     * ==========================================
     */

    const zonas =
      await prisma.zonaEnvio.findMany({
        where: {
          activo: true,
        },
        orderBy: [
          {
            orden: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      });

    if (zonas.length === 0) {
      return NextResponse.json(
        {
          error:
            "No hay zonas de envío disponibles.",
        },
        {
          status: 400,
        }
      );
    }

    let zonaEncontrada:
      (typeof zonas)[number] | null =
      null;

    for (const zona of zonas) {
      const poligono =
        convertirPoligono(
          zona.poligono
        );

      if (!poligono) {
        continue;
      }

      if (
        puntoDentroPoligono(
          puntoEntrega,
          poligono
        )
      ) {
        zonaEncontrada =
          zona;

        break;
      }
    }

    /*
     * La dirección está fuera de todas
     * las zonas A-H.
     */

    if (!zonaEncontrada) {
      return NextResponse.json(
        {
          error:
            "La dirección está fuera de nuestras zonas de reparto.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "========== ZONA VALIDADA =========="
    );

    console.log({
      zona:
        zonaEncontrada.nombre,
      precioEnvio:
        zonaEncontrada.precio,
      compraMinima:
        zonaEncontrada.compraMinima,
      coordenadas:
        puntoEntrega,
    });

    /*
     * ==========================================
     * 6. BUSCAR USUARIO
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
     * 7. BUSCAR PREMIO REAL
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
       * Verificar vigencia.
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
     * 8. HAPPY HOUR REAL
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
     * 9. PRODUCTOS REALES
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
     * 10. VALIDAR COMPRA MÍNIMA
     * ==========================================
     *
     * La compra mínima pertenece a la zona.
     *
     * Se valida sobre el subtotal real
     * calculado desde PostgreSQL.
     */

    if (
      subtotal <
      zonaEncontrada.compraMinima
    ) {
      return NextResponse.json(
        {
          error:
            `El pedido mínimo para ${zonaEncontrada.nombre} es de $${zonaEncontrada.compraMinima}.`,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================
     * 11. ENVÍO REAL DE LA ZONA
     * ==========================================
     *
     * IMPORTANTE:
     *
     * Ya NO utilizamos:
     *
     * configuracion.envio
     *
     * para determinar el envío.
     *
     * El precio sale directamente
     * de la zona encontrada.
     */

    let envio =
      zonaEncontrada.precio;

    /*
     * ==========================================
     * 12. DESCUENTOS
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
     * 13. SEGURIDAD DESCUENTO
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
     * 14. TOTAL REAL
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
      zona:
        zonaEncontrada.nombre,
      compraMinima:
        zonaEncontrada.compraMinima,
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
     * 15. VALIDAR PAGO MIXTO
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
       * Deben ser números válidos.
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
       * No permitimos negativos.
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
       * Deben ser números enteros.
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
       *
       * La suma debe coincidir con
       * el TOTAL REAL calculado
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
     * 16. NÚMERO DE PEDIDO
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
     * 17. CREAR PEDIDO
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
     * 18. MARCAR PREMIO UTILIZADO
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
     * 19. TELEGRAM
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

🗺️ <b>Zona:</b> ${
        zonaEncontrada.nombre
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
     * 20. RESPUESTA
     * ==========================================
     */

    console.log(
      "PEDIDO CREADO:",
      pedido
    );

    return NextResponse.json(
      pedido
    );
  } catch (error) {
    console.error(
      "Error creando pedido:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo crear el pedido.",
      },
      {
        status: 500,
      }
    );
  }
}