import { Skeleton } from "@/components/ui/skeleton";
import { DefinitionListSkeleton, SkeletonSection } from "@/components/skeletons";

export default function SettingsSecurityLoading() {
  return (
    <SkeletonSection>
      <DefinitionListSkeleton rows={3} />
      <Skeleton className="mt-6 h-4 w-full" />
    </SkeletonSection>
  );
}
