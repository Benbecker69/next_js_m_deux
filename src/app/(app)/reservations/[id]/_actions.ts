"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth/session";
import { getReservationById, updateReservation } from "@/lib/data/reservations";
import { updateUser } from "@/lib/data/users";
import {
  MESSAGES,
  credits,
  formatSlot,
  type ActionResult,
} from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";

export async function cancelReservationAction(
  reservationId: string,
): Promise<ActionResult> {
  const user = await requireOnboarded();

  return guardAction<ActionResult>(
    async () => {
      const reservation = await getReservationById(reservationId);
      // Someone else's reservation gets the same answer as a missing one.
      if (!reservation || reservation.userId !== user.id) {
        return {
          ok: false,
          error:
            "Cette réservation est introuvable. Elle a peut-être été supprimée : rechargez la page.",
        };
      }
      if (reservation.status === "cancelled") {
        return { ok: false, error: "Cette réservation est déjà annulée." };
      }
      if (
        reservation.status !== "confirmed" ||
        new Date(reservation.startAt) <= new Date()
      ) {
        return {
          ok: false,
          error: `Ce créneau a commencé le ${formatSlot(reservation.startAt)} : il ne peut plus être annulé.`,
        };
      }

      const cancelled = await updateReservation(reservation.id, { status: "cancelled" });
      if (!cancelled) {
        return { ok: false, error: MESSAGES.notSaved };
      }
      await updateUser(user.id, { credits: user.credits + reservation.creditsSpent });

      revalidatePath("/tableau-de-bord", "layout");
      revalidatePath(`/reservations/${reservation.id}`);
      revalidatePath("/reservations");

      const refund = reservation.creditsSpent;
      return {
        ok: true,
        message: `Réservation annulée. ${credits(refund)} ${refund === 1 ? "a été recrédité" : "ont été recrédités"} sur votre solde.`,
      };
    },
    (error) => ({ ok: false, error }),
  );
}
