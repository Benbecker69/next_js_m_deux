"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getReservationById, updateReservation } from "@/lib/data/reservations";
import { getUserById, updateUser } from "@/lib/data/users";

// Admin cancellation differs from a member's: no "must be in the future"
// restriction — an admin may need to correct a past reservation too.
export async function adminCancelReservationAction(reservationId: string): Promise<void> {
  await requireAdmin();
  const reservation = await getReservationById(reservationId);
  if (!reservation) {
    throw new Error("Réservation introuvable.");
  }
  if (reservation.status !== "confirmed") {
    throw new Error("Cette réservation n'est plus active.");
  }

  const member = await getUserById(reservation.userId);
  await updateReservation(reservation.id, { status: "cancelled" });
  if (member) {
    await updateUser(member.id, { credits: member.credits + reservation.creditsSpent });
  }

  revalidatePath(`/admin/reservations/${reservation.id}`);
  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
  revalidatePath("/tableau-de-bord", "layout");
  revalidatePath("/reservations");
}
