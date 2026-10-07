import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton, SkeletonPage } from "@/components/skeletons";

export default function ReservationsLoading() {
  return (
    <SkeletonPage width="3xl">
      {/* Title on the left, "book" button on the right. */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-8 w-40" />
      </div>
      {/* The three views: upcoming, past, all. */}
      <Skeleton className="mt-6 h-10 w-64" />
      <div className="mt-8 flex flex-col gap-8">
        <Skeleton className="h-56" />
        <div>
          <Skeleton className="h-6 w-32" />
          <div className="mt-3">
            <ListSkeleton rows={3} />
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
