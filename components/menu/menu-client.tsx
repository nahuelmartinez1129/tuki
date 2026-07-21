"use client";

import { useMemo, useState } from "react";
import { PackageSearch, Sparkles } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/product/product-card";
import { CategoryTabs } from "@/components/menu/category-tabs";
import { ProductSearch } from "@/components/menu/product-search";
import { allProducts, getMenuGroup, type MenuCategoryGroup } from "@/lib/data/products";
import type { Product } from "@/types/product";




interface MenuClientProps {
  products: Product[];
}

export function MenuClient({
  products,
}: MenuClientProps) {
  const [query, setQuery] =
    useState("");

  const [category, setCategory] =
    useState<MenuCategoryGroup>(
      "todos"
    );

  const topVentasIds =
    useMemo(
      () =>
        new Set(
          products
            .filter((product) =>
              product.tags?.includes(
                "top-ventas"
              )
            )
            .map(
              (product) =>
                product.id
            )
        ),
      [products]
    );

  const filteredProducts =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchesCategory =
            category ===
              "todos" ||
            getMenuGroup(
              product
            ) === category;

          const matchesQuery =
            normalizedQuery
              .length ===
              0 ||
            product.name
              .toLowerCase()
              .includes(
                normalizedQuery
              ) ||
            product.description
              .toLowerCase()
              .includes(
                normalizedQuery
              );

          return (
            matchesCategory &&
            matchesQuery
          );
        }
      );
    }, [
      products,
      query,
      category,
    ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden bg-background pb-20">
        <div className="border-b border-white/5 bg-tuki-night-soft py-10">
          <div className="container">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-tuki-lime">
              Catálogo completo
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-tuki-cream sm:text-4xl">
              ¿Qué antojo tenés hoy?
            </h1>
            <p className="mt-2 max-w-md text-sm text-tuki-cream/70">
              Todo Tuki, en un solo lugar. Buscá, filtrá y armá tu pedido.
            </p>
          </div>
        </div>

        <div className="container mt-6 flex flex-col gap-4">
          <ProductSearch value={query} onChange={setQuery} />
          <CategoryTabs active={category} onChange={setCategory} />

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs font-semibold text-tuki-cream/50">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "producto encontrado"
                : "productos encontrados"}
            </p>
            {topVentasIds.size > 0 && category === "todos" && !query && (
              <span className="flex items-center gap-1 font-display text-xs font-bold text-tuki-yellow">
                <Sparkles className="h-3.5 w-3.5" />
                Top ventas destacados
              </span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No encontramos ese antojo"
              description="Probá con otra palabra o mirá otra categoría."
              action={
                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setCategory("todos");
                  }}
                >
                  Ver todo el catálogo
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      
    </>
  );
}
