import { z } from "zod";

// What an admin can change on a member from the back-office.
export const adminUserSchema = z.object({
  role: z.enum(["member", "admin"], {
    error: "Choisissez un rôle : membre ou administrateur.",
  }),
  credits: z
    .number({ error: "Le solde doit être un nombre entier de crédits." })
    .int("Le solde doit être un nombre entier de crédits.")
    .min(0, "Le solde ne peut pas être négatif.")
    .max(100_000, "Le solde ne peut pas dépasser 100 000 crédits."),
});

export type AdminUserInput = z.infer<typeof adminUserSchema>;
