import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <Skeleton className="h-8 w-48" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <div className="mt-12">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-24" />
      </div>
    </div>
  );
}
