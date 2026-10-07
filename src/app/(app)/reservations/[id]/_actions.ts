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
import { performCheckIn } from "@/lib/mobile/checkin";
import { MOBILE_CONFIG } from "@/lib/mobile/config";
import { ApiError } from "@/lib/mobile/http";
import { getReservation } from "@/lib/mobile/reservations";
import { checkInBodySchema } from "@/lib/mobile/schemas";

const NOT_FOUND =
  "Cette réservation est introuvable. Elle a peut-être été supprimée : rechargez la page.";

export async function cancelReservationAction(
  reservationId: string,
): Promise<ActionResult> {
  const user = await requireOnboarded();

  return guardAction<ActionResult>(
    async () => {
      const reservation = await getReservationById(reservationId);
      // Someone else's reservation gets the same answer as a missing one.
      if (!reservation || reservation.userId !== user.id) {
        return { ok: false, error: NOT_FOUND };
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
      // Same rule as the mobile app: once the arrival is validated the
      // booking was used, there is nothing left to refund.
      const { checkIn } = await getReservation(user.id, reservationId);
      if (checkIn.state === "done") {
        return {
          ok: false,
          error:
            "Votre arrivée est déjà validée pour cette réservation : elle ne peut plus être annulée.",
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

function meters(value: number): string {
  return value < 1000
    ? `${Math.round(value)} m`
    : `${(value / 1000).toFixed(1).replace(".", ",")} km`;
}

/** Why the server refused an arrival, and what to do about it. */
function refusalMessage(
  checkIn: { reason: string | null; distanceM: number; accuracyM: number },
  radiusM: number,
): string {
  switch (checkIn.reason) {
    case "TOO_FAR":
      return `Vous êtes à ${meters(checkIn.distanceM)} du lieu : il faut être à moins de ${radiusM} m pour valider l'arrivée.`;
    case "LOW_ACCURACY":
      return `Votre position est trop imprécise (à ${meters(checkIn.accuracyM)} près, ${MOBILE_CONFIG.checkIn.maxAccuracyM} m au maximum). Sur un ordinateur c'est fréquent : réessayez depuis votre téléphone ou l'application mobile.`;
    case "STALE_POSITION":
      return "Votre position date de plus d'une minute. Réessayez pour en relever une nouvelle.";
    case "TOO_EARLY":
      return "Il est trop tôt : la validation s'ouvre 15 minutes avant le début du créneau.";
    case "TOO_LATE":
      return "Le créneau est terminé : l'arrivée ne peut plus être validée.";
    case "NOT_CONFIRMED":
      return "Cette réservation n'est plus confirmée : l'arrivée ne peut pas être validée.";
    default:
      return "Votre arrivée n'a pas pu être validée. Réessayez dans un instant.";
  }
}

/**
 * Validates the member's arrival from the position their browser just read.
 * The decision is the server's, with exactly the rules of the mobile app
 * (`performCheckIn`): inside the arrival window, a position precise enough
 * and fresh enough, within 150 m of the location. Every attempt — refused
 * ones included — is recorded and shows up in "Arrivées".
 */
export async function checkInAction(
  reservationId: string,
  position: { lat: number; lng: number; accuracyM: number; capturedAt: string },
): Promise<ActionResult> {
  const user = await requireOnboarded();

  const parsed = checkInBodySchema.safeParse(position);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        "Votre navigateur n'a pas fourni de position exploitable. Réessayez, ou utilisez l'application mobile.",
    };
  }

  return guardAction<ActionResult>(
    async () => {
      let result: Awaited<ReturnType<typeof performCheckIn>>;
      try {
        result = await performCheckIn(user.id, reservationId, {
          lat: parsed.data.lat,
          lng: parsed.data.lng,
          accuracyM: parsed.data.accuracyM,
          capturedAt: new Date(parsed.data.capturedAt),
        });
      } catch (error) {
        // The rules answer with a sentence of their own (reservation not
        // found, arrival already validated): pass it on as it is.
        if (error instanceof ApiError) return { ok: false, error: error.message };
        throw error;
      }

      revalidatePath(`/reservations/${reservationId}`);
      revalidatePath("/reservations");
      revalidatePath("/arrivees");
      revalidatePath("/tableau-de-bord");

      if (result.checkIn.accepted) {
        return { ok: true, message: "Arrivée validée. Bonne session de travail !" };
      }
      return { ok: false, error: refusalMessage(result.checkIn, result.radiusM) };
    },
    (error) => ({ ok: false, error }),
  );
}
