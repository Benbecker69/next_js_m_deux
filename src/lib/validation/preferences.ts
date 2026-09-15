import { z } from "zod";

export const preferencesSchema = z.object({
  defaultLocationId: z.string().nullable(),
  theme: z.enum(["light", "dark", "system"]),
  notificationsEnabled: z.boolean(),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;
