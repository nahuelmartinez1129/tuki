import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const config =
    await prisma.configuracion.findFirst();

  return NextResponse.json(config);
}