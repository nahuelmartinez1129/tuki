import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const productos =
    await prisma.producto.findMany({
      orderBy: {
        orden: "asc",
      },
    });

  return NextResponse.json(
    productos
  );
}

export async function POST(
  request: Request
) {
  const body =
    await request.json();

  const producto =
    await prisma.producto.create({
      data: {
        name: body.name,
        description:
          body.description,

        price: body.price,

        compareAtPrice:
          body.compareAtPrice,

        image: body.image,

        category:
          body.category,

        tags:
          body.tags ?? [],

        stock:
          body.stock,

        activo:
          body.activo,

        isCombo:
          body.isCombo,

        orden:
          body.orden,
      },
    });

  return NextResponse.json(
    producto
  );
}