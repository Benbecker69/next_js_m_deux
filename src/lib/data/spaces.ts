import "server-only";
import { unstable_cache } from "next/cache";
import type { Space } from "@/types/domain";
import { createCollection } from "./store";
import { SEED_SPACES } from "./seed";

const spaces = createCollection<Space>("spaces", SEED_SPACES);

export async function listSpaces(): Promise<Space[]> {
  return spaces.list();
}

/** Cached read for public marketing pages — see getCachedLocations for why. */
export const getCachedSpaces = unstable_cache(listSpaces, ["spaces"], {
  tags: ["spaces"],
});

export async function getSpaceById(id: string): Promise<Space | null> {
  return spaces.get(id);
}

export async function listSpacesByLocation(locationId: string): Promise<Space[]> {
  return spaces.filter((space) => space.locationId === locationId);
}

export async function createSpace(space: Space): Promise<Space> {
  return spaces.insert(space);
}

export async function updateSpace(
  id: string,
  patch: Partial<Space>,
): Promise<Space | null> {
  return spaces.update(id, patch);
}

export async function deleteSpace(id: string): Promise<boolean> {
  return spaces.remove(id);
}
