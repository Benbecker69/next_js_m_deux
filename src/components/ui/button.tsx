import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

// Filled variants get a subtle shadow tinted with their own color (not a
// generic grey) that grows on hover, plus a slight lift — depth that reads
// as deliberate rather than the default-shadow-under-every-card look the
// project's own design skill warns against. Text darkens via `brightness`
// on hover instead of `opacity`, which would wash it out toward the page
// background instead of reading as a natural press-darken.
const variantClasses: Record<Variant, string> = {
  primary:
    "bg-pine text-pine-contrast shadow-sm shadow-pine/25 hover:shadow-md hover:shadow-pine/30 hover:brightness-95",
  secondary:
    "bg-surface text-ink border border-line shadow-sm hover:border-ink/30 hover:shadow-md",
  ghost: "bg-transparent text-ink hover:bg-surface",
  destructive:
    "bg-danger text-danger-contrast shadow-sm shadow-danger/25 hover:shadow-md hover:shadow-danger/30 hover:brightness-95",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonVariants(
  options: { variant?: Variant; size?: Size; className?: string } = {},
) {
  const { variant = "primary", size = "md", className } = options;
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-medium",
    "transition-[background-color,color,box-shadow,filter,transform] duration-150",
    "hover:-translate-y-px active:translate-y-0 active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  ),
);
Button.displayName = "Button";
