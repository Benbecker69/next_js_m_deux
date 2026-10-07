import { Skeleton } from "@/components/ui/skeleton";
import {
  BackLinkSkeleton,
  DefinitionListSkeleton,
  SkeletonPage,
} from "@/components/skeletons";

export default function ArrivalDetailLoading() {
  return (
    <SkeletonPage width="2xl">
      <BackLinkSkeleton />
      {/* The attempt: accepted or refused, day, hour, place. */}
      <Skeleton className="h-52" />
      <div className="mt-6 rounded-sm border border-line bg-surface p-6">
        <Skeleton className="h-6 w-24" />
        <div className="mt-3">
          <DefinitionListSkeleton rows={3} />
        </div>
      </div>
      <Skeleton className="mt-6 h-14" />
    </SkeletonPage>
  );
}
