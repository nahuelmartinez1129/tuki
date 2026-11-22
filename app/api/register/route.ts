import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { limitar } from "@/lib/rate-limit";
import {
  COOKIE_CLIENTE,
  DURACION_CLIENTE_SEGUNDOS,
  crearSesion,
  opcionesCookie,
} from "@/lib/sesion";

/*
 * ==========================================
 * REGISTRO / INGRESO DEL CLIENTE
 * ==========================================
 *
 * Devuelve una cookie firmada con el teléfono.
 * La ruleta usa SOLO esa cookie para saber
 * quién gira (no lo que mande el navegador).
 *
 * Límites por IP: 5 ingresos cada 10 min y
 * 3 teléfonos NUEVOS por día.
 */
export async function POST(request: Request) {
  const bloqueado = limitar(
    request,
    "registro",
    5,
    10 * 60
  );
  if (bloqueado) return bloqueado;

  let body: { nombre?: unknown; phone?: unknown } = {};

  try {
    body = await request.json();
  } catch {
    // cae en la validación
  }

  const nombre = String(body.nombre ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 60);

  // Solo dígitos: "223 555-1234" = "2235551234"
  const phone = String(body.phone ?? "").replace(
    /\D/g,
    ""
  );

  if (nombre.length < 2) {
    return NextResponse.json(
      { error: "Ingresá tu nombre." },
      { status: 400 }
    );
  }

  if (phone.length < 10 || phone.length > 13) {
    return NextResponse.json(
      {
        error:
          "Ingresá tu celular con característica, sin 0 ni 15 (ej: 2291 555555).",
      },
      { status: 400 }
    );
  }

  let usuario = await prisma.usuario.findUnique({
    where: { phone },
  });

  const isNewUser = !usuario;

  if (!usuario) {
    const limiteNuevos = limitar(
      request,
      "registro-nuevo",
      3,
      24 * 60 * 60
    );
    if (limiteNuevos) return limiteNuevos;

    usuario = await prisma.usuario.create({
      data: { nombre, phone },
    });
  } else if (!usuario.nombre) {
    usuario = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { nombre },
    });
  }

  let token: string;

  try {
    token = await crearSesion(
      "cliente",
      { phone },
      DURACION_CLIENTE_SEGUNDOS
    );
  } catch (error) {
    console.error("Registro:", error);

    return NextResponse.json(
      { error: "Error del servidor." },
      { status: 500 }
    );
  }

  (await cookies()).set(
    COOKIE_CLIENTE,
    token,
    opcionesCookie(DURACION_CLIENTE_SEGUNDOS, "lax")
  );

  return NextResponse.json({
    success: true,
    isNewUser,
    nombre: usuario.nombre ?? nombre,
    phone,
  });
}
