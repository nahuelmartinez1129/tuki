import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  const pedidos =
    await prisma.pedido.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return NextResponse.json(
    pedidos
  );
}