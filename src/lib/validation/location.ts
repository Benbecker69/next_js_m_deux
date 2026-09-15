import { z } from "zod";

export const locationSchema = z.object({
  name: z.string().min(2, "Le nom du lieu est requis."),
  city: z.string().min(2, "La ville est requise."),
  address: z.string().min(5, "L'adresse est requise."),
  description: z.string().min(10, "Décrivez le lieu en quelques phrases."),
  lat: z.number(),
  lng: z.number(),
  amenities: z.array(z.string()).default([]),
});

export type LocationInput = z.infer<typeof locationSchema>;
