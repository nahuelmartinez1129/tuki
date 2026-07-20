import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const happyHours =
    await prisma.happyHour.findMany();

  console.log(happyHours);

  return NextResponse.json(
    happyHours
  );
}