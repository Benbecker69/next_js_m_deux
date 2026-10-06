import { Skeleton } from "@/components/ui/skeleton";
import { FieldSkeleton, SkeletonSection } from "@/components/skeletons";

export default function SettingsPreferencesLoading() {
  return (
    <SkeletonSection>
      <div className="flex flex-col gap-6">
        <FieldSkeleton />
        <Skeleton className="h-4 w-64 max-w-full" />
        <Skeleton className="h-3 w-80 max-w-full" />
        <Skeleton className="h-10 w-36" />
      </div>
    </SkeletonSection>
  );
}
