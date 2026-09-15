import { z } from "zod";

export const spaceSchema = z.object({
  locationId: z.string().min(1, "Le lieu est requis."),
  name: z.string().min(2, "Le nom de l'espace est requis."),
  type: z.enum(["poste-flex", "bureau-prive", "salle-reunion", "phone-booth"]),
  capacity: z.number().int().min(1, "La capacité doit être d'au moins 1."),
  pricePerHour: z.number().int().min(1, "Le prix doit être d'au moins 1 crédit."),
  status: z.enum(["active", "maintenance"]),
});

export type SpaceInput = z.infer<typeof spaceSchema>;
