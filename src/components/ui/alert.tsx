import type { ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Variant = "success" | "error";

const VARIANT: Record<
  Variant,
  { Icon: typeof CircleCheck; classes: string; role: "status" | "alert" }
> = {
  success: {
    Icon: CircleCheck,
    classes: "border-pine/30 bg-pine/10 text-pine",
    role: "status",
  },
  error: {
    Icon: CircleAlert,
    classes: "border-danger/30 bg-danger/10 text-danger",
    role: "alert",
  },
};

/**
 * Inline success/error feedback for a form or action outcome — green for
 * success, red for error (role="status" vs role="alert" so assistive tech
 * announces each appropriately). Reused as-is for both useActionState
 * results and toast contents, so the two feel like the same product.
 */
export function Alert({
  variant,
  children,
  className,
}: {
  variant: Variant;
  children: ReactNode;
  className?: string;
}) {
  const { Icon, classes, role } = VARIANT[variant];
  return (
    <div
      role={role}
      className={cn(
        "flex items-start gap-2 rounded-sm border px-3 py-2.5 text-sm",
        "animate-toast-in",
        classes,
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <p>{children}</p>
    </div>
  );
}
