import { Skeleton } from "@/components/ui/skeleton";
import { FormSkeleton, SkeletonSection } from "@/components/skeletons";

export default function SettingsSecurityLoading() {
  return (
    <SkeletonSection>
      {/* Two forms: the email address, then the password. */}
      <div className="flex flex-col gap-10">
        <div>
          <Skeleton className="mb-4 h-7 w-40" />
          <FormSkeleton fields={2} />
        </div>
        <div className="border-t border-line pt-10">
          <Skeleton className="mb-4 h-7 w-40" />
          <FormSkeleton fields={3} />
        </div>
      </div>
    </SkeletonSection>
  );
}
