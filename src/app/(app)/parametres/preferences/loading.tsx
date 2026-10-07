import { Skeleton } from "@/components/ui/skeleton";
import {
  DefinitionListSkeleton,
  FieldSkeleton,
  SkeletonSection,
} from "@/components/skeletons";

export default function SettingsPreferencesLoading() {
  return (
    <SkeletonSection>
      <div className="flex flex-col gap-10">
        {/* Display: language and appearance. */}
        <div>
          <Skeleton className="mb-4 h-7 w-32" />
          <DefinitionListSkeleton rows={2} />
        </div>
        {/* Booking: default location, reminder, save. */}
        <div>
          <Skeleton className="mb-4 h-7 w-36" />
          <div className="flex flex-col gap-6">
            <FieldSkeleton />
            <Skeleton className="h-4 w-64 max-w-full" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </div>
    </SkeletonSection>
  );
}
