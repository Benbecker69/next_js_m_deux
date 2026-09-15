import "server-only";
import { unstable_cache } from "next/cache";
import type { Location } from "@/types/domain";
import { createCollection } from "./store";
import { SEED_LOCATIONS } from "./seed";

const locations = createCollection<Location>("locations", SEED_LOCATIONS);

export async function listLocations(): Promise<Location[]> {
  return locations.list();
}

/**
 * Cached read for public marketing pages only (homepage, /lieux, sitemap) —
 * app/admin pages keep using listLocations() directly so an admin edit is
 * visible to them immediately. Invalidated by the "locations" tag whenever
 * an admin creates or updates a location — see admin/lieux/**\/_actions.ts.
 */
export const getCachedLocations = unstable_cache(listLocations, ["locations"], {
  tags: ["locations"],
});

export async function getLocationById(id: string): Promise<Location | null> {
  return locations.get(id);
}

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  return locations.find((location) => location.slug === slug);
}

export async function createLocation(location: Location): Promise<Location> {
  return locations.insert(location);
}

export async function updateLocation(
  id: string,
  patch: Partial<Location>,
): Promise<Location | null> {
  return locations.update(id, patch);
}
