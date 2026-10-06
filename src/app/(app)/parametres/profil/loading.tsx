import { Skeleton } from "@/components/ui/skeleton";
import { FieldSkeleton, SkeletonSection } from "@/components/skeletons";

export default function SettingsProfileLoading() {
  return (
    <SkeletonSection>
      <div className="flex flex-col gap-6">
        <FieldSkeleton />
        {/* "You are": three choice pills. */}
        <div>
          <Skeleton className="h-4 w-20" />
          <div className="mt-2 flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
    </SkeletonSection>
  );
}
