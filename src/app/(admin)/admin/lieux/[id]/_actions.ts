"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getLocationById, updateLocation } from "@/lib/data/locations";
import { createSpace, deleteSpace, getSpaceById, updateSpace } from "@/lib/data/spaces";
import { locationSchema } from "@/lib/validation/location";
import { spaceSchema } from "@/lib/validation/space";
import type { Space } from "@/types/domain";
import type { LocationFormState } from "../_components/location-form";

export type SpaceFormState = {
  error: string | null;
};

export async function updateLocationAction(
  locationId: string,
  _prevState: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  await requireAdmin();

  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    address: formData.get("address"),
    description: formData.get("description"),
    lat: Number(formData.get("lat")),
    lng: Number(formData.get("lng")),
    amenities: String(formData.get("amenities") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
      success: false,
    };
  }

  const existing = await getLocationById(locationId);
  if (!existing) {
    return { error: "Lieu introuvable.", success: false };
  }

  await updateLocation(locationId, parsed.data);
  revalidatePath(`/admin/lieux/${locationId}`);
  revalidatePath("/admin/lieux");
  revalidateTag("locations", "max"); // public /lieux pages read the cached list

  return { error: null, success: true };
}

export async function createSpaceAction(
  locationId: string,
  _prevState: SpaceFormState,
  formData: FormData,
): Promise<SpaceFormState> {
  await requireAdmin();

  const parsed = spaceSchema.safeParse({
    locationId,
    name: formData.get("name"),
    type: formData.get("type"),
    capacity: Number(formData.get("capacity")),
    pricePerHour: Number(formData.get("pricePerHour")),
    status: "active",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const space: Space = { id: crypto.randomUUID(), ...parsed.data };
  await createSpace(space);
  revalidatePath(`/admin/lieux/${locationId}`);
  revalidateTag("spaces", "max");

  return { error: null };
}

export async function toggleSpaceStatusAction(spaceId: string): Promise<void> {
  await requireAdmin();
  const space = await getSpaceById(spaceId);
  if (!space) {
    throw new Error("Espace introuvable.");
  }
  await updateSpace(spaceId, {
    status: space.status === "active" ? "maintenance" : "active",
  });
  revalidatePath(`/admin/lieux/${space.locationId}`);
  revalidateTag("spaces", "max");
}

export async function deleteSpaceAction(spaceId: string): Promise<void> {
  await requireAdmin();
  const space = await getSpaceById(spaceId);
  if (!space) {
    throw new Error("Espace introuvable.");
  }
  await deleteSpace(spaceId);
  revalidatePath(`/admin/lieux/${space.locationId}`);
  revalidateTag("spaces", "max");
}
