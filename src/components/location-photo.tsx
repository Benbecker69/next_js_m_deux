import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * One real photograph per location, keyed by slug (files in
 * `public/images/locations/`). Locations are created in the admin, so a slug
 * with no photo of its own is expected: it falls back to `default.jpg`
 * instead of a broken image. Stock photos (Unsplash, free licence) chosen to
 * match each venue's description in `prisma/seed.ts` — the venues are
 * fictional, so these illustrate the place rather than document it.
 */
const SLUGS_WITH_PHOTO = new Set([
  "le-chantier-lyon",
  "station-9-nantes",
  "la-verriere-bordeaux",
  "le-comptoir-lille",
]);

export function LocationPhoto({
  slug,
  alt = "",
  variant = "standalone",
  zoom = false,
  priority = false,
  sizes = "(min-width: 640px) 50vw, 100vw",
  className,
}: {
  slug: string;
  /** Empty by default: on a card the location's name is the text right below. */
  alt?: string;
  /** "top": no bottom border, rounds only the top corners — for stacking
   *  directly above a content block that supplies its own bottom border,
   *  so the two read as one card rather than two boxes with a gap. */
  variant?: "standalone" | "top";
  /** Subtle scale-up on the parent `group`'s hover, for a clickable card. */
  zoom?: boolean;
  /** Set on the one photo that is the page's main image: loaded at once,
   *  ahead of the other images, instead of lazily. */
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const file = SLUGS_WITH_PHOTO.has(slug) ? slug : "default";

  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden border border-line bg-paper",
        variant === "standalone" ? "rounded-sm" : "rounded-t-sm border-b-0",
        className,
      )}
    >
      <Image
        src={`/images/locations/${file}.jpg`}
        alt={alt}
        fill
        sizes={sizes}
        // `priority` is deprecated in Next.js 16: say the two things it meant.
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={cn(
          "object-cover",
          zoom && "transition-transform duration-300 group-hover:scale-105",
        )}
      />
    </div>
  );
}
