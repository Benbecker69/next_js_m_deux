import {
  HeadingSkeleton,
  ListSkeleton,
  SkeletonPage,
  StatGridSkeleton,
  TitleSkeleton,
} from "@/components/skeletons";

export default function DashboardLoading() {
  return (
    <SkeletonPage width="4xl">
      <TitleSkeleton />
      <StatGridSkeleton count={4} className="mt-8" />
      <div className="mt-12">
        <HeadingSkeleton />
        <div className="mt-4">
          <ListSkeleton rows={3} trailing={false} />
        </div>
      </div>
    </SkeletonPage>
  );
}
