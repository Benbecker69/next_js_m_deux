import "server-only";
import type {
  CheckIn as CheckInRow,
  Location as LocationRow,
  Prisma,
  Reservation as ReservationRow,
  Space as SpaceRow,
} from "@/generated/prisma";
import type { User } from "@/types/domain";
import { MOBILE_CONFIG } from "./config";

// The JSON shapes the mobile app receives. Route Handlers only ever return
// these — never a raw Prisma row — and every date is an ISO 8601 UTC string.

export const reservationInclude = {
  space: { include: { location: true } },
  // At most one accepted check-in matters: it tells whether the arrival is done.
  checkIns: { where: { accepted: true }, select: { id: true, createdAt: true }, take: 1 },
} satisfies Prisma.ReservationInclude;

export type ReservationRecord = Prisma.ReservationGetPayload<{
  include: typeof reservationInclude;
}>;

export type CheckInState = "available" | "too_early" | "expired" | "done" | "unavailable";

export function toMeDto(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    memberType: user.memberType,
    credits: user.credits,
    // Onboarding stays a web flow: the app only reports whether it was done.
    onboardingCompleted: user.onboardingCompletedAt !== null,
  };
}

export function toLocationDto(row: LocationRow) {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
  };
}

export function toSpaceDto(row: SpaceRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    capacity: row.capacity,
    pricePerHour: row.pricePerHour,
  };
}

/**
 * Decided on the server so the app never re-implements the rule: it only
 * displays `state` (and `opensAt` when it is too early).
 */
export function checkInEligibility(
  record: Pick<ReservationRecord, "status" | "startAt" | "endAt" | "checkIns">,
  now: Date,
) {
  const opensAt = new Date(
    record.startAt.getTime() - MOBILE_CONFIG.checkIn.opensBeforeStartMs,
  );
  // `.at(0)`, not `[0]`: indexing is typed as "always there", which would
  // make `doneAt` look like it can never be null.
  const doneAt = record.checkIns.at(0)?.createdAt ?? null;
  let state: CheckInState;
  if (record.status !== "confirmed") state = "unavailable";
  else if (doneAt) state = "done";
  else if (now < opensAt) state = "too_early";
  else if (now > record.endAt) state = "expired";
  else state = "available";
  return {
    state,
    opensAt: opensAt.toISOString(),
    closesAt: record.endAt.toISOString(),
    doneAt: doneAt?.toISOString() ?? null,
  };
}

export function toReservationDto(record: ReservationRecord, now: Date) {
  return {
    id: record.id,
    status: record.status,
    startAt: record.startAt.toISOString(),
    endAt: record.endAt.toISOString(),
    creditsSpent: record.creditsSpent,
    createdAt: record.createdAt.toISOString(),
    space: toSpaceDto(record.space),
    location: toLocationDto(record.space.location),
    checkIn: checkInEligibility(record, now),
  };
}

export function toCheckInDto(row: CheckInRow) {
  return {
    id: row.id,
    reservationId: row.reservationId,
    accepted: row.accepted,
    reason: row.reason,
    distanceM: Math.round(row.distanceM),
    accuracyM: Math.round(row.accuracyM),
    scannedSpaceId: row.scannedSpaceId,
    createdAt: row.createdAt.toISOString(),
  };
}

export type CheckInHistoryRecord = CheckInRow & {
  reservation: ReservationRow & { space: SpaceRow & { location: LocationRow } };
};

export function toCheckInHistoryDto(record: CheckInHistoryRecord) {
  return {
    ...toCheckInDto(record),
    reservation: {
      id: record.reservation.id,
      startAt: record.reservation.startAt.toISOString(),
      endAt: record.reservation.endAt.toISOString(),
      space: toSpaceDto(record.reservation.space),
      location: toLocationDto(record.reservation.space.location),
    },
  };
}
