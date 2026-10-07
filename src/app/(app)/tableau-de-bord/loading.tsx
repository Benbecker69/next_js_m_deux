import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton, SkeletonPage } from "@/components/skeletons";

export default function HomeLoading() {
  return (
    <SkeletonPage width="5xl">
      {/* Greeting and date. */}
      <Skeleton className="h-9 w-64 max-w-full" />
      <Skeleton className="mt-2 h-5 w-40" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        {/* Left: the next reservation, the three shortcuts, the next ones. */}
        <div className="flex flex-col gap-8">
          <Skeleton className="h-56" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <ListSkeleton rows={2} trailing={false} />
        </div>
        {/* Right: the activity sheet — balance, four figures, favourite place. */}
        <div className="overflow-hidden rounded-sm border border-line bg-surface">
          <div className="p-5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-12 w-32" />
          </div>
          <div className="grid grid-cols-2 border-t border-line">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
