import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "neutral" | "success" | "warning" | "danger";

const variantClasses: Record<Variant, string> = {
  neutral: "bg-paper text-ink-muted border border-line",
  success: "bg-pine/10 text-pine border border-pine/30",
  warning: "bg-ochre/10 text-ochre border border-ochre/30",
  danger: "bg-danger/10 text-danger border border-danger/30",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: Variant };

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
