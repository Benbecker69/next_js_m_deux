import { cn } from "@/lib/utils/cn";

/**
 * Initial-letter avatar (e.g. "N" for Nadia) — no photo upload exists yet
 * (User.avatarUrl is reserved for that, unused for now), so this is the
 * honest placeholder rather than a generic person-silhouette icon.
 * Decorative: the wrapping Link supplies its own accessible name.
 */
export function UserAvatar({ name, className }: { name: string; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine text-sm font-medium text-pine-contrast",
        className,
      )}
    >
      {initial}
    </span>
  );
}
