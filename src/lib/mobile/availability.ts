import "server-only";
import { prisma } from "@/lib/db/prisma";
import { toLocationDto, toSpaceDto } from "./dto";
import { ApiError } from "./http";

// Backs the mobile app's "pick a specific space and slot" screen: the space
// itself plus the confirmed reservations that make part of the requested
// window unbookable. Queries Prisma directly rather than the web's
// `src/lib/data/*` repositories — same reasoning as `nearby.ts`: those
// return the web's domain shapes (already-mapped dates/fields), not the raw
// Prisma rows `toSpaceDto`/`toLocationDto` expect.

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 7;
const MAX_RANGE_DAYS = 30;

export async function getSpaceAvailability(input: {
  spaceId: string;
  from?: Date;
  to?: Date;
}) {
  const space = await prisma.space.findUnique({
    where: { id: input.spaceId },
    include: { location: true },
  });
  if (!space || space.status !== "active") {
    throw new ApiError(404, "SPACE_NOT_FOUND", "Cet espace n'existe pas.");
  }

  const from = input.from ?? new Date();
  const to = input.to ?? new Date(from.getTime() + DEFAULT_RANGE_DAYS * DAY_MS);
  if (to.getTime() <= from.getTime()) {
    throw new ApiError(422, "VALIDATION_ERROR", "La période demandée est invalide.");
  }
  if (to.getTime() - from.getTime() > MAX_RANGE_DAYS * DAY_MS) {
    throw new ApiError(422, "VALIDATION_ERROR", "La période demandée est trop longue.");
  }

  // Only confirmed reservations block a slot (same overlap test as
  // `nearby.ts`/`reservations.ts`); only start/end leave this module — no
  // other user's identity or reservation details are exposed.
  const busy = await prisma.reservation.findMany({
    where: {
      spaceId: space.id,
      status: "confirmed",
      startAt: { lt: to },
      endAt: { gt: from },
    },
    select: { startAt: true, endAt: true },
    orderBy: { startAt: "asc" },
  });

  return {
    space: toSpaceDto(space),
    location: toLocationDto(space.location),
    busySlots: busy.map((slot) => ({
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
    })),
  };
}
