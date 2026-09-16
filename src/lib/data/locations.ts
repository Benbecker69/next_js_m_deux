import "server-only";
import { unstable_cache } from "next/cache";
import type { Location as LocationRow } from "@/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import type { Location } from "@/types/domain";

function toLocation(row: LocationRow): Location {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    description: row.description,
    amenities: row.amenities,
  };
}

export async function listLocations(): Promise<Location[]> {
  const rows = await prisma.location.findMany({ orderBy: { name: "asc" } });
  return rows.map(toLocation);
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
  const row = await prisma.location.findUnique({ where: { id } });
  return row ? toLocation(row) : null;
}

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  const row = await prisma.location.findUnique({ where: { slug } });
  return row ? toLocation(row) : null;
}

export async function createLocation(location: Location): Promise<Location> {
  const row = await prisma.location.create({ data: location });
  return toLocation(row);
}

export async function updateLocation(
  id: string,
  patch: Partial<Location>,
): Promise<Location | null> {
  try {
    const row = await prisma.location.update({ where: { id }, data: patch });
    return toLocation(row);
  } catch {
    return null;
  }
}
