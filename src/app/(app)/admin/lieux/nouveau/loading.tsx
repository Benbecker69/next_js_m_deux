import { Skeleton } from "@/components/ui/skeleton";
import { FieldSkeleton, SkeletonPage, TitleSkeleton } from "@/components/skeletons";

export default function NewLocationLoading() {
  return (
    <SkeletonPage width="2xl">
      <TitleSkeleton />
      {/* Same rows as LocationForm: name + city, address, latitude +
          longitude, description, amenities, then the button. */}
      <div className="mt-8 flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <FieldSkeleton />
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <FieldSkeleton tall />
        <FieldSkeleton />
        <Skeleton className="h-10 w-36" />
      </div>
    </SkeletonPage>
  );
}
