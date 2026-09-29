import { z } from "zod";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { MOBILE_CONFIG } from "./config";

// Request validation for the mobile API. Login, registration and the booking
// body reuse the schemas of the web app (same rules, same French messages).

const deviceName = z.string().trim().max(80).optional();

export const registerBodySchema = registerSchema.extend({ deviceName });
export const loginBodySchema = loginSchema.extend({ deviceName });

const lat = z.number().min(-90, "Latitude invalide.").max(90, "Latitude invalide.");
const lng = z.number().min(-180, "Longitude invalide.").max(180, "Longitude invalide.");

export const nearbyQuerySchema = z
  .object({
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    startAt: z.iso.datetime({ message: "Créneau de début invalide." }).optional(),
    endAt: z.iso.datetime({ message: "Créneau de fin invalide." }).optional(),
    limit: z.coerce.number().int().min(1).max(MOBILE_CONFIG.nearby.maxLimit).optional(),
    // Query strings are text: "true" keeps the busy spaces in the list.
    includeBusy: z
      .enum(["true", "false"], { message: "Valeur de includeBusy invalide." })
      .transform((value) => value === "true")
      .optional(),
  })
  .refine((value) => (value.lat === undefined) === (value.lng === undefined), {
    message: "La latitude et la longitude vont ensemble.",
    path: ["lat"],
  });

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MOBILE_CONFIG.pagination.maxLimit).optional(),
  cursor: z.string().min(1).max(100).optional(),
  scope: z.enum(["upcoming", "past", "all"]).optional(),
});

export const checkInBodySchema = z.object({
  lat,
  lng,
  accuracyM: z.number().min(0, "Précision invalide.").max(100_000, "Précision invalide."),
  // ISO 8601 UTC ("...Z"), as produced by Date.prototype.toISOString().
  capturedAt: z.iso.datetime({ message: "Horodatage de la position invalide." }),
});

export const availabilityQuerySchema = z.object({
  from: z.iso.datetime({ message: "Date de début invalide." }).optional(),
  to: z.iso.datetime({ message: "Date de fin invalide." }).optional(),
});
