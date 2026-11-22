import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(
  request: Request
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  const body =
    await request.json();

  const producto =
    await prisma.producto.update({
      where: {
        id: body.id,
      },

      data: {
        name: body.name,
        description:
          body.description,
        price:
          body.price,
        compareAtPrice:
          body.compareAtPrice,
        image:
          body.image,
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

  // Invalidar caché de las páginas que muestran productos
  revalidatePath("/");
  revalidatePath("/menu");

  return NextResponse.json(
    producto
  );
}