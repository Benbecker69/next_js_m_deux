import { cn } from "@/lib/utils/cn";

/**
 * Brand mark: a surveyor's benchmark / reticle, not a map-pin teardrop —
 * "repère" is literally French for a reference point, and cartography marks
 * one with exactly this crosshair-in-a-circle symbol. Ties the mark to the
 * word instead of reaching for the generic location-pin cliché, and reads
 * as one more hairline instrument on the "architect's plan" aesthetic
 * already used across the app (SpacePlan, the NFC/radar diagrams).
 * `currentColor` throughout so it themes for free with the text next to it.
 */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <path
        d="M12 1.5v3.2M12 19.3v3.2M22.5 12h-3.2M4.7 12H1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  iconClassName = "h-5 w-5",
  wordmarkClassName = "font-display text-lg font-medium",
}: {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <LogoMark className={iconClassName} />
      <span className={wordmarkClassName}>Repère</span>
    </span>
  );
}
