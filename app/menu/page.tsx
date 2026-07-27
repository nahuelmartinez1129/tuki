import { prisma } from "@/lib/prisma";
import { MenuClient } from "@/components/menu/menu-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MenuPage() {
  const products =
    await prisma.producto.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        orden: "asc",
      },
    });

  return (
    <MenuClient
      products={products}
    />
  );
}