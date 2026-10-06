import { Skeleton } from "@/components/ui/skeleton";
import { FormSkeleton, SkeletonSection } from "@/components/skeletons";

// Sign-in and sign-up: a title, then the form.
export default function AuthLoading() {
  return (
    <SkeletonSection>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mb-8 mt-3 h-4 w-64 max-w-full" />
      <FormSkeleton fields={2} />
    </SkeletonSection>
  );
}
