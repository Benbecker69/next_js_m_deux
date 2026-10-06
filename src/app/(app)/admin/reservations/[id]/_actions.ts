"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getReservationById, updateReservation } from "@/lib/data/reservations";
import { getUserById, updateUser } from "@/lib/data/users";
import { MESSAGES, credits, type ActionResult } from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";

// Admin cancellation differs from a member's: no "must be in the future"
// restriction — an admin may need to correct a past reservation too.
export async function adminCancelReservationAction(
  reservationId: string,
): Promise<ActionResult> {
  await requireAdmin();

  return guardAction<ActionResult>(
    async () => {
      const reservation = await getReservationById(reservationId);
      if (!reservation) {
        return {
          ok: false,
          error:
            "Cette réservation est introuvable. Elle a peut-être été supprimée : rechargez la page.",
        };
      }
      if (reservation.status === "cancelled") {
        return { ok: false, error: "Cette réservation est déjà annulée." };
      }
      if (reservation.status !== "confirmed") {
        return {
          ok: false,
          error: "Cette réservation est terminée : elle ne peut plus être annulée.",
        };
      }

      const member = await getUserById(reservation.userId);
      const cancelled = await updateReservation(reservation.id, { status: "cancelled" });
      if (!cancelled) {
        return { ok: false, error: MESSAGES.notSaved };
      }
      if (member) {
        await updateUser(member.id, {
          credits: member.credits + reservation.creditsSpent,
        });
      }

      revalidatePath(`/admin/reservations/${reservation.id}`);
      revalidatePath("/admin/reservations");
      revalidatePath("/admin");
      revalidatePath("/tableau-de-bord", "layout");
      revalidatePath("/reservations");

      const refund = credits(reservation.creditsSpent);
      return {
        ok: true,
        message: member
          ? `Réservation annulée. ${refund} rendu${reservation.creditsSpent === 1 ? "" : "s"} à ${member.name}.`
          : "Réservation annulée. Le compte du membre n'existe plus : aucun crédit à rendre.",
      };
    },
    (error) => ({ ok: false, error }),
  );
}
