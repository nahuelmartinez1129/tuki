import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  const { numero } =
    await params;

  const pedido =
    await prisma.pedido.findUnique({
      where: {
        numero: Number(numero),
      },

      include: {
        items: true,
      },
    });

  return NextResponse.json(
    pedido
  );
}