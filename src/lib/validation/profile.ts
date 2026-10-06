import { z } from "zod";

export const memberTypeSchema = z.enum(["freelance", "entreprise", "etudiant"], {
  error: "Indiquez votre situation : freelance, entreprise ou étudiant.",
});

export const onboardingSchema = z.object({
  memberType: memberTypeSchema,
  defaultLocationId: z
    .string({ error: "Choisissez le lieu que vous utiliserez le plus souvent." })
    .min(1, "Choisissez le lieu que vous utiliserez le plus souvent."),
});

export const profileSchema = z.object({
  name: z
    .string({ error: "Indiquez votre nom." })
    .trim()
    .min(2, "Indiquez votre nom (au moins 2 caractères).")
    .max(80, "Ce nom est trop long (80 caractères au maximum)."),
  memberType: memberTypeSchema,
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
