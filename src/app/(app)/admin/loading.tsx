import {
  HeadingSkeleton,
  ListSkeleton,
  SkeletonPage,
  StatGridSkeleton,
  TitleSkeleton,
} from "@/components/skeletons";

export default function AdminOverviewLoading() {
  return (
    <SkeletonPage width="5xl">
      <TitleSkeleton />
      <StatGridSkeleton count={7} className="mt-8 lg:grid-cols-4" />
      <div className="mt-12">
        <HeadingSkeleton />
        <div className="mt-4">
          <ListSkeleton rows={5} />
        </div>
      </div>
    </SkeletonPage>
  );
}
