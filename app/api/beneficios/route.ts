import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { limitar } from "@/lib/rate-limit";
import {
  buscarHappyHourActivo,
  buscarPedidosEnUbicacion,
  buscarPremioVigente,
  esPrimeraCompra,
  ruletaUsadaEnDireccion,
  validarCupon,
} from "@/lib/promociones-server";

export const dynamic = "force-dynamic";

/**
 * ==========================================
 * GET /api/beneficios?phone=...&cupon=...
 * ==========================================
 *
 * Devuelve los beneficios disponibles para
 * el checkout. El cálculo final lo vuelve a
 * hacer /api/pedidos con los mismos datos.
 */
export async function GET(request: Request) {
  // Frena a quien quiera probar cupones a lo loco
  const bloqueado = limitar(request, "beneficios", 60, 10 * 60);
  if (bloqueado) return bloqueado;

  try {
    const { searchParams } = new URL(request.url);

    const phone =
      searchParams.get("phone")?.trim() ?? "";

    const codigo =
      searchParams.get("cupon")?.trim() ?? "";

    /*
     * Ubicación de entrega (opcional): llega
     * cuando el cliente ya verificó la dirección.
     */
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    const ubicacion =
      searchParams.has("lat") &&
      searchParams.has("lng") &&
      Number.isFinite(lat) &&
      Number.isFinite(lng)
        ? {
            lat,
            lng,
            direccion:
              searchParams.get("direccion"),
          }
        : null;

    const usuario = phone
      ? await prisma.usuario.findUnique({
          where: { phone },
        })
      : null;

    const [
      premioVigente,
      happyHour,
      primeraCompra,
      pedidosEnUbicacion,
    ] =
      await Promise.all([
        usuario
          ? buscarPremioVigente(usuario.id)
          : null,
        buscarHappyHourActivo(),
        // Sin teléfono todavía: lo tratamos como
        // cliente nuevo (para mostrar el bono).
        phone
          ? esPrimeraCompra(phone, ubicacion)
          : true,
        ubicacion
          ? buscarPedidosEnUbicacion(ubicacion)
          : [],
      ]);

    // Un premio de ruleta por dirección cada 24 h
    const premio =
      premioVigente &&
      !ruletaUsadaEnDireccion(
        pedidosEnUbicacion,
        phone
      )
        ? premioVigente
        : null;

    let cupon = null;
    let cuponError: string | null = null;

    if (codigo) {
      const resultado = await validarCupon(
        codigo,
        usuario?.id ?? null,
        ubicacion
      );

      if (resultado.ok) {
        const { id: _id, ...datos } =
          resultado.cupon;
        cupon = datos;
      } else {
        cuponError = resultado.error;
      }
    }

    return NextResponse.json({
      premio,
      happyHour,
      primeraCompra,
      cupon,
      cuponError,
    });
  } catch (error) {
    console.error(
      "ERROR GET /api/beneficios:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudieron cargar los beneficios.",
      },
      { status: 500 }
    );
  }
}
