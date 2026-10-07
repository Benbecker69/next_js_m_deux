import "server-only";
import type { Prisma, Reservation as ReservationRow } from "@/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import type { Reservation } from "@/types/domain";

function toReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    userId: row.userId,
    spaceId: row.spaceId,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    status: row.status,
    creditsSpent: row.creditsSpent,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listReservations(): Promise<Reservation[]> {
  const rows = await prisma.reservation.findMany({ orderBy: { startAt: "desc" } });
  return rows.map(toReservation);
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  const row = await prisma.reservation.findUnique({ where: { id } });
  return row ? toReservation(row) : null;
}

export async function listReservationsByUser(userId: string): Promise<Reservation[]> {
  const rows = await prisma.reservation.findMany({
    where: { userId },
    orderBy: { startAt: "desc" },
  });
  return rows.map(toReservation);
}

export async function listReservationsBySpace(spaceId: string): Promise<Reservation[]> {
  const rows = await prisma.reservation.findMany({
    where: { spaceId },
    orderBy: { startAt: "desc" },
  });
  return rows.map(toReservation);
}

export async function createReservation(reservation: Reservation): Promise<Reservation> {
  // "Unchecked" input: `reservation` carries flat userId/spaceId scalars
  // (matching the domain type), not Prisma's nested relation-connect shape.
  const row = await prisma.reservation.create({
    data: reservation as Prisma.ReservationUncheckedCreateInput,
  });
  return toReservation(row);
}

/**
 * Cancels a confirmed reservation and gives its credits back to the member,
 * as one transaction: either both happen or neither does. The status only
 * changes `WHERE status = 'confirmed'`, so of two cancellations at the same
 * instant a single one matches — the refund is paid once. Returns null when
 * the reservation was not (or no longer) confirmed.
 */
export async function cancelReservationWithRefund(
  id: string,
): Promise<Reservation | null> {
  return prisma.$transaction(async (tx) => {
    const cancelled = await tx.reservation.updateMany({
      where: { id, status: "confirmed" },
      data: { status: "cancelled" },
    });
    if (cancelled.count !== 1) return null;

    const row = await tx.reservation.findUniqueOrThrow({ where: { id } });
    await tx.user.update({
      where: { id: row.userId },
      data: { credits: { increment: row.creditsSpent } },
    });
    return toReservation(row);
  });
}

export async function updateReservation(
  id: string,
  patch: Partial<Reservation>,
): Promise<Reservation | null> {
  try {
    const row = await prisma.reservation.update({
      where: { id },
      data: patch as Prisma.ReservationUncheckedUpdateInput,
    });
    return toReservation(row);
  } catch {
    return null;
  }
}
