import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  const { id } =
    await request.json();

  await prisma.happyHour.updateMany({
    data: {
      activo: false,
    },
  });

  await prisma.happyHour.update({
    where: {
      id,
    },
    data: {
      activo: true,
    },
  });

  return NextResponse.json({
    success: true,
  });
}