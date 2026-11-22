import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  const body =
    await request.json();

  await prisma.producto.delete({
    where: {
      id: body.id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}