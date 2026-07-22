export const dynamic =
  "force-dynamic";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const productos =
    await prisma.producto.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        orden: "asc",
      },
    });

  return NextResponse.json(
    productos
  );
}