import { ListSkeleton, SkeletonPage, TitleSkeleton } from "@/components/skeletons";

export default function AdminUsersLoading() {
  return (
    <SkeletonPage width="5xl">
      <TitleSkeleton />
      <div className="mt-8">
        <ListSkeleton rows={6} />
      </div>
    </SkeletonPage>
  );
}
