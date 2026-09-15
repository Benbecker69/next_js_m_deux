import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint, className, ...props }: StatCardProps) {
  return (
    <div className={cn("rounded-sm border border-line p-4", className)} {...props}>
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
