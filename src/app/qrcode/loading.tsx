import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonPage, TextSkeleton, TitleSkeleton } from "@/components/skeletons";

export default function QrCodeLoading() {
  return (
    <SkeletonPage width="5xl">
      <TitleSkeleton />
      <div className="mt-3 max-w-2xl">
        <TextSkeleton lines={2} />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-72" />
        ))}
      </div>
    </SkeletonPage>
  );
}
