import { Skeleton } from "@/components/ui/skeleton";
import { PhotoCardSkeleton } from "@/components/skeletons";

export default function LocationsLoading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Chargement des lieux…</span>
      {/* The page title band. */}
      <div className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-4 h-5 w-96 max-w-full" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Two rows of filter pills: city, then space type. */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }, (_, row) => (
            <div key={row} className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-8 w-24" />
              ))}
            </div>
          ))}
        </div>
        <Skeleton className="mt-10 h-4 w-16" />
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <PhotoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
