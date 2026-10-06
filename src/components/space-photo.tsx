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

export function SpacePhoto({ type, className }: { type: SpaceType; className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-sm border border-line bg-paper",
        className,
      )}
    >
      <Image
        src={PHOTO_BY_TYPE[type]}
        alt=""
        fill
        sizes="96px"
        className="object-cover"
      />
    </div>
  );
}
