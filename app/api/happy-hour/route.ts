import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const happyHour =
    await prisma.happyHour.findFirst({
      where: {
        activo: true,
      },
    });

  return NextResponse.json(
    happyHour
  );
}