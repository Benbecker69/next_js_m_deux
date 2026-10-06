import { Skeleton } from "@/components/ui/skeleton";
import { TextSkeleton } from "@/components/skeletons";

// Shared by the home page and the text pages of the public site (features,
// pricing, FAQ, mobile vision): a headline, a few lines, then a wide block.
// The two pages with their own shape (/lieux and /lieux/[slug]) have their
// own loading.tsx.
export default function MarketingLoading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-6xl px-6 py-20">
      <span className="sr-only">Chargement de la page…</span>
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="mt-3 h-12 w-3/5" />
          <div className="mt-6 max-w-md">
            <TextSkeleton lines={3} />
          </div>
          <div className="mt-8 flex gap-4">
            <Skeleton className="h-12 w-44" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
        <Skeleton className="aspect-[4/3] w-full md:aspect-[7/6]" />
      </div>
    </div>
  );
}
