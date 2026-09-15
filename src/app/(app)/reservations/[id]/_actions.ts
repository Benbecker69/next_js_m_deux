"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth/session";
import { getReservationById, updateReservation } from "@/lib/data/reservations";
import { updateUser } from "@/lib/data/users";

export async function cancelReservationAction(reservationId: string): Promise<void> {
  const user = await requireOnboarded();
  const reservation = await getReservationById(reservationId);
  if (!reservation || reservation.userId !== user.id) {
    throw new Error("Réservation introuvable.");
  }
  if (reservation.status !== "confirmed" || new Date(reservation.startAt) <= new Date()) {
    throw new Error("Cette réservation ne peut plus être annulée.");
  }

  await updateReservation(reservation.id, { status: "cancelled" });
  await updateUser(user.id, { credits: user.credits + reservation.creditsSpent });

  revalidatePath("/tableau-de-bord", "layout");
  revalidatePath(`/reservations/${reservation.id}`);
  revalidatePath("/reservations");
}
