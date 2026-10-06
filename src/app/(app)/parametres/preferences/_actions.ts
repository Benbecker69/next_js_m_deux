"use server";

import { requireOnboarded } from "@/lib/auth/session";
import { getLocationById } from "@/lib/data/locations";
import { updatePreference } from "@/lib/data/preferences";
import { preferencesFormSchema } from "@/lib/validation/preferences";
import { validationFailure, type FieldErrors } from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";

export type PreferencesFormState = {
  error: string | null;
  success: boolean;
  fieldErrors?: FieldErrors;
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
    return { ...validationFailure(parsed.error), success: false };
  }

  return guardAction<PreferencesFormState>(
    async () => {
      const { defaultLocationId, notificationsEnabled } = parsed.data;
      // The list was sent with the page: the place may have been removed since.
      if (defaultLocationId && !(await getLocationById(defaultLocationId))) {
        const message =
          "Ce lieu n'est plus proposé. Choisissez-en un autre dans la liste.";
        return {
          error: message,
          success: false,
          fieldErrors: { defaultLocationId: message },
        };
      }

      await updatePreference(user.id, { defaultLocationId, notificationsEnabled });
      return { error: null, success: true };
    },
    (error) => ({ error, success: false }),
  );
}
