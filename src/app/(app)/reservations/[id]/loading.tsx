import { Skeleton } from "@/components/ui/skeleton";
import {
  BackLinkSkeleton,
  DefinitionListSkeleton,
  SkeletonPage,
} from "@/components/skeletons";

export default function ReservationDetailLoading() {
  return (
    <SkeletonPage width="2xl">
      <BackLinkSkeleton />
      {/* Space name with its status badge, then the location line. */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="mt-3 h-4 w-40" />
      <div className="mt-8">
        <DefinitionListSkeleton rows={2} />
      </div>
      <Skeleton className="mt-8 h-8 w-28" />
    </SkeletonPage>
  );
}
