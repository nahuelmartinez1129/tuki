import { prisma } from "@/lib/prisma";
import { featuredProducts } from "@/lib/data/products";

async function main() {
  for (const product of featuredProducts) {
    await prisma.producto.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,

        compareAtPrice:
          product.compareAtPrice,

        image: product.image,

        category:
          product.category,

        tags:
          product.tags ?? [],

        stock:
          product.stock ?? 20,

        activo: true,

        isCombo:
          product.isCombo ??
          false,

        orden: 0,
      },
    });
  }

  console.log(
    "Productos migrados correctamente."
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });