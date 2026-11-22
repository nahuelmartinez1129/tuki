import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  RULETA_MODO_PRUEBA,
  estadoRuleta,
} from "@/lib/ruleta";
import { sesionCliente } from "@/lib/auth";
import { limitar } from "@/lib/rate-limit";

// ======================================================
// SELECCIÓN DEL PREMIO SEGÚN PROBABILIDAD
// ======================================================

function seleccionarPremio<
  T extends { probabilidad: number }
>(premios: T[]): T {
  const totalProbabilidad =
    premios.reduce(
      (total, premio) =>
        total +
        Math.max(
          0,
          premio.probabilidad
        ),
      0
    );

  if (totalProbabilidad <= 0) {
    throw new Error(
      "La suma de las probabilidades debe ser mayor a 0."
    );
  }

  const random =
    Math.random() *
    totalProbabilidad;

  let acumulado = 0;

  for (const premio of premios) {
    acumulado += Math.max(
      0,
      premio.probabilidad
    );

    if (random < acumulado) {
      return premio;
    }
  }

  return premios[premios.length - 1];
}

// ======================================================
// POST
// GIRAR RULETA
// ======================================================

export async function POST(
  request: Request
) {
  try {
    // --------------------------------------------------
    // SESIÓN
    //
    // Quién gira sale SOLO de la cookie firmada
    // del registro. Mandar otro teléfono en el
    // cuerpo no sirve de nada.
    // --------------------------------------------------

    const sesion = await sesionCliente();

    if (!sesion) {
      return NextResponse.json(
        {
          error:
            "Ingresá con tu celular para girar.",
          needsLogin: true,
        },
        {
          status: 401,
        }
      );
    }

    const phone = sesion.phone;

    // --------------------------------------------------
    // LÍMITE POR IP
    //
    // Aunque registre varios números (modo
    // incógnito), desde una misma conexión se
    // puede girar como mucho 6 veces cada 24 h
    // (alcanza para una familia + "Volvé a girar").
    // --------------------------------------------------

    if (!RULETA_MODO_PRUEBA) {
      const bloqueado = limitar(
        request,
        "ruleta-giro",
        6,
        24 * 60 * 60
      );
      if (bloqueado) return bloqueado;
    }

    // --------------------------------------------------
    // BUSCAR USUARIO
    // --------------------------------------------------

    const user =
      await prisma.usuario.findUnique({
        where: {
          phone,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error: "Usuario no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // PREMIOS ANTERIORES
    //
    // No se anulan: cada premio vence solo a las
    // 48 horas (lib/promociones.ts) y en cada
    // pedido se usa uno solo.
    // --------------------------------------------------

    // --------------------------------------------------
    // OBTENER PREMIOS ACTIVOS
    //
    // CAJA_10 queda excluido.
    // --------------------------------------------------

    const premios =
      await prisma.premio.findMany({
        where: {
          activo: true,

          tipo: {
            notIn: [
              "CAJA_10",
            ],
          },
        },

        orderBy: {
          nombre: "asc",
        },
      });

    // --------------------------------------------------
    // VERIFICAR PREMIOS
    // --------------------------------------------------

    if (premios.length === 0) {
      return NextResponse.json(
        {
          error:
            "No hay premios activos.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // VERIFICAR PROBABILIDADES
    // --------------------------------------------------

    const totalProbabilidad =
      premios.reduce(
        (total, premio) =>
          total +
          Math.max(
            0,
            premio.probabilidad
          ),
        0
      );

    if (totalProbabilidad <= 0) {
      return NextResponse.json(
        {
          error:
            "La suma de las probabilidades debe ser mayor a 0.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // SORTEAR PREMIO
    // --------------------------------------------------
    //
    // Ahora VOLVER_A_GIRAR es un premio real.
    //
    // Si tiene 100% y los demás 0%,
    // va a salir VOLVER_A_GIRAR.
    // --------------------------------------------------

    const premio =
      seleccionarPremio(
        premios
      );

    // --------------------------------------------------
    // VERIFICAR HORARIO Y GUARDAR GIRO
    //
    // Se reinicia todos los días a las 21:00 de
    // Argentina (lib/ruleta.ts).
    //
    // El bloqueo por usuario evita que dos
    // pedidos simultáneos (doble toque) giren
    // dos veces.
    // --------------------------------------------------

    const bloqueo =
      await prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`;

          const lastSpin =
            await tx.ruleta.findFirst({
              where: {
                usuarioId: user.id,
              },

              orderBy: {
                createdAt: "desc",
              },
            });

          const estado =
            estadoRuleta(lastSpin);

          if (
            !estado.puedeGirar &&
            !RULETA_MODO_PRUEBA
          ) {
            return estado;
          }

          await tx.ruleta.create({
            data: {
              usuarioId:
                user.id,

              premio:
                premio.tipo,

              utilizado: false,
            },
          });

          return null;
        }
      );

    if (bloqueo) {
      return NextResponse.json(
        {
          error:
            "Ya giraste esta noche. La ruleta se reinicia todos los días a las 21:00.",

          nextReset:
            bloqueo.proximoReinicio?.toISOString(),
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------
    // RESPUESTA
    // --------------------------------------------------

    return NextResponse.json({
      premio,
    });
  } catch (error) {
    console.error(
      "ERROR POST /api/roulette/spin:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo realizar el giro de la ruleta.",
      },
      {
        status: 500,
      }
    );
  }
}