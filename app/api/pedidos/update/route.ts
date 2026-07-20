import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const body =
    await request.json();

  const pedido =
    await prisma.pedido.update({
      where: {
        id: body.id,
      },

      data: {
        estado:
          body.estado,
      },
    });

  return NextResponse.json(
    pedido
  );
}