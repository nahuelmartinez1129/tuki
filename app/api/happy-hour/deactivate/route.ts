import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  await prisma.happyHour.updateMany({
    data: {
      activo: false,
    },
  });

  return NextResponse.json({
    success: true,
  });
}