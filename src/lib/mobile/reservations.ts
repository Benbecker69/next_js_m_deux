import "server-only";
import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import { MOBILE_CONFIG } from "./config";
import { reservationInclude, toReservationDto } from "./dto";
import { ApiError } from "./http";
import { withSerializableTransaction } from "./transaction";

// Booking and cancelling, for the mobile API and for the website's Server
// Actions alike. These two operations must be atomic: reading a balance, then
// writing it back in a second query, would let two requests at the same
// instant double-book a slot or lose credits. Here each operation is a single
// interactive transaction, and the credit changes are conditional updates.

const HOUR_MS = 3_600_000;

/** Same formula as the web booking action (createReservationAction). */
export function computeCredits(pricePerHour: number, startAt: Date, endAt: Date): number {
  const hours = (endAt.getTime() - startAt.getTime()) / HOUR_MS;
  return Math.round(pricePerHour * hours);
}

export function assertBookableSlot(startAt: Date, endAt: Date, now: Date): void {
  const { startToleranceMs, maxAdvanceMs, minDurationMs, maxDurationMs } =
    MOBILE_CONFIG.booking;
  if (startAt.getTime() < now.getTime() - startToleranceMs) {
    throw new ApiError(
      422,
      "SLOT_IN_PAST",
      "Le créneau doit commencer maintenant ou plus tard.",
    );
  }
  if (startAt.getTime() > now.getTime() + maxAdvanceMs) {
    throw new ApiError(
      422,
      "SLOT_TOO_FAR",
      "Vous pouvez réserver jusqu'à un mois à l'avance.",
    );
  }
  const duration = endAt.getTime() - startAt.getTime();
  if (duration < minDurationMs) {
    throw new ApiError(422, "SLOT_TOO_SHORT", "La durée minimale est de 30 minutes.");
  }
  if (duration > maxDurationMs) {
    throw new ApiError(422, "SLOT_TOO_LONG", "La durée maximale est de 12 heures.");
  }
}

export async function createReservation(
  userId: string,
  input: { spaceId: string; startAt: Date; endAt: Date },
) {
  assertBookableSlot(input.startAt, input.endAt, new Date());

  return withSerializableTransaction(async (tx) => {
    const space = await tx.space.findUnique({ where: { id: input.spaceId } });
    if (!space) {
      throw new ApiError(404, "SPACE_NOT_FOUND", "Cet espace n'existe pas.");
    }
    if (space.status !== "active") {
      throw new ApiError(409, "SPACE_UNAVAILABLE", "Cet espace n'est plus disponible.");
    }

    const clash = await tx.reservation.findFirst({
      where: {
        spaceId: space.id,
        status: "confirmed",
        startAt: { lt: input.endAt },
        endAt: { gt: input.startAt },
      },
      select: { id: true },
    });
    if (clash) {
      throw new ApiError(
        409,
        "SLOT_TAKEN",
        "Ce créneau vient d'être réservé. Choisissez-en un autre.",
      );
    }

    const cost = computeCredits(space.pricePerHour, input.startAt, input.endAt);
    // Debit only if the balance is still enough at this very instant: the
    // check and the write are one statement, so it cannot go negative.
    const debit = await tx.user.updateMany({
      where: { id: userId, credits: { gte: cost } },
      data: { credits: { decrement: cost } },
    });
    if (debit.count !== 1) {
      throw new ApiError(
        402,
        "INSUFFICIENT_CREDITS",
        "Crédits insuffisants pour cette réservation.",
      );
    }

    const created = await tx.reservation.create({
      data: {
        userId,
        spaceId: space.id,
        startAt: input.startAt,
        endAt: input.endAt,
        status: "confirmed",
        creditsSpent: cost,
      },
      include: reservationInclude,
    });
    const { credits } = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { credits: true },
    });
    return { reservation: toReservationDto(created, new Date()), credits };
  });
}

export async function cancelReservation(userId: string, reservationId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: reservationInclude,
    });
    // Someone else's reservation looks exactly like a missing one.
    if (!existing || existing.userId !== userId) {
      throw new ApiError(404, "RESERVATION_NOT_FOUND", "Réservation introuvable.");
    }
    if (existing.status !== "confirmed") {
      throw new ApiError(
        409,
        "NOT_CANCELLABLE",
        "Cette réservation ne peut plus être annulée.",
      );
    }
    if (existing.checkIns.length > 0) {
      throw new ApiError(
        409,
        "ALREADY_CHECKED_IN",
        "Votre arrivée est déjà validée : annulation impossible.",
      );
    }
    if (existing.startAt.getTime() <= Date.now()) {
      throw new ApiError(409, "ALREADY_STARTED", "Cette réservation a déjà commencé.");
    }

    // Conditional update: of two simultaneous cancellations only the first
    // matches `status: "confirmed"`, so the refund is paid exactly once.
    const cancelled = await tx.reservation.updateMany({
      where: { id: reservationId, status: "confirmed" },
      data: { status: "cancelled" },
    });
    if (cancelled.count !== 1) {
      throw new ApiError(
        409,
        "NOT_CANCELLABLE",
        "Cette réservation ne peut plus être annulée.",
      );
    }
    const { credits } = await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: existing.creditsSpent } },
      select: { credits: true },
    });
    return {
      reservation: toReservationDto({ ...existing, status: "cancelled" }, new Date()),
      credits,
    };
  });
}

export async function getReservation(userId: string, reservationId: string) {
  const record = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: reservationInclude,
  });
  if (!record || record.userId !== userId) {
    throw new ApiError(404, "RESERVATION_NOT_FOUND", "Réservation introuvable.");
  }
  return toReservationDto(record, new Date());
}

export async function listReservations(
  userId: string,
  options: {
    limit?: number;
    cursor?: string;
    scope?: "upcoming" | "past" | "all";
  },
) {
  const now = new Date();
  const limit = options.limit ?? MOBILE_CONFIG.pagination.defaultLimit;
  const scope = options.scope ?? "all";

  const where: Prisma.ReservationWhereInput = { userId };
  if (scope === "upcoming") {
    where.status = "confirmed";
    where.endAt = { gte: now };
  } else if (scope === "past") {
    where.OR = [{ status: { not: "confirmed" } }, { endAt: { lt: now } }];
  }
  const direction = scope === "upcoming" ? "asc" : "desc";

  // Cursor pagination: ask for one row more than the page to know if there is a next page.
  const rows = await prisma.reservation.findMany({
    where,
    include: reservationInclude,
    orderBy: [{ startAt: direction }, { id: direction }],
    take: limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  });
  const page = rows.slice(0, limit);
  return {
    items: page.map((row) => toReservationDto(row, now)),
    nextCursor: rows.length > limit ? (page[page.length - 1]?.id ?? null) : null,
  };
}
