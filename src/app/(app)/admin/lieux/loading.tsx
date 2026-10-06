import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton, SkeletonPage } from "@/components/skeletons";

export default function AdminLocationsLoading() {
  return (
    <SkeletonPage width="5xl">
      {/* Title on the left, "add a location" button on the right. */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-36" />
      </div>
      <div className="mt-8">
        <ListSkeleton rows={4} />
      </div>
    </SkeletonPage>
  );
}
