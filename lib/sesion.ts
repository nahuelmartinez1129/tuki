/**
 * ==========================================
 * SESIONES FIRMADAS
 * ==========================================
 *
 * Tokens del tipo  <datos>.<firma>  firmados con
 * HMAC-SHA256 y la clave AUTH_SECRET (que solo
 * existe en el servidor). Sin la clave nadie
 * puede fabricar ni modificar una sesión.
 *
 * Usa Web Crypto, así que funciona tanto en el
 * middleware como en las rutas de la API.
 */

export const COOKIE_ADMIN = "tuki_admin";
export const COOKIE_CLIENTE = "tuki_cliente";

export const DURACION_ADMIN_SEGUNDOS = 12 * 60 * 60; // 12 horas
export const DURACION_CLIENTE_SEGUNDOS = 180 * 24 * 60 * 60; // 180 días

type TipoSesion = "admin" | "cliente";

export type SesionAdmin = {
  usuario: string;
};

export type SesionCliente = {
  phone: string;
};

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array) {
  let binario = "";
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function desdeBase64url(texto: string) {
  const base64 =
    texto.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((texto.length + 3) % 4);
  const binario = atob(base64);
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

function obtenerClave() {
  const secreto = process.env.AUTH_SECRET;

  // Sin clave (o muy corta) no hay sesiones:
  // todo lo protegido queda bloqueado.
  if (!secreto || secreto.length < 32) {
    return null;
  }

  return secreto;
}

async function firmarTexto(texto: string, secreto: string) {
  const clave = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const firma = await crypto.subtle.sign(
    "HMAC",
    clave,
    encoder.encode(texto)
  );

  return base64url(new Uint8Array(firma));
}

/*
 * Comparación en tiempo constante (no revela
 * cuántos caracteres coinciden).
 */
export function igualesSeguro(a: string, b: string) {
  const largo = Math.max(a.length, b.length);
  let diferencia = a.length ^ b.length;

  for (let i = 0; i < largo; i++) {
    diferencia |=
      (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }

  return diferencia === 0;
}

export async function crearSesion(
  tipo: TipoSesion,
  datos: SesionAdmin | SesionCliente,
  duracionSegundos: number
) {
  const secreto = obtenerClave();

  if (!secreto) {
    throw new Error(
      "Falta AUTH_SECRET en el .env (mínimo 32 caracteres)."
    );
  }

  const contenido = base64url(
    encoder.encode(
      JSON.stringify({
        t: tipo,
        d: datos,
        exp:
          Math.floor(Date.now() / 1000) +
          duracionSegundos,
      })
    )
  );

  return `${contenido}.${await firmarTexto(contenido, secreto)}`;
}

export async function leerSesion<T>(
  tipo: TipoSesion,
  token: string | undefined | null
): Promise<T | null> {
  const secreto = obtenerClave();

  if (!secreto || !token) return null;

  const partes = token.split(".");
  if (partes.length !== 2) return null;

  const [contenido, firma] = partes;

  const esperada = await firmarTexto(contenido, secreto);
  if (!igualesSeguro(firma, esperada)) return null;

  try {
    const datos = JSON.parse(
      new TextDecoder().decode(desdeBase64url(contenido))
    );

    if (datos.t !== tipo) return null;

    if (
      typeof datos.exp !== "number" ||
      datos.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return datos.d as T;
  } catch {
    return null;
  }
}

/*
 * Opciones de las cookies de sesión.
 * httpOnly: el JavaScript de la página no puede
 * leerlas (protege contra robo por XSS).
 * secure: solo viajan por HTTPS en producción
 * (COOKIE_SECURE=false lo desactiva si el sitio
 * todavía no tiene HTTPS).
 */
export function opcionesCookie(
  maxAge: number,
  sameSite: "strict" | "lax"
) {
  return {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production" &&
      process.env.COOKIE_SECURE !== "false",
    sameSite,
    path: "/",
    maxAge,
  };
}
