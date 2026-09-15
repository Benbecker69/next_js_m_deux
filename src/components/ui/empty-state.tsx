import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-sm border border-dashed border-line p-8",
        className,
      )}
      {...props}
    >
      <p className="font-display text-lg font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted">{description}</p>}
      {action}
    </div>
  );
}
