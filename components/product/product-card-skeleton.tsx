import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-9 w-9 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
