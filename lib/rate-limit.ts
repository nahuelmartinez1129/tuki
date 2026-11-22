import { NextResponse } from "next/server";

/**
 * ==========================================
 * LÍMITE DE INTENTOS POR IP
 * ==========================================
 *
 * Ventana fija en memoria. Alcanza para un solo
 * servidor (el VPS). Si se reinicia la app, los
 * contadores vuelven a cero.
 */

type Contador = {
  cantidad: number;
  reinicia: number;
};

const contadores = new Map<string, Contador>();

/*
 * IP real del cliente. Detrás de nginx:
 * - X-Real-IP la pone nginx (no la controla el cliente).
 * - En X-Forwarded-For, la última IP es la que
 *   agregó nuestro propio proxy.
 */
export function ipCliente(request: Request) {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;

  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  return forwarded?.at(-1) ?? "desconocida";
}

/*
 * Devuelve una respuesta 429 si se pasó del
 * límite, o null si puede seguir.
 */
export function limitar(
  request: Request,
  accion: string,
  maximo: number,
  ventanaSegundos: number
) {
  const ahora = Date.now();
  const clave = `${accion}:${ipCliente(request)}`;

  // Limpieza ocasional para no acumular memoria.
  if (contadores.size > 5000) {
    for (const [k, c] of contadores) {
      if (c.reinicia < ahora) contadores.delete(k);
    }
  }

  const actual = contadores.get(clave);

  if (!actual || actual.reinicia < ahora) {
    contadores.set(clave, {
      cantidad: 1,
      reinicia: ahora + ventanaSegundos * 1000,
    });
    return null;
  }

  actual.cantidad += 1;

  if (actual.cantidad > maximo) {
    const segundos = Math.ceil((actual.reinicia - ahora) / 1000);

    return NextResponse.json(
      {
        error: `Demasiados intentos. Probá de nuevo en ${Math.ceil(
          segundos / 60
        )} min.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(segundos) },
      }
    );
  }

  return null;
}
