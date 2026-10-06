import { Skeleton } from "@/components/ui/skeleton";
import {
  FieldSkeleton,
  HeadingSkeleton,
  ListSkeleton,
  SkeletonPage,
  TitleSkeleton,
} from "@/components/skeletons";

export default function AdminLocationDetailLoading() {
  return (
    <SkeletonPage width="3xl">
      <TitleSkeleton subtitle />
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
      <div className="mt-14 border-t border-line pt-8">
        <HeadingSkeleton />
        <div className="mt-4">
          <ListSkeleton rows={3} />
        </div>
      </div>
    </SkeletonPage>
  );
}
