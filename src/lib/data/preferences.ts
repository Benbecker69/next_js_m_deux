import "server-only";
import type { Preference } from "@/types/domain";
import { createCollection } from "./store";
import { SEED_PREFERENCES } from "./seed";

const preferences = createCollection<Preference>("preferences", SEED_PREFERENCES);

const DEFAULT_PREFERENCE: Omit<Preference, "id" | "userId"> = {
  defaultLocationId: null,
  theme: "system",
  notificationsEnabled: true,
};

export async function getPreferenceByUser(userId: string): Promise<Preference> {
  const existing = await preferences.get(userId);
  if (existing) return existing;
  return preferences.insert({ id: userId, userId, ...DEFAULT_PREFERENCE });
}

export async function updatePreference(
  userId: string,
  patch: Partial<Preference>,
): Promise<Preference | null> {
  await getPreferenceByUser(userId); // ensure a row exists before patching
  return preferences.update(userId, patch);
}
