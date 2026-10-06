import {
  FilterSkeleton,
  ListSkeleton,
  SkeletonPage,
  TitleSkeleton,
} from "@/components/skeletons";

export default function ReservationsLoading() {
  return (
    <SkeletonPage width="4xl">
      <TitleSkeleton />
      <div className="mt-6">
        <FilterSkeleton count={4} />
      </div>
      <div className="mt-8">
        <ListSkeleton rows={5} />
      </div>
    </SkeletonPage>
  );
}
