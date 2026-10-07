import { Skeleton } from "@/components/ui/skeleton";
import { FieldSkeleton, SkeletonSection } from "@/components/skeletons";

export default function SettingsProfileLoading() {
  return (
    <SkeletonSection>
      <div className="flex flex-col gap-6">
        {/* First name and last name, side by side. */}
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        {/* "You are": three choice pills. */}
        <div>
          <Skeleton className="h-4 w-20" />
          <div className="mt-2 flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
    </SkeletonSection>
  );
}
