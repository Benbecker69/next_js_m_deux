import "server-only";
import { prisma } from "@/lib/db/prisma";
import { distanceKm } from "@/lib/geo/distance";
import { MOBILE_CONFIG } from "./config";
import { toCheckInDto, toCheckInHistoryDto } from "./dto";
import { ApiError } from "./http";
import { withSerializableTransaction } from "./transaction";

// Check-in: the phone reports where it is, the SERVER decides. The reported
// position can be faked (a rooted phone, a modified app), so this proves
// presence only as far as a phone can be trusted — a limit worth stating.

export type CheckInRefusal =
  | "NOT_CONFIRMED"
  | "TOO_EARLY"
  | "TOO_LATE"
  | "LOW_ACCURACY"
  | "STALE_POSITION"
  | "TOO_FAR";

/** First rule that fails wins; null means the check-in is accepted. */
export function refusalReason(input: {
  status: string;
  startAt: Date;
  endAt: Date;
  now: Date;
  accuracyM: number;
  capturedAt: Date;
  distanceM: number;
}): CheckInRefusal | null {
  const { opensBeforeStartMs, maxAccuracyM, maxPositionAgeMs, radiusM } =
    MOBILE_CONFIG.checkIn;
  const now = input.now.getTime();
  if (input.status !== "confirmed") return "NOT_CONFIRMED";
  if (now < input.startAt.getTime() - opensBeforeStartMs) return "TOO_EARLY";
  if (now > input.endAt.getTime()) return "TOO_LATE";
  if (input.accuracyM > maxAccuracyM) return "LOW_ACCURACY";
  if (Math.abs(now - input.capturedAt.getTime()) > maxPositionAgeMs) {
    return "STALE_POSITION";
  }
  if (input.distanceM > radiusM) return "TOO_FAR";
  return null;
}

export async function performCheckIn(
  userId: string,
  reservationId: string,
  input: { lat: number; lng: number; accuracyM: number; capturedAt: Date },
) {
  return withSerializableTransaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: {
        space: { include: { location: true } },
        checkIns: { where: { accepted: true }, select: { id: true }, take: 1 },
      },
    });
    if (!reservation || reservation.userId !== userId) {
      throw new ApiError(404, "RESERVATION_NOT_FOUND", "Réservation introuvable.");
    }
    if (reservation.checkIns.length > 0) {
      throw new ApiError(409, "ALREADY_CHECKED_IN", "Votre arrivée est déjà validée.");
    }

    const distanceM = Math.round(distanceKm(input, reservation.space.location) * 1000);
    const reason = refusalReason({
      status: reservation.status,
      startAt: reservation.startAt,
      endAt: reservation.endAt,
      now: new Date(),
      accuracyM: input.accuracyM,
      capturedAt: input.capturedAt,
      distanceM,
    });

    // Every attempt is recorded, refused ones included: that is the trace.
    const row = await tx.checkIn.create({
      data: {
        reservationId,
        userId,
        lat: input.lat,
        lng: input.lng,
        accuracyM: input.accuracyM,
        distanceM,
        accepted: reason === null,
        reason,
      },
    });
    return { checkIn: toCheckInDto(row), radiusM: MOBILE_CONFIG.checkIn.radiusM };
  });
}

export async function listCheckIns(
  userId: string,
  options: { limit?: number; cursor?: string },
) {
  const limit = options.limit ?? MOBILE_CONFIG.pagination.defaultLimit;
  const rows = await prisma.checkIn.findMany({
    where: { userId },
    include: { reservation: { include: { space: { include: { location: true } } } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  });
  const page = rows.slice(0, limit);
  return {
    items: page.map(toCheckInHistoryDto),
    nextCursor: rows.length > limit ? (page[page.length - 1]?.id ?? null) : null,
  };
}
