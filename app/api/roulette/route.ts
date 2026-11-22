import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  RULETA_MODO_PRUEBA,
  estadoRuleta,
} from "@/lib/ruleta";
import { sesionCliente } from "@/lib/auth";

export const dynamic = "force-dynamic";

/*
 * ======================================================
 * GET
 * ¿El usuario puede girar la ruleta?
 *
 * Se reinicia todos los días a las 21:00 de
 * Argentina (ver lib/ruleta.ts).
 * ======================================================
 */
export async function GET() {
  /*
   * El teléfono sale de la sesión firmada
   * (se crea al registrarse), no de la URL.
   */
  const sesion = await sesionCliente();

  if (!sesion) {
    return NextResponse.json({
      canSpin: false,
      needsLogin: true,
    });
  }

  const phone = sesion.phone;

  const user =
    await prisma.usuario.findUnique({
      where: {
        phone,
      },
    });

  if (!user) {
    return NextResponse.json({
      canSpin: true,
    });
  }

  // ======================================================
  // MODO PRUEBA (ROULETTE_TEST_MODE=true)
  // ======================================================

  if (RULETA_MODO_PRUEBA) {
    return NextResponse.json({
      canSpin: true,
      testMode: true,
    });
  }

  // ======================================================
  // ÚLTIMO GIRO
  // ======================================================

  const lastSpin =
    await prisma.ruleta.findFirst({
      where: {
        usuarioId: user.id,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const estado =
    estadoRuleta(lastSpin);

  if (estado.puedeGirar) {
    return NextResponse.json({
      canSpin: true,
    });
  }

  return NextResponse.json({
    canSpin: false,

    prize:
      lastSpin?.premio,

    secondsLeft:
      estado.segundosRestantes,

    nextReset:
      estado.proximoReinicio?.toISOString(),
  });
}
