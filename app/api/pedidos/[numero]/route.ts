import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { limitar } from "@/lib/rate-limit";

/*
 * ==========================================
 * SEGUIMIENTO DE UN PEDIDO (público)
 * ==========================================
 *
 * Devuelve SOLO el estado, los productos y
 * los importes. Nunca nombre, teléfono,
 * dirección ni coordenadas: los números de
 * pedido son correlativos y cualquiera podría
 * probar 1, 2, 3...
 */
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      numero: string;
    }>;
  }
) {
  // Frena a quien recorra todos los números
  const bloqueado = limitar(
    request,
    "seguimiento",
    120,
    10 * 60
  );
  if (bloqueado) return bloqueado;

  const { numero } = await params;
  const n = Number(numero);

  if (!Number.isInteger(n) || n <= 0) {
    return NextResponse.json(null, { status: 404 });
  }

  const pedido = await prisma.pedido.findUnique({
    where: {
      numero: n,
    },
    select: {
      numero: true,
      estado: true,
      subtotal: true,
      envio: true,
      descuento: true,
      total: true,
      premio: true,
      happyHour: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          nombre: true,
          cantidad: true,
          precio: true,
        },
      },
    },
  });

  return NextResponse.json(pedido);
}
