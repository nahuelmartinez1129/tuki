import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

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
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

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