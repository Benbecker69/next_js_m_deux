"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createLocation } from "@/lib/data/locations";
import { slugify } from "@/lib/utils/slugify";
import { locationSchema } from "@/lib/validation/location";
import type { Location } from "@/types/domain";
import type {
  LocationFormState,
  LocationFormValuesInput,
} from "../_components/location-form";
import { withFlash } from "@/lib/feedback/flash-messages";

function parseLocationForm(formData: FormData) {
  return locationSchema.safeParse({
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
}

function rawLocationValues(formData: FormData): LocationFormValuesInput {
  return {
    name: String(formData.get("name") ?? ""),
    city: String(formData.get("city") ?? ""),
    address: String(formData.get("address") ?? ""),
    lat: String(formData.get("lat") ?? ""),
    lng: String(formData.get("lng") ?? ""),
    description: String(formData.get("description") ?? ""),
    amenities: String(formData.get("amenities") ?? ""),
  };
}

export async function createLocationAction(
  _prevState: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  await requireAdmin();

  const parsed = parseLocationForm(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
      success: false,
      values: rawLocationValues(formData),
    };
  }

  const location: Location = {
    id: crypto.randomUUID(),
    slug: slugify(parsed.data.name),
    ...parsed.data,
  };
  await createLocation(location);
  revalidateTag("locations", "max");

  redirect(withFlash(`/admin/lieux/${location.id}`, "lieu-cree"));
}
