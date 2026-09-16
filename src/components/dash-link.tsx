import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A secondary "see more" link marked by a hairline dash instead of an
 * underline or arrow — the same fine-line vocabulary as SpacePlan and the
 * location illustrations, not a new decorative flourish. The dash grows on
 * hover/focus; the whole thing is compositor-only (width transition on a
 * 1px element, no layout-affecting properties elsewhere).
 */
export function DashLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 text-sm text-pine">
      <span
        aria-hidden="true"
        className="h-px w-4 bg-pine transition-[width] duration-200 group-hover:w-7"
      />
      {children}
    </Link>
  );
}
