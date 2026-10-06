import Image from "next/image";
import type { SpaceType } from "@/types/domain";
import { cn } from "@/lib/utils/cn";

/**
 * A small photograph of what a space of this type looks like (files in
 * `public/images/spaces/`, one per `SpaceType`). Decorative: the space's
 * name and type are always written next to it, hence the empty `alt`.
 */
const PHOTO_BY_TYPE: Record<SpaceType, string> = {
  "poste-flex": "/images/spaces/poste-flex.jpg",
  "bureau-prive": "/images/spaces/bureau-prive.jpg",
  "salle-reunion": "/images/spaces/salle-reunion.jpg",
  "phone-booth": "/images/spaces/phone-booth.jpg",
};

export function SpacePhoto({
  type,
  variant = "thumb",
  sizes = "96px",
  className,
}: {
  type: SpaceType;
  /** "thumb": a small framed thumbnail in a list row. "cover": the full-width
   *  top of a card, which supplies the frame itself. Two variants rather
   *  than a className override: `cn` does not resolve conflicting classes. */
  variant?: "thumb" | "cover";
  /** The thumbnail is 96px wide by default; pass the real width when larger. */
  sizes?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden bg-paper",
        variant === "thumb"
          ? "w-24 shrink-0 rounded-sm border border-line"
          : "w-full border-b border-line",
        className,
      )}
    >
      <Image
        src={PHOTO_BY_TYPE[type]}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}
