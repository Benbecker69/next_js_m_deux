import { Skeleton } from "@/components/ui/skeleton";
import { BackLinkSkeleton, HeadingSkeleton, SkeletonPage } from "@/components/skeletons";

export default function ReserveSpaceLoading() {
  return (
    <SkeletonPage width="5xl">
      <BackLinkSkeleton />
      {/* Space thumbnail, name and details. */}
      <div className="flex items-center gap-5 border-b border-line pb-8">
        <Skeleton className="aspect-[4/3] w-24 shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
        </div>
      </div>
      {/* Left: calendar, start hours, end hours. Right: the summary. */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="flex flex-col gap-8">
          <div>
            <HeadingSkeleton />
            <Skeleton className="mt-4 h-80 max-w-sm" />
          </div>
          <div>
            <HeadingSkeleton />
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {Array.from({ length: 9 }, (_, index) => (
                <Skeleton key={index} className="h-10" />
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-sm border border-line bg-surface p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton className="mt-6 h-10" />
        </div>
      </div>
    </SkeletonPage>
  );
}
