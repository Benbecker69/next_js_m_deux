import { z } from "zod";

const defaultLocationId = z
  .string({ error: "Ce lieu n'est pas reconnu. Choisissez-en un dans la liste." })
  .nullable();

// Full domain shape (e.g. for an admin editing someone else's row later).
export const preferencesSchema = z.object({
  defaultLocationId,
  theme: z.enum(["light", "dark", "system"], { error: "Thème inconnu." }),
  notificationsEnabled: z.boolean({ error: "Valeur de notification invalide." }),
});

// What the settings form actually submits — appearance is a client-side
// setting (the sidebar ThemeToggle, via localStorage), not part of this form.
export const preferencesFormSchema = z.object({
  defaultLocationId,
  notificationsEnabled: z.boolean({ error: "Valeur de notification invalide." }),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type PreferencesFormInput = z.infer<typeof preferencesFormSchema>;
