import type { NextConfig } from "next";

/*
 * Cabeceras de seguridad para todas las páginas:
 * - No se puede meter TUKI dentro de un iframe
 *   de otra web (evita engaños tipo "clickjacking").
 * - El navegador no adivina tipos de archivo.
 * - No se filtra la URL completa a otras webs.
 * - La web no puede usar cámara ni micrófono.
 *   La ubicación sí (para verificar la dirección).
 */
const cabecerasSeguridad = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: cabecerasSeguridad,
      },
    ];
  },
};

export default nextConfig;
