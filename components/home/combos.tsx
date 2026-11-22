import { unstable_noStore } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";
import { CombosClient } from "@/components/home/combos-client";

/*
 * Combos: productos de la base marcados como
 * "combo" (se crean y editan desde el admin).
 */
export async function Combos() {
  unstable_noStore();

  const combos = (await prisma.producto.findMany({
    where: {
      activo: true,
      isCombo: true,
    },
    orderBy: {
      orden: "asc",
    },
  })) as Product[];

  if (combos.length === 0) return null;

  return <CombosClient combos={combos} />;
}
