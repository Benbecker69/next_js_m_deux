"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getLocationById, updateLocation } from "@/lib/data/locations";
import { listReservationsBySpace } from "@/lib/data/reservations";
import { createSpace, deleteSpace, getSpaceById, updateSpace } from "@/lib/data/spaces";
import { spaceSchema } from "@/lib/validation/space";
import type { Space } from "@/types/domain";
import type { LocationFormState } from "../_components/location-form";
import { parseLocationForm, rawLocationValues } from "../_lib/location-form-data";
import {
  MESSAGES,
  validationFailure,
  type ActionResult,
  type FieldErrors,
} from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";

export type SpaceFormState = {
  error: string | null;
  success: boolean;
  fieldErrors?: FieldErrors;
  /** Success sentence naming the space that was just added. */
  message?: string;
  values?: { name: string; type: string; capacity: string; pricePerHour: string };
};

const LOCATION_NOT_FOUND =
  "Ce lieu est introuvable. Il a peut-être été supprimé : revenez à la liste des lieux.";
const SPACE_NOT_FOUND =
  "Cet espace est introuvable. Il a peut-être déjà été supprimé : rechargez la page.";

/** An empty number field must be refused, not read as 0 (`Number("")` is 0). */
function toNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

export async function updateLocationAction(
  locationId: string,
  _prevState: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  await requireAdmin();
  const values = rawLocationValues(formData);

  const parsed = parseLocationForm(formData);
  if (!parsed.success) {
    return { ...validationFailure(parsed.error), success: false, values };
  }

  return guardAction<LocationFormState>(
    async () => {
      const existing = await getLocationById(locationId);
      if (!existing) {
        return { error: LOCATION_NOT_FOUND, success: false, values };
      }

      const updated = await updateLocation(locationId, parsed.data);
      if (!updated) {
        return { error: MESSAGES.notSaved, success: false, values };
      }
      revalidatePath(`/admin/lieux/${locationId}`);
      revalidatePath("/admin/lieux");
      revalidateTag("locations", "max"); // public /lieux pages read the cached list

      return { error: null, success: true };
    },
    (error) => ({ error, success: false, values }),
  );
}

export async function createSpaceAction(
  locationId: string,
  _prevState: SpaceFormState,
  formData: FormData,
): Promise<SpaceFormState> {
  await requireAdmin();
  const values = {
    name: String(formData.get("name") ?? ""),
    type: String(formData.get("type") ?? ""),
    capacity: String(formData.get("capacity") ?? ""),
    pricePerHour: String(formData.get("pricePerHour") ?? ""),
  };

  const parsed = spaceSchema.safeParse({
    locationId,
    name: values.name,
    type: values.type,
    capacity: toNumber(values.capacity),
    pricePerHour: toNumber(values.pricePerHour),
    status: "active",
  });
  if (!parsed.success) {
    return { ...validationFailure(parsed.error), success: false, values };
  }

  return guardAction<SpaceFormState>(
    async () => {
      if (!(await getLocationById(locationId))) {
        return { error: LOCATION_NOT_FOUND, success: false, values };
      }

      const space: Space = { id: crypto.randomUUID(), ...parsed.data };
      await createSpace(space);
      revalidatePath(`/admin/lieux/${locationId}`);
      revalidateTag("spaces", "max");

      return {
        error: null,
        success: true,
        message: `« ${space.name} » a été ajouté et peut être réservé.`,
      };
    },
    (error) => ({ error, success: false, values }),
  );
}

export async function toggleSpaceStatusAction(spaceId: string): Promise<ActionResult> {
  await requireAdmin();

  return guardAction<ActionResult>(
    async () => {
      const space = await getSpaceById(spaceId);
      if (!space) {
        return { ok: false, error: SPACE_NOT_FOUND };
      }

      const nextStatus = space.status === "active" ? "maintenance" : "active";
      const updated = await updateSpace(spaceId, { status: nextStatus });
      if (!updated) {
        return { ok: false, error: MESSAGES.notSaved };
      }
      revalidatePath(`/admin/lieux/${space.locationId}`);
      revalidateTag("spaces", "max");

      return {
        ok: true,
        message:
          nextStatus === "maintenance"
            ? `« ${space.name} » est en maintenance : il n'est plus proposé à la réservation.`
            : `« ${space.name} » est de nouveau ouvert à la réservation.`,
      };
    },
    (error) => ({ ok: false, error }),
  );
}

export async function deleteSpaceAction(spaceId: string): Promise<ActionResult> {
  await requireAdmin();

  return guardAction<ActionResult>(
    async () => {
      const space = await getSpaceById(spaceId);
      if (!space) {
        return { ok: false, error: SPACE_NOT_FOUND };
      }

      // Deleting a space deletes its reservations with it (cascade): refuse
      // while members still hold an upcoming booking there.
      const now = new Date();
      const upcoming = (await listReservationsBySpace(spaceId)).filter(
        (reservation) =>
          reservation.status === "confirmed" && new Date(reservation.endAt) > now,
      );
      if (upcoming.length > 0) {
        return {
          ok: false,
          error: `« ${space.name} » a encore ${upcoming.length} réservation${upcoming.length === 1 ? "" : "s"} à venir. Passez-le en maintenance, ou annulez ${upcoming.length === 1 ? "cette réservation" : "ces réservations"} avant de le supprimer.`,
        };
      }

      const deleted = await deleteSpace(spaceId);
      if (!deleted) {
        return {
          ok: false,
          error: `« ${space.name} » n'a pas pu être supprimé. Réessayez dans un instant.`,
        };
      }
      revalidatePath(`/admin/lieux/${space.locationId}`);
      revalidateTag("spaces", "max");

      return { ok: true, message: `« ${space.name} » a été supprimé.` };
    },
    (error) => ({ ok: false, error }),
  );
}
