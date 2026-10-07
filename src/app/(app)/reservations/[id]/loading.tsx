import { Skeleton } from "@/components/ui/skeleton";
import { BackLinkSkeleton, SkeletonPage } from "@/components/skeletons";

export default function ReservationDetailLoading() {
  return (
    <SkeletonPage width="2xl">
      <BackLinkSkeleton />
      {/* The reservation card: day, hours, place, cost. */}
      <Skeleton className="h-64" />
      {/* The arrival block. */}
      <div className="mt-6 rounded-sm border border-line bg-surface p-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
      <Skeleton className="mt-6 h-8 w-44" />
    </SkeletonPage>
  );
}
