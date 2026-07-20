import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background pb-20">
      <div className="border-b border-white/5 bg-tuki-night-soft py-10">
        <div className="container">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-9 w-64" />
          <Skeleton className="mt-3 h-4 w-72" />
        </div>
      </div>

      <div className="container mt-6 flex flex-col gap-4">
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
