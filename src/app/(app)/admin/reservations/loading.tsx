import {
  FilterSkeleton,
  ListSkeleton,
  SkeletonPage,
  TitleSkeleton,
} from "@/components/skeletons";

export default function AdminReservationsLoading() {
  return (
    <SkeletonPage width="5xl">
      <TitleSkeleton />
      <div className="mt-6">
        <FilterSkeleton count={4} />
      </div>
      <div className="mt-8">
        <ListSkeleton rows={6} />
      </div>
    </SkeletonPage>
  );
}
