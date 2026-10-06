import { Skeleton } from "@/components/ui/skeleton";
import { FieldSkeleton, SkeletonPage, TitleSkeleton } from "@/components/skeletons";

export default function ReserveLoading() {
  return (
    <SkeletonPage width="5xl">
      <TitleSkeleton subtitle />
      {/* The filter bar: search, type, location, "sort by distance". */}
      <div className="mt-8 grid gap-4 rounded-sm border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <Skeleton className="mt-6 h-4 w-24" />
      {/* Space cards: photo on top, three lines, price. */}
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-sm border border-line bg-surface"
          >
            <div aria-hidden="true" className="aspect-[4/3] animate-pulse bg-line/60" />
            <div className="p-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-3 h-4 w-40" />
              <Skeleton className="mt-2 h-4 w-20" />
              <Skeleton className="mt-5 h-6 w-28" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonPage>
  );
}
