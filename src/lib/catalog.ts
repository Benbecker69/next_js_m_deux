import type { Location, Space, SpaceType } from "@/types/domain";

/**
 * Figures derived from the locations and their spaces — which cities exist,
 * what each space type costs, what a location offers. Pure functions (no
 * database, no React) shared by the public pages and the booking list, so
 * "from 4 credits an hour" is computed the same way everywhere and never
 * typed by hand in the copy.
 */

/** The order space types are always shown in: cheapest kind of use first. */
export const SPACE_TYPES: SpaceType[] = [
  "poste-flex",
  "phone-booth",
  "bureau-prive",
  "salle-reunion",
];

export function isSpaceType(value: unknown): value is SpaceType {
  return SPACE_TYPES.includes(value as SpaceType);
}

/** Only spaces a member can actually book. */
export function activeSpaces(spaces: Space[]): Space[] {
  return spaces.filter((space) => space.status === "active");
}

/** Every city that has a location, alphabetically, without duplicates. */
export function listCities(locations: Location[]): string[] {
  return [...new Set(locations.map((location) => location.city))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}

export type PriceRange = { min: number; max: number };

/** Lowest and highest hourly price of a set of spaces; `null` when it is empty. */
export function priceRange(spaces: Space[]): PriceRange | null {
  if (spaces.length === 0) return null;
  const prices = spaces.map((space) => space.pricePerHour);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** "4" when every space costs the same, "8 à 9" otherwise. */
export function formatPriceRange(range: PriceRange, separator = "à"): string {
  return range.min === range.max
    ? String(range.min)
    : `${range.min} ${separator} ${range.max}`;
}

export type LocationSummary = {
  location: Location;
  /** Bookable spaces of this location. */
  spaces: Space[];
  /** The types it offers, in display order. */
  types: SpaceType[];
  /** Cheapest hourly price, `null` when the location has no bookable space. */
  fromPrice: number | null;
};

/** What a location card needs to say about its location. */
export function summarizeLocation(location: Location, spaces: Space[]): LocationSummary {
  const own = activeSpaces(spaces).filter((space) => space.locationId === location.id);
  return {
    location,
    spaces: own,
    types: SPACE_TYPES.filter((type) => own.some((space) => space.type === type)),
    fromPrice: priceRange(own)?.min ?? null,
  };
}

/** Keeps the locations in `city` (when given) that offer `type` (when given). */
export function filterLocations(
  summaries: LocationSummary[],
  filters: { city?: string; type?: SpaceType },
): LocationSummary[] {
  return summaries.filter(
    (summary) =>
      (!filters.city || summary.location.city === filters.city) &&
      (!filters.type || summary.types.includes(filters.type)),
  );
}
