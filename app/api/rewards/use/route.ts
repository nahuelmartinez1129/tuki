import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const { rewardId } =
    await request.json();

  await prisma.ruleta.update({
    where: {
      id: rewardId,
    },
    data: {
      utilizado: true,
    },
  });

  return NextResponse.json({
    success: true,
  });
}