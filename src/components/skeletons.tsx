import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

/**
 * Building blocks for the `loading.tsx` files. Each `loading.tsx` composes
 * these in the same order, widths and spacing as its page, so the layout
 * does not jump when the real content replaces the placeholder.
 */

// Same containers as the pages (full class names: Tailwind only keeps the
// classes it can read as whole strings in the source).
const WIDTH = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
} as const;

/** The page container. Announced once as "loading" instead of block by block. */
export function SkeletonPage({
  width,
  children,
}: {
  width: keyof typeof WIDTH;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn("mx-auto px-5 py-10 sm:px-8 sm:py-12", WIDTH[width])}
    >
      <span className="sr-only">Chargement de la page…</span>
      {children}
    </div>
  );
}

/** A section that loads inside a layout which already drew the page frame. */
export function SkeletonSection({ children }: { children: ReactNode }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Chargement…</span>
      {children}
    </div>
  );
}

/** The `h1`, with the line of grey text some pages put under it. */
export function TitleSkeleton({ subtitle = false }: { subtitle?: boolean }) {
  return (
    <div>
      <Skeleton className="h-8 w-56 max-w-full" />
      {subtitle && <Skeleton className="mt-3 h-4 w-72 max-w-full" />}
    </div>
  );
}

/** The "← back" link above a detail page's title. */
export function BackLinkSkeleton() {
  return <Skeleton className="mb-4 h-4 w-32" />;
}

/** A section heading (`h2`). */
export function HeadingSkeleton() {
  return <Skeleton className="h-6 w-44" />;
}

/** A grid of StatCard placeholders. */
export function StatGridSkeleton({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-sm border border-line bg-surface p-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Rows of a divided list: two lines of text, and a badge or button on the right. */
export function ListSkeleton({
  rows,
  trailing = true,
}: {
  rows: number;
  trailing?: boolean;
}) {
  return (
    <ul className="divide-y divide-line border-t border-line">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
          {trailing && <Skeleton className="h-6 w-20 shrink-0" />}
        </li>
      ))}
    </ul>
  );
}

/** A row of filter pills. */
export function FilterSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-8 w-24" />
      ))}
    </div>
  );
}

/** Label / value lines of a `<dl>`. */
export function DefinitionListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="divide-y divide-line border-t border-line">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex justify-between gap-4 py-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

/** One labelled field. */
export function FieldSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className={tall ? "h-24" : "h-10"} />
    </div>
  );
}

/** A stack of fields ending with the submit button. */
export function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: fields }, (_, index) => (
        <FieldSkeleton key={index} />
      ))}
      <Skeleton className="h-10 w-36" />
    </div>
  );
}

/** A photo-on-top card, as on the locations pages. */
export function PhotoCardSkeleton() {
  return (
    <div>
      <div
        aria-hidden="true"
        className="aspect-[16/10] w-full animate-pulse rounded-t-sm bg-line/60"
      />
      <div className="rounded-b-sm border border-t-0 border-line bg-surface p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-24" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
    </div>
  );
}

/** Lines of running text. */
export function TextSkeleton({ lines }: { lines: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn("h-4", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}
