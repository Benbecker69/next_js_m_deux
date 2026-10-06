import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

// Same look and same states as <Input>, for a multi-line field.
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink",
      "placeholder:text-ink-muted transition-colors hover:border-ink/30",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
