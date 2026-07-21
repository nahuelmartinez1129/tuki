import { ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { prisma } from "@/lib/prisma";
export async function FeaturedProducts() {
  const products =
    (await prisma.producto.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        orden: "asc",
      },
      take: 8,
    })) as Product[];
console.log("PRODUCTOS FEATURED:");
console.log(
  products.map((p) => ({
    nombre: p.name,
    precio: p.price,
  }))
);
  return (
    <section id="destacados" className="bg-background py-14">
      <div className="container">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-tuki-lime">
              Recién agregados
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              Antojos destacados
            </h2>
          </div>
          <a
            href="/menu"
            className="flex items-center gap-0.5 font-display text-sm font-bold text-tuki-cream/70 hover:text-tuki-lime"
          >
            Ver todo
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
       {products
  
  .map((product) => (
            <ProductCard key={product.id} product={product} fixedWidth />
          ))}
        </div>
      </div>
    </section>
  );
}
