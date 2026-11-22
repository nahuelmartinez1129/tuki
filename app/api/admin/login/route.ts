import { cookies } from "next/headers";
import { limitar } from "@/lib/rate-limit";
import {
  COOKIE_ADMIN,
  DURACION_ADMIN_SEGUNDOS,
  crearSesion,
  igualesSeguro,
  opcionesCookie,
} from "@/lib/sesion";

/*
 * ==========================================
 * LOGIN DEL ADMIN
 * ==========================================
 *
 * - Máximo 5 intentos cada 15 minutos por IP.
 * - La sesión es una cookie firmada (no se
 *   puede fabricar a mano) que vence en 12 h.
 */
export async function POST(request: Request) {
  const bloqueado = limitar(
    request,
    "admin-login",
    5,
    15 * 60
  );
  if (bloqueado) return bloqueado;

  const usuarioEsperado =
    process.env.ADMIN_USER ?? "matias";
  const passwordEsperada =
    process.env.ADMIN_PASSWORD ?? "";

  let username = "";
  let password = "";

  try {
    const body = await request.json();
    username = String(body.username ?? "");
    password = String(body.password ?? "");
  } catch {
    // cuerpo inválido: cae en credenciales incorrectas
  }

  const valido =
    passwordEsperada.length > 0 &&
    // Se comparan los dos siempre (sin cortar
    // antes) para no revelar cuál falló.
    [
      igualesSeguro(username, usuarioEsperado),
      igualesSeguro(password, passwordEsperada),
    ].every(Boolean);

  if (!valido) {
    return Response.json(
      { success: false },
      { status: 401 }
    );
  }

  let token: string;

  try {
    token = await crearSesion(
      "admin",
      { usuario: username },
      DURACION_ADMIN_SEGUNDOS
    );
  } catch (error) {
    console.error("Login admin:", error);

    return Response.json(
      {
        success: false,
        error:
          "Falta configurar AUTH_SECRET en el servidor.",
      },
      { status: 500 }
    );
  }

  const jar = await cookies();

  jar.set(
    COOKIE_ADMIN,
    token,
    opcionesCookie(DURACION_ADMIN_SEGUNDOS, "strict")
  );

  // Cookie vieja e insegura ("admin=true")
  jar.delete("admin");

  return Response.json({ success: true });
}
