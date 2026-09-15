"use server";

import { requireOnboarded } from "@/lib/auth/session";
import { updatePreference } from "@/lib/data/preferences";
import { preferencesFormSchema } from "@/lib/validation/preferences";

export type PreferencesFormState = {
  error: string | null;
  success: boolean;
};

export async function updatePreferencesAction(
  _prevState: PreferencesFormState,
  formData: FormData,
): Promise<PreferencesFormState> {
  const user = await requireOnboarded();

  const rawLocationId = formData.get("defaultLocationId");
  const parsed = preferencesFormSchema.safeParse({
    defaultLocationId: rawLocationId === "" ? null : rawLocationId,
    notificationsEnabled: formData.get("notificationsEnabled") === "on",
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
      success: false,
    };
  }

  await updatePreference(user.id, {
    defaultLocationId: parsed.data.defaultLocationId,
    notificationsEnabled: parsed.data.notificationsEnabled,
  });

  return { error: null, success: true };
}
