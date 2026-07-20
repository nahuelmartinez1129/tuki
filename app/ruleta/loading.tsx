import { Skeleton } from "@/components/ui/skeleton";

export default function RuletaLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-tuki-night pb-20 pt-12">
      <div className="container flex flex-col items-center gap-4 text-center">
        <Skeleton className="h-7 w-40 rounded-full" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="mt-6 h-72 w-72 rounded-full" />
        <Skeleton className="mt-6 h-14 w-full max-w-xs" />
      </div>
    </main>
  );
}
