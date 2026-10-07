import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton, SkeletonPage, TitleSkeleton } from "@/components/skeletons";

export default function ArrivalsLoading() {
  return (
    <SkeletonPage width="3xl">
      <TitleSkeleton subtitle />
      {/* The date filter: field and button. */}
      <div className="mt-6 flex items-end gap-3">
        <div className="flex w-44 flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="mt-8 flex flex-col gap-8">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index}>
            <Skeleton className="h-6 w-32" />
            <div className="mt-3">
              <ListSkeleton rows={3} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonPage>
  );
}
