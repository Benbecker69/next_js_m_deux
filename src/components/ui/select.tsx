import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

// Same look and same states as <Input>, for a native <select>.
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-10 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink",
      "transition-colors hover:border-ink/30",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
      className,
    )}
    {...props}
  />
));
Select.displayName = "Select";
