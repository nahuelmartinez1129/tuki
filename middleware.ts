import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_ADMIN,
  leerSesion,
  type SesionAdmin,
} from "@/lib/sesion";

/**
 * ==========================================
 * PROTECCIÓN DEL ADMIN
 * ==========================================
 *
 * Todo lo que no figure como PÚBLICO en
 * esRutaPublica() requiere sesión de admin
 * (cookie firmada, ver lib/sesion.ts).
 *
 * Así, si mañana se agrega una ruta nueva de
 * la API, queda protegida por defecto.
 */

type Regla = {
  // Ruta exacta o prefijo terminado en "/*"
  ruta: string;
  // Métodos públicos (vacío = todos)
  metodos?: string[];
};

const RUTAS_PUBLICAS: Regla[] = [
  // Login del admin
  { ruta: "/api/admin/login", metodos: ["POST"] },
  { ruta: "/api/admin/logout", metodos: ["POST"] },

  // Tienda
  { ruta: "/api/menu", metodos: ["GET"] },
  { ruta: "/api/configuracion", metodos: ["GET"] },
  { ruta: "/api/happy-hour", metodos: ["GET"] },
  { ruta: "/api/beneficios", metodos: ["GET"] },
  { ruta: "/api/register", metodos: ["POST"] },

  // Pedidos: crear y seguir uno (sin datos personales)
  { ruta: "/api/pedidos", metodos: ["POST"] },
  { ruta: "/api/pedidos/*", metodos: ["GET"] },

  // Zonas: solo verificar una dirección
  { ruta: "/api/zonas-envio/verificar", metodos: ["GET"] },
  { ruta: "/api/zonas-envio/verificar-direccion", metodos: ["GET"] },

  // Ruleta del cliente
  { ruta: "/api/roulette", metodos: ["GET"] },
  { ruta: "/api/roulette/prizes", metodos: ["GET"] },
  { ruta: "/api/roulette/spin", metodos: ["POST"] },
];

/*
 * /api/pedidos/all y /api/pedidos/update NO son
 * el seguimiento de un pedido: son del admin.
 */
const SUBRUTAS_ADMIN_DE_PEDIDOS = new Set([
  "/api/pedidos/all",
  "/api/pedidos/update",
]);

function esRutaPublica(pathname: string, metodo: string) {
  if (SUBRUTAS_ADMIN_DE_PEDIDOS.has(pathname)) {
    return false;
  }

  return RUTAS_PUBLICAS.some((regla) => {
    const coincide = regla.ruta.endsWith("/*")
      ? pathname.startsWith(regla.ruta.slice(0, -1)) &&
        pathname.length > regla.ruta.length - 1 &&
        !pathname.slice(regla.ruta.length - 1).includes("/")
      : pathname === regla.ruta;

    return (
      coincide &&
      (!regla.metodos || regla.metodos.includes(metodo))
    );
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const metodo = request.method;

  const esApi = pathname.startsWith("/api/");
  const esPaginaAdmin =
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login");

  // Preflight de CORS: no aplica (misma web)
  if (metodo === "OPTIONS") {
    return NextResponse.next();
  }

  if (esApi && esRutaPublica(pathname, metodo)) {
    return NextResponse.next();
  }

  if (!esApi && !esPaginaAdmin) {
    return NextResponse.next();
  }

  const sesion = await leerSesion<SesionAdmin>(
    "admin",
    request.cookies.get(COOKIE_ADMIN)?.value
  );

  if (sesion) {
    return NextResponse.next();
  }

  if (esApi) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 }
    );
  }

  return NextResponse.redirect(
    new URL("/admin/login", request.url)
  );
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
