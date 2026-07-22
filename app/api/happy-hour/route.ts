import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export async function GET(
  request: Request
) {
  console.log(
    "HAPPY HOUR API:",
    new Date().toISOString()
  );

  console.log(
    "USER AGENT:",
    request.headers.get(
      "user-agent"
    )
  );

  const happyHour =
    await prisma.happyHour.findFirst({
      where: {
        activo: true,
      },
    });
    

  console.log(
    "HAPPY HOUR ENCONTRADO:",
    happyHour
  );

  return NextResponse.json(
    happyHour
  );
}