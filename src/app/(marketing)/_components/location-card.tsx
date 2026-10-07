import Link from "next/link";
import { MapPin } from "lucide-react";
import { LocationPhoto } from "@/components/location-photo";
import { Badge } from "@/components/ui/badge";
import type { LocationSummary } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { SPACE_TYPE_LABELS } from "@/types/domain";

// One location as a card: photo, where it is, what it offers, its lowest
// price. Used on the home page and on /lieux, so a location looks the same
// wherever it is listed.
export function LocationCard({
  summary,
  t,
  headingLevel = "h3",
  priority = false,
}: {
  summary: LocationSummary;
  t: Dictionary["site"]["places"];
  /** "h2" where the cards come right under the page title (/lieux), "h3"
   *  where a section title sits in between (home page): no level is skipped. */
  headingLevel?: "h2" | "h3";
  /** The first card of a page that opens on the list: its photo is the
   *  largest image on screen and must not be lazy-loaded. */
  priority?: boolean;
}) {
  const { location, spaces, types, fromPrice } = summary;
  const Heading = headingLevel;

  return (
    <Link
      href={`/lieux/${location.slug}`}
      className="group flex flex-col transition-transform duration-150 hover:-translate-y-0.5"
    >
      <LocationPhoto
        slug={location.slug}
        variant="top"
        zoom
        priority={priority}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="transition-colors duration-150 group-hover:border-pine"
      />
      <div className="flex flex-1 flex-col rounded-b-sm border border-t-0 border-line bg-surface p-5 transition-colors duration-150 group-hover:border-pine">
        <div className="flex items-start justify-between gap-3">
          <Heading className="font-display text-xl font-medium text-ink">
            {location.name}
          </Heading>
          {fromPrice !== null && (
            <p className="shrink-0 text-right text-sm text-ink-muted">
              {t.from}{" "}
              <span className="font-display text-lg font-medium text-ink">
                {fromPrice}
              </span>{" "}
              {t.perHour}
            </p>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          {location.city}
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{location.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
          {types.map((type) => (
            <Badge key={type}>{SPACE_TYPE_LABELS[type]}</Badge>
          ))}
          <span className="ml-auto text-xs text-ink-muted">
            {spaces.length} {spaces.length === 1 ? t.space : t.spaces}
          </span>
        </div>
      </div>
    </Link>
  );
}
