import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKIE_ADMIN,
  COOKIE_CLIENTE,
  leerSesion,
  type SesionAdmin,
  type SesionCliente,
} from "@/lib/sesion";

/**
 * ==========================================
 * SESIONES EN LAS RUTAS DE LA API
 * ==========================================
 */

export async function sesionAdmin() {
  const token = (await cookies()).get(COOKIE_ADMIN)?.value;
  return leerSesion<SesionAdmin>("admin", token);
}

/*
 * Para usar al principio de una ruta de admin:
 *
 *   const noAutorizado = await exigirAdmin();
 *   if (noAutorizado) return noAutorizado;
 *
 * (El middleware ya bloquea estas rutas; esto es
 * una segunda barrera por si algún día se cambia
 * el middleware.)
 */
export async function exigirAdmin() {
  if (await sesionAdmin()) return null;

  return NextResponse.json(
    { error: "No autorizado." },
    { status: 401 }
  );
}

/*
 * Cliente "logueado": su teléfono viene de una
 * cookie firmada por el servidor al registrarse,
 * no de lo que mande el navegador.
 */
export async function sesionCliente() {
  const token = (await cookies()).get(COOKIE_CLIENTE)?.value;
  return leerSesion<SesionCliente>("cliente", token);
}
