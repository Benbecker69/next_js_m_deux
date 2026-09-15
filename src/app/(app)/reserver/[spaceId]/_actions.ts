"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth/session";
import { createReservation, listReservationsBySpace } from "@/lib/data/reservations";
import { getSpaceById } from "@/lib/data/spaces";
import { updateUser } from "@/lib/data/users";
import { createReservationSchema } from "@/lib/validation/reservation";

export type ReservationFormState = {
  error: string | null;
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
    return { error: parsed.error.issues[0]?.message ?? "Choisissez un créneau." };
  }

  const space = await getSpaceById(parsed.data.spaceId);
  if (!space || space.status !== "active") {
    return { error: "Cet espace n'est plus disponible." };
  }

  const hours =
    (new Date(parsed.data.endAt).getTime() - new Date(parsed.data.startAt).getTime()) /
    3_600_000;
  const cost = Math.round(space.pricePerHour * hours);

  if (user.credits < cost) {
    return { error: "Crédits insuffisants pour cette réservation." };
  }

  const existing = await listReservationsBySpace(space.id);
  const overlaps = existing.some(
    (reservation) =>
      reservation.status === "confirmed" &&
      new Date(parsed.data.startAt) < new Date(reservation.endAt) &&
      new Date(parsed.data.endAt) > new Date(reservation.startAt),
  );
  if (overlaps) {
    return {
      error:
        "Ce créneau vient d'être réservé par quelqu'un d'autre. Choisissez-en un autre.",
    };
  }

  await createReservation({
    id: crypto.randomUUID(),
    userId: user.id,
    spaceId: space.id,
    startAt: parsed.data.startAt,
    endAt: parsed.data.endAt,
    status: "confirmed",
    creditsSpent: cost,
    createdAt: new Date().toISOString(),
  });
  await updateUser(user.id, { credits: user.credits - cost });

  // The (app) layout (sidebar credits) is shared across routes and would
  // otherwise keep showing the pre-booking balance from the router cache.
  revalidatePath("/tableau-de-bord", "layout");
  redirect("/tableau-de-bord");
}
