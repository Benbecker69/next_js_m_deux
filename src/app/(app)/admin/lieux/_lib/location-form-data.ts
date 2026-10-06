import { locationSchema } from "@/lib/validation/location";
import type { LocationFormValuesInput } from "../_components/location-form";

// Shared by the "create" and "edit" location actions: both read the same
// form, so the reading and the validation live in one place.

/** The fields exactly as typed, echoed back when the submission is refused. */
export function rawLocationValues(formData: FormData): LocationFormValuesInput {
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

/** An empty coordinate must be refused, not read as 0 (`Number("")` is 0). */
function toNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

export function parseLocationForm(formData: FormData) {
  const raw = rawLocationValues(formData);
  return locationSchema.safeParse({
    name: raw.name,
    city: raw.city,
    address: raw.address,
    description: raw.description,
    lat: toNumber(raw.lat),
    lng: toNumber(raw.lng),
    amenities: raw.amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  });
}
