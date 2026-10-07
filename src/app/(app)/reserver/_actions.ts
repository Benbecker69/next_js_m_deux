"use server";

import { requireOnboarded } from "@/lib/auth/session";
import { guardAction } from "@/lib/feedback/guard-action";
import { listNearbySpaces } from "@/lib/mobile/nearby";

export type NearestSpaceResult =
  { ok: true; spaceId: string; message: string } | { ok: false; error: string };

function meters(value: number): string {
  return value < 1000
    ? `${Math.round(value)} m`
    : `${(value / 1000).toFixed(1).replace(".", ",")} km`;
}

/**
 * "Réserver près de moi": the space that is free for the coming hour and
 * closest to the position the browser just read. Same server function as the
 * mobile app's own proposal (`listNearbySpaces`), so both pick the same
 * space from the same place. The position is used for this answer only: it
 * is not stored.
 */
export async function findNearestSpaceAction(position: {
  lat: number;
  lng: number;
}): Promise<NearestSpaceResult> {
  await requireOnboarded();

  const { lat, lng } = position;
  const valid =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;
  if (!valid) {
    return {
      ok: false,
      error:
        "Votre navigateur n'a pas fourni de position exploitable. Réessayez, ou choisissez un espace dans la liste.",
    };
  }

  return guardAction<NearestSpaceResult>(
    async () => {
      const { items } = await listNearbySpaces({ lat, lng, limit: 1 });
      const nearest = items[0];
      if (!nearest) {
        return {
          ok: false,
          error:
            "Aucun espace n'est libre pour l'heure qui vient. Choisissez un autre créneau depuis la liste.",
        };
      }
      const distance =
        nearest.distanceM === null ? "" : `, à ${meters(nearest.distanceM)}`;
      return {
        ok: true,
        spaceId: nearest.space.id,
        message: `« ${nearest.space.name} » à ${nearest.location.name}${distance} : choisissez vos heures.`,
      };
    },
    (error) => ({ ok: false, error }),
  );
}
