"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth/session";
import { createReservation, listReservationsBySpace } from "@/lib/data/reservations";
import { getSpaceById } from "@/lib/data/spaces";
import { updateUser } from "@/lib/data/users";
import { maxBookingDate } from "@/lib/booking/slots";
import { createReservationSchema } from "@/lib/validation/reservation";
import { withFlash } from "@/lib/feedback/flash-messages";
import {
  credits,
  formatSlot,
  validationFailure,
  type FieldErrors,
} from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";

export type ReservationFormState = {
  error: string | null;
  fieldErrors?: FieldErrors;
};

export async function createReservationAction(
  _prevState: ReservationFormState,
  formData: FormData,
): Promise<ReservationFormState> {
  const user = await requireOnboarded();

  const parsed = createReservationSchema.safeParse({
    spaceId: formData.get("spaceId"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  });
  if (!parsed.success) {
    return validationFailure(parsed.error);
  }
  const { startAt, endAt } = parsed.data;

  return guardAction<ReservationFormState>(
    async () => {
      const space = await getSpaceById(parsed.data.spaceId);
      if (!space) {
        return {
          error: "Cet espace n'existe plus. Revenez à la liste pour en choisir un autre.",
        };
      }
      if (space.status !== "active") {
        return {
          error: `« ${space.name} » est en maintenance et ne peut pas être réservé pour le moment. Choisissez un autre espace.`,
        };
      }
      if (new Date(startAt) < new Date()) {
        return {
          error: `Le créneau du ${formatSlot(startAt)} est déjà passé. Choisissez une heure à venir.`,
        };
      }

      // One day of margin: the server may not be in the member's time zone.
      const latestStart = maxBookingDate(new Date()).getTime() + 24 * 3_600_000;
      if (new Date(startAt).getTime() > latestStart) {
        return {
          error:
            "Vous pouvez réserver jusqu'à un mois à l'avance. Choisissez un jour plus proche.",
        };
      }

      const hours = (new Date(endAt).getTime() - new Date(startAt).getTime()) / 3_600_000;
      const cost = Math.round(space.pricePerHour * hours);

      if (user.credits < cost) {
        return {
          error: `Il vous manque ${credits(cost - user.credits)} : ce créneau coûte ${credits(cost)} et votre solde est de ${credits(user.credits)}.`,
        };
      }

      const existing = await listReservationsBySpace(space.id);
      const overlaps = existing.some(
        (reservation) =>
          reservation.status === "confirmed" &&
          new Date(startAt) < new Date(reservation.endAt) &&
          new Date(endAt) > new Date(reservation.startAt),
      );
      if (overlaps) {
        return {
          error: `Le créneau du ${formatSlot(startAt)} vient d'être réservé par quelqu'un d'autre. Choisissez une autre heure.`,
        };
      }

      await createReservation({
        id: crypto.randomUUID(),
        userId: user.id,
        spaceId: space.id,
        startAt,
        endAt,
        status: "confirmed",
        creditsSpent: cost,
        createdAt: new Date().toISOString(),
      });
      await updateUser(user.id, { credits: user.credits - cost });

      // The (app) layout (sidebar credits) is shared across routes and would
      // otherwise keep showing the pre-booking balance from the router cache.
      revalidatePath("/tableau-de-bord", "layout");
      redirect(withFlash("/tableau-de-bord", "reservation-confirmee"));
    },
    (error) => ({ error }),
  );
}
