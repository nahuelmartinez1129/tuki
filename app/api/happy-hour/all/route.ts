import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ======================================================
// GET
// Devuelve todos los Happy Hours para el panel Admin
// ======================================================

export async function GET() {
  try {
    const happyHours = await prisma.happyHour.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(happyHours);
  } catch (error) {
    console.error(
      "ERROR GET /api/happy-hour/all:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudieron obtener los Happy Hours.",
      },
      {
        status: 500,
      }
    );
  }
}