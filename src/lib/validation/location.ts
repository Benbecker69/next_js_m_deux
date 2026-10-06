import { z } from "zod";

export const locationSchema = z.object({
  name: z
    .string({ error: "Donnez un nom au lieu." })
    .trim()
    .min(2, "Donnez un nom au lieu (au moins 2 caractères).")
    .max(80, "Ce nom est trop long (80 caractères au maximum)."),
  city: z
    .string({ error: "Indiquez la ville." })
    .trim()
    .min(2, "Indiquez la ville (au moins 2 caractères)."),
  address: z
    .string({ error: "Indiquez l'adresse du lieu." })
    .trim()
    .min(5, "Indiquez l'adresse complète : numéro, rue, code postal et ville."),
  description: z
    .string({ error: "Décrivez le lieu en quelques phrases." })
    .trim()
    .min(10, {
      error: (issue) =>
        `Décrivez le lieu en au moins 10 caractères (${String(issue.input ?? "").trim().length} pour l'instant).`,
    }),
  // An empty field arrives as NaN (Number("")), which `z.number()` refuses:
  // the same sentence covers "empty" and "not a number".
  lat: z
    .number({ error: "La latitude doit être un nombre, par exemple 45.7605." })
    .min(-90, "La latitude doit être comprise entre -90 et 90.")
    .max(90, "La latitude doit être comprise entre -90 et 90."),
  lng: z
    .number({ error: "La longitude doit être un nombre, par exemple 4.8607." })
    .min(-180, "La longitude doit être comprise entre -180 et 180.")
    .max(180, "La longitude doit être comprise entre -180 et 180."),
  amenities: z.array(z.string()).default([]),
});

export type LocationInput = z.infer<typeof locationSchema>;
