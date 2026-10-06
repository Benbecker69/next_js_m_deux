import { Skeleton } from "@/components/ui/skeleton";
import { FormSkeleton, SkeletonSection, TextSkeleton } from "@/components/skeletons";

export default function OnboardingLoading() {
  return (
    <SkeletonSection>
      <Skeleton className="h-8 w-52" />
      <div className="mb-8 mt-3">
        <TextSkeleton lines={2} />
      </div>
      <FormSkeleton fields={2} />
    </SkeletonSection>
  );
}
