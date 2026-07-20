import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  await prisma.happyHour.updateMany({
    data: {
      activo: false,
    },
  });

  return NextResponse.json({
    success: true,
  });
}