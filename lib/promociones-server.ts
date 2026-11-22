import { prisma } from "@/lib/prisma";
import {
  PREMIOS_SIN_BENEFICIO,
  premioVigente,
  type CuponValido,
  type HappyHourActivo,
  type PremioRuleta,
} from "@/lib/promociones";

/**
 * ==========================================
 * DATOS DE PROMOCIONES (SOLO SERVIDOR)
 * ==========================================
 *
 * Busca en PostgreSQL todo lo que necesita
 * calcularBeneficios(). Lo usan /api/beneficios
 * y /api/pedidos.
 */

/*
 * Premio de la ruleta sin usar y vigente
 * (48 horas desde el giro).
 */
export async function buscarPremioVigente(
  usuarioId: string
) {
  const giros = await prisma.ruleta.findMany({
    where: {
      usuarioId,
      utilizado: false,
      premio: {
        notIn: PREMIOS_SIN_BENEFICIO,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const giro = giros.find((g) =>
    premioVigente(g.createdAt)
  );

  if (!giro) return null;

  const premio = await prisma.premio.findFirst({
    where: {
      tipo: giro.premio,
    },
    orderBy: {
      activo: "desc",
    },
  });

  return {
    id: giro.id,
    createdAt: giro.createdAt,
    tipo: giro.premio,
    nombre: premio?.nombre ?? null,
    valor: premio?.valor ?? null,
  } satisfies PremioRuleta & {
    id: string;
    createdAt: Date;
  };
}

/*
 * Happy Hour activo y dentro de sus fechas.
 */
export async function buscarHappyHourActivo(): Promise<
  (HappyHourActivo & { id: string }) | null
> {
  const now = new Date();

  const happyHour =
    await prisma.happyHour.findFirst({
      where: {
        activo: true,
        AND: [
          {
            OR: [
              { fechaInicio: null },
              { fechaInicio: { lte: now } },
            ],
          },
          {
            OR: [
              { fechaFin: null },
              { fechaFin: { gte: now } },
            ],
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (!happyHour) return null;

  return {
    id: happyHour.id,
    tipo: happyHour.tipo,
    titulo: happyHour.titulo,
    valor: happyHour.valor,
  };
}

/*
 * ==========================================
 * PEDIDOS EN LA MISMA UBICACIÓN
 * ==========================================
 *
 * Cambiar de teléfono es fácil, pero el pedido
 * se entrega en una dirección real. Buscamos
 * pedidos anteriores (no cancelados) hechos:
 *
 * - a menos de RADIO_METROS de las coordenadas
 *   de entrega, o
 * - con la misma dirección escrita (para los
 *   pedidos viejos, que no guardaban
 *   coordenadas).
 */

const RADIO_METROS = 40;

export type UbicacionEntrega = {
  lat: number;
  lng: number;
  direccion?: string | null;
};

function distanciaMetros(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) *
      Math.cos(b.lat * rad) *
      Math.sin(dLng / 2) ** 2;

  return 6371000 * 2 * Math.asin(Math.sqrt(h));
}

/*
 * "Calle 44 1796" == "calle 44  1796 " == "Calle 44, 1796"
 */
export function normalizarDireccion(
  direccion: string
) {
  return direccion
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export async function buscarPedidosEnUbicacion(
  ubicacion: UbicacionEntrega
) {
  // Caja de ~100 m alrededor del punto;
  // después filtramos por distancia real.
  const margenLat = 0.001;
  const margenLng = 0.0013;

  const cercanos = await prisma.pedido.findMany({
    where: {
      estado: { not: "CANCELADO" },
      latitud: {
        gte: ubicacion.lat - margenLat,
        lte: ubicacion.lat + margenLat,
      },
      longitud: {
        gte: ubicacion.lng - margenLng,
        lte: ubicacion.lng + margenLng,
      },
    },
    select: {
      id: true,
      telefono: true,
      premio: true,
      createdAt: true,
      latitud: true,
      longitud: true,
    },
  });

  const porDistancia = cercanos.filter(
    (p) =>
      p.latitud !== null &&
      p.longitud !== null &&
      distanciaMetros(ubicacion, {
        lat: p.latitud,
        lng: p.longitud,
      }) <= RADIO_METROS
  );

  const direccion = ubicacion.direccion
    ? normalizarDireccion(ubicacion.direccion)
    : "";

  if (!direccion) {
    return porDistancia;
  }

  // Pedidos viejos (sin coordenadas)
  const viejos = await prisma.pedido.findMany({
    where: {
      estado: { not: "CANCELADO" },
      latitud: null,
      direccion: { not: null },
    },
    select: {
      id: true,
      telefono: true,
      premio: true,
      createdAt: true,
      latitud: true,
      longitud: true,
      direccion: true,
    },
  });

  const porDireccion = viejos
    .filter(
      (p) =>
        p.direccion &&
        normalizarDireccion(p.direccion) ===
          direccion
    )
    .map(({ direccion: _d, ...resto }) => resto);

  return [...porDistancia, ...porDireccion];
}

/*
 * Primera compra: ni el teléfono ni la
 * ubicación de entrega tienen pedidos
 * anteriores (sin contar los cancelados).
 */
export async function esPrimeraCompra(
  telefono: string,
  ubicacion?: UbicacionEntrega | null
) {
  const pedidos = await prisma.pedido.count({
    where: {
      telefono,
      estado: {
        not: "CANCELADO",
      },
    },
  });

  if (pedidos > 0) return false;

  if (!ubicacion) return true;

  const enUbicacion =
    await buscarPedidosEnUbicacion(ubicacion);

  return enUbicacion.length === 0;
}

/*
 * Valida un código de cupón para un usuario.
 */
export async function validarCupon(
  codigo: string,
  usuarioId: string | null,
  ubicacion?: UbicacionEntrega | null
): Promise<
  | { ok: true; cupon: CuponValido & { id: string } }
  | { ok: false; error: string }
> {
  const limpio = codigo.trim().toUpperCase();

  if (!limpio) {
    return { ok: false, error: "Ingresá un cupón." };
  }

  const cupon = await prisma.cupon.findUnique({
    where: {
      codigo: limpio,
    },
  });

  if (!cupon || !cupon.activo) {
    return {
      ok: false,
      error: "El cupón no existe o no está activo.",
    };
  }

  if (cupon.usosActuales >= cupon.maxUsos) {
    return {
      ok: false,
      error: "El cupón ya alcanzó su límite de usos.",
    };
  }

  if (!usuarioId) {
    return {
      ok: false,
      error: "Registrate para usar cupones.",
    };
  }

  const yaUsado = await prisma.cuponUso.findFirst({
    where: {
      cuponId: cupon.id,
      usuarioId,
    },
  });

  if (yaUsado) {
    return {
      ok: false,
      error: "Ya usaste este cupón.",
    };
  }

  /*
   * El mismo cupón ya se usó en esta
   * dirección con otro teléfono.
   */
  if (ubicacion) {
    const enUbicacion =
      await buscarPedidosEnUbicacion(ubicacion);

    const usadoEnDireccion = enUbicacion.some(
      (p) =>
        p.premio?.startsWith(
          `Cupón ${cupon.codigo}`
        )
    );

    if (usadoEnDireccion) {
      return {
        ok: false,
        error:
          "Este cupón ya se usó en esta dirección.",
      };
    }
  }

  return {
    ok: true,
    cupon: {
      id: cupon.id,
      codigo: cupon.codigo,
      tipo: cupon.tipo,
      valor: cupon.valor,
      compraMinima: cupon.compraMinima,
      topeDescuento: cupon.topeDescuento,
    },
  };
}

/*
 * Un premio de ruleta por dirección cada 24 h:
 * si OTRO teléfono ya usó un premio de la
 * ruleta en esta casa, no se aplica (evita
 * registrar varios números para girar varias
 * veces y pedir a la misma dirección).
 */
export function ruletaUsadaEnDireccion(
  pedidos: {
    telefono: string;
    premio: string | null;
    createdAt: Date;
  }[],
  telefono: string
) {
  const hace24h = Date.now() - 24 * 60 * 60 * 1000;

  return pedidos.some(
    (p) =>
      p.telefono !== telefono &&
      Boolean(p.premio?.startsWith("Ruleta:")) &&
      p.createdAt.getTime() > hace24h
  );
}
