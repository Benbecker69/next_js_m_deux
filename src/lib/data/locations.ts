import "server-only";
import type { Location } from "@/types/domain";
import { createCollection } from "./store";
import { SEED_LOCATIONS } from "./seed";

const locations = createCollection<Location>("locations", SEED_LOCATIONS);

export async function listLocations(): Promise<Location[]> {
  return locations.list();
}

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
