import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The two frames every public page is built from, so spacing and heading
 * sizes are decided once: `PageIntro` opens a page (the `h1`), `Section`
 * holds one block under it (an `h2`, an optional line of text, an optional
 * link on the right).
 */

export function PageIntro({
  title,
  lead,
  eyebrow,
  aside,
}: {
  title: string;
  lead?: ReactNode;
  /** A status badge above the title, when the page has one to show. */
  eyebrow?: ReactNode;
  /** Something to put opposite the title on wide screens (a photo, a form). */
  aside?: ReactNode;
}) {
  return (
    <div className="border-b border-line">
      <div
        className={cn(
          "mx-auto max-w-6xl px-6 py-14 sm:py-16",
          aside ? "grid gap-10 md:grid-cols-[1fr_auto] md:items-center" : undefined,
        )}
      >
        <div>
          {eyebrow && <div className="mb-4">{eyebrow}</div>}
          <h1 className="max-w-2xl font-display text-4xl font-medium leading-tight text-ink">
            {title}
          </h1>
          {lead && <p className="mt-4 max-w-xl text-lg text-ink-muted">{lead}</p>}
        </div>
        {aside}
      </div>
    </div>
  );
}

export function Section({
  title,
  subtitle,
  action,
  tinted = false,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  /** A link shown opposite the title ("see all"). */
  action?: ReactNode;
  /** Sits on the white surface instead of the page background, to set a block apart. */
  tinted?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-line", tinted && "bg-surface", className)}>
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {title && (
          <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div>
              <h2 className="font-display text-3xl font-medium text-ink">{title}</h2>
              {subtitle && <p className="mt-3 max-w-xl text-ink-muted">{subtitle}</p>}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
