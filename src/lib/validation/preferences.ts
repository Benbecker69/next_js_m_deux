import { z } from "zod";

// Full domain shape (e.g. for an admin editing someone else's row later).
export const preferencesSchema = z.object({
  defaultLocationId: z.string().nullable(),
  theme: z.enum(["light", "dark", "system"]),
  notificationsEnabled: z.boolean(),
});

// What the settings form actually submits — appearance is a client-side
// setting (the sidebar ThemeToggle, via localStorage), not part of this form.
export const preferencesFormSchema = z.object({
  defaultLocationId: z.string().nullable(),
  notificationsEnabled: z.boolean(),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type PreferencesFormInput = z.infer<typeof preferencesFormSchema>;
