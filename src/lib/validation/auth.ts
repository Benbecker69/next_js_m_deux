import { z } from "zod";

// Every rule carries its own French sentence, including the "wrong type"
// case (`{ error }` on the base type): without it a missing field would
// surface zod's built-in English message to the user.

const email = z
  .string({ error: "Saisissez votre adresse e-mail." })
  .trim()
  .min(1, "Saisissez votre adresse e-mail.")
  .email("Cette adresse e-mail n'est pas valide. Exemple : prenom@domaine.fr");

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: "Saisissez votre mot de passe." })
    .min(1, "Saisissez votre mot de passe."),
});

export const registerSchema = z.object({
  // .trim() matters beyond cosmetics: the account avatar shows the name's
  // first letter, so "  " must not pass validation as a real name.
  name: z
    .string({ error: "Indiquez votre nom." })
    .trim()
    .min(2, "Indiquez votre nom (au moins 2 caractères).")
    .max(80, "Ce nom est trop long (80 caractères au maximum)."),
  email,
  password: z
    .string({ error: "Choisissez un mot de passe." })
    .min(8, {
      // The message says how far the user is from the rule.
      error: (issue) =>
        `Le mot de passe doit contenir au moins 8 caractères (vous en avez saisi ${String(issue.input ?? "").length}).`,
    })
    .max(200, "Ce mot de passe est trop long (200 caractères au maximum)."),
});

const newPassword = z
  .string({ error: "Choisissez un nouveau mot de passe." })
  .min(8, {
    error: (issue) =>
      `Le mot de passe doit contenir au moins 8 caractères (vous en avez saisi ${String(issue.input ?? "").length}).`,
  })
  .max(200, "Ce mot de passe est trop long (200 caractères au maximum).");

const currentPassword = z
  .string({ error: "Saisissez votre mot de passe actuel." })
  .min(1, "Saisissez votre mot de passe actuel.");

export const changeEmailSchema = z.object({
  email,
  currentPassword,
});

// `refine` runs on the whole object: each rule names the field it is about
// (`path`), so its message lands under that field.
export const changePasswordSchema = z
  .object({
    currentPassword,
    newPassword,
    confirmPassword: z.string({ error: "Saisissez à nouveau le nouveau mot de passe." }),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Les deux saisies du nouveau mot de passe ne sont pas identiques.",
    path: ["confirmPassword"],
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    message: "Le nouveau mot de passe doit être différent de l'actuel.",
    path: ["newPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
