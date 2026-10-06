import { z } from "zod";

export const spaceSchema = z.object({
  locationId: z.string({ error: "Le lieu est requis." }).min(1, "Le lieu est requis."),
  name: z
    .string({ error: "Donnez un nom à l'espace." })
    .trim()
    .min(2, "Donnez un nom à l'espace (au moins 2 caractères).")
    .max(80, "Ce nom est trop long (80 caractères au maximum)."),
  type: z.enum(["poste-flex", "bureau-prive", "salle-reunion", "phone-booth"], {
    error: "Choisissez un type d'espace dans la liste.",
  }),
  capacity: z
    .number({ error: "La capacité doit être un nombre entier de personnes." })
    .int("La capacité doit être un nombre entier de personnes.")
    .min(1, "La capacité doit être d'au moins 1 personne.")
    .max(500, "La capacité ne peut pas dépasser 500 personnes."),
  pricePerHour: z
    .number({ error: "Le prix doit être un nombre entier de crédits." })
    .int("Le prix doit être un nombre entier de crédits.")
    .min(1, "Le prix doit être d'au moins 1 crédit par heure.")
    .max(1000, "Le prix ne peut pas dépasser 1000 crédits par heure."),
  status: z.enum(["active", "maintenance"], { error: "Statut d'espace inconnu." }),
});

export type SpaceInput = z.infer<typeof spaceSchema>;
