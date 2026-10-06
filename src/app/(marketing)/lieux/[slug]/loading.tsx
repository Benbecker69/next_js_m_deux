import { Skeleton } from "@/components/ui/skeleton";
import { HeadingSkeleton, TextSkeleton } from "@/components/skeletons";

export default function LocationDetailLoading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-6xl px-6 py-12">
      <span className="sr-only">Chargement du lieu…</span>
      <Skeleton className="h-4 w-28" />
      {/* Left: photo, name, description, spaces. Right: the booking card. */}
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div>
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="mt-8 h-10 w-64" />
          <Skeleton className="mt-3 h-4 w-32" />
          <div className="mt-10">
            <HeadingSkeleton />
            <div className="mt-3 max-w-2xl">
              <TextSkeleton lines={3} />
            </div>
          </div>
          <div className="mt-10">
            <HeadingSkeleton />
            <ul className="mt-4 divide-y divide-line rounded-sm border border-line bg-surface">
              {Array.from({ length: 3 }, (_, index) => (
                <li key={index} className="flex items-center gap-4 p-4">
                  <Skeleton className="aspect-[4/3] w-24 shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-8 w-16 shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-sm border border-line bg-surface p-6">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-4 h-5 w-48" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-5 h-10" />
        </div>
      </div>
    </div>
  );
}
