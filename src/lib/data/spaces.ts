import "server-only";
import { unstable_cache } from "next/cache";
import type { Prisma, Space as SpaceRow } from "@/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import type { Space } from "@/types/domain";

function toSpace(row: SpaceRow): Space {
  return {
    id: row.id,
    locationId: row.locationId,
    name: row.name,
    // `type` is a plain string column — see prisma/schema.prisma comment.
    type: row.type as Space["type"],
    capacity: row.capacity,
    pricePerHour: row.pricePerHour,
    status: row.status,
  };
}

export async function listSpaces(): Promise<Space[]> {
  const rows = await prisma.space.findMany({ orderBy: { name: "asc" } });
  return rows.map(toSpace);
}

/** Cached read for public marketing pages — see getCachedLocations for why. */
export const getCachedSpaces = unstable_cache(listSpaces, ["spaces"], {
  tags: ["spaces"],
});

export async function getSpaceById(id: string): Promise<Space | null> {
  const row = await prisma.space.findUnique({ where: { id } });
  return row ? toSpace(row) : null;
}

export async function listSpacesByLocation(locationId: string): Promise<Space[]> {
  const rows = await prisma.space.findMany({
    where: { locationId },
    orderBy: { name: "asc" },
  });
  return rows.map(toSpace);
}

export async function createSpace(space: Space): Promise<Space> {
  // "Unchecked" input: `space` carries a flat locationId scalar (matching
  // the domain type), not Prisma's nested relation-connect shape.
  const row = await prisma.space.create({
    data: space as Prisma.SpaceUncheckedCreateInput,
  });
  return toSpace(row);
}

export async function updateSpace(
  id: string,
  patch: Partial<Space>,
): Promise<Space | null> {
  try {
    const row = await prisma.space.update({
      where: { id },
      data: patch as Prisma.SpaceUncheckedUpdateInput,
    });
    return toSpace(row);
  } catch {
    return null;
  }
}

export async function deleteSpace(id: string): Promise<boolean> {
  try {
    await prisma.space.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
