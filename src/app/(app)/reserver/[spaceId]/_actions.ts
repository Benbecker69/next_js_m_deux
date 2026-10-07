"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth/session";
import { listReservationsBySpace } from "@/lib/data/reservations";
import { getSpaceById } from "@/lib/data/spaces";
import { isWithinOpeningHours } from "@/lib/booking/opening-hours";
import { maxBookingDate } from "@/lib/booking/slots";
import { ApiError } from "@/lib/mobile/http";
import { createReservation } from "@/lib/mobile/reservations";
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

      // The picker only offers these hours; a direct call must not get
      // around them.
      if (!isWithinOpeningHours(new Date(startAt), new Date(endAt))) {
        return {
          error:
            "Les espaces se réservent par heures entières, entre 9 h et 18 h. Choisissez un créneau dans ces horaires.",
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

      // The checks above read the state a moment ago and only serve to
      // answer with a precise sentence. The booking itself is one database
      // transaction (the same function as the mobile app's): it checks the
      // slot and debits the credits together, so two requests at the same
      // instant cannot both get the slot, and the balance cannot go wrong.
      try {
        await createReservation(user.id, {
          spaceId: space.id,
          startAt: new Date(startAt),
          endAt: new Date(endAt),
        });
      } catch (error) {
        // Lost a race (slot just taken, credits just spent): the function
        // answers with a sentence of its own.
        if (error instanceof ApiError) return { error: error.message };
        throw error;
      }

      // The (app) layout (sidebar credits) is shared across routes and would
      // otherwise keep showing the pre-booking balance from the router cache.
      revalidatePath("/tableau-de-bord", "layout");
      redirect(withFlash("/tableau-de-bord", "reservation-confirmee"));
    },
    (error) => ({ error }),
  );
}
