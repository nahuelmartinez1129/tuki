import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
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