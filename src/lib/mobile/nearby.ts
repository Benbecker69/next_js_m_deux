import "server-only";
import { prisma } from "@/lib/db/prisma";
import { distanceKm } from "@/lib/geo/distance";
import { MOBILE_CONFIG } from "./config";
import { toLocationDto, toSpaceDto } from "./dto";
import { assertBookableSlot, computeCredits } from "./reservations";

/**
 * Active spaces that are free on the given slot (default: now → +1 h), nearest
 * first. Without a position — the phone refused the permission — the list is
 * not empty: it falls back to alphabetical order, so the app keeps working.
 */
export async function listNearbySpaces(input: {
  lat?: number;
  lng?: number;
  startAt?: Date;
  endAt?: Date;
  limit?: number;
}) {
  const startAt = input.startAt ?? new Date();
  const endAt =
    input.endAt ?? new Date(startAt.getTime() + MOBILE_CONFIG.booking.defaultDurationMs);
  assertBookableSlot(startAt, endAt, new Date());

  const spaces = await prisma.space.findMany({
    where: { status: "active" },
    include: { location: true },
  });
  const busy = await prisma.reservation.findMany({
    where: {
      status: "confirmed",
      spaceId: { in: spaces.map((space) => space.id) },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { spaceId: true },
  });
  const busyIds = new Set(busy.map((reservation) => reservation.spaceId));

  const here =
    input.lat !== undefined && input.lng !== undefined
      ? { lat: input.lat, lng: input.lng }
      : null;

  const items = spaces
    .filter((space) => !busyIds.has(space.id))
    .map((space) => ({
      space: toSpaceDto(space),
      location: toLocationDto(space.location),
      distanceM: here ? Math.round(distanceKm(here, space.location) * 1000) : null,
      estimatedCredits: computeCredits(space.pricePerHour, startAt, endAt),
    }))
    .sort(
      (a, b) =>
        (a.distanceM ?? 0) - (b.distanceM ?? 0) ||
        a.location.city.localeCompare(b.location.city, "fr") ||
        a.space.name.localeCompare(b.space.name, "fr"),
    );

  return {
    slot: { startAt: startAt.toISOString(), endAt: endAt.toISOString() },
    hasPosition: here !== null,
    items: items.slice(0, input.limit ?? MOBILE_CONFIG.nearby.defaultLimit),
  };
}
