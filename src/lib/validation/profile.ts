import { z } from "zod";

export const memberTypeSchema = z.enum(["freelance", "entreprise", "etudiant"]);

export const onboardingSchema = z.object({
  memberType: memberTypeSchema,
  defaultLocationId: z.string().min(1, "Choisissez un lieu par défaut."),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  memberType: memberTypeSchema,
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
