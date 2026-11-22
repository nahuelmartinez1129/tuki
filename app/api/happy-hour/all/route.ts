import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ======================================================
// GET
// Devuelve todos los Happy Hours para el panel Admin
// ======================================================

export async function GET() {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

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