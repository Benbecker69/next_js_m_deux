import {
  DefinitionListSkeleton,
  FormSkeleton,
  HeadingSkeleton,
  ListSkeleton,
  SkeletonPage,
  TitleSkeleton,
} from "@/components/skeletons";

export default function AdminUserDetailLoading() {
  return (
    <SkeletonPage width="4xl">
      <TitleSkeleton subtitle />
      {/* Left: the member's details and the role/credits form. Right: bookings. */}
      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <div>
          <DefinitionListSkeleton rows={2} />
          <div className="mt-8 border-t border-line pt-8">
            <FormSkeleton fields={2} />
          </div>
        </div>
        <div>
          <HeadingSkeleton />
          <div className="mt-4">
            <ListSkeleton rows={4} />
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
