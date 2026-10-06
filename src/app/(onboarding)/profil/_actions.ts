"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getLocationById } from "@/lib/data/locations";
import { updatePreference } from "@/lib/data/preferences";
import { updateUser } from "@/lib/data/users";
import { onboardingSchema } from "@/lib/validation/profile";
import { withFlash } from "@/lib/feedback/flash-messages";
import {
  MESSAGES,
  validationFailure,
  type FieldErrors,
} from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";

export type OnboardingFormState = {
  error: string | null;
  fieldErrors?: FieldErrors;
  // Echoed back so a failed submission keeps the choices already made.
  values?: { memberType: string; defaultLocationId: string };
};

export async function completeOnboardingAction(
  _prevState: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const user = await requireUser();
  const values = {
    memberType: String(formData.get("memberType") ?? ""),
    defaultLocationId: String(formData.get("defaultLocationId") ?? ""),
  };

  const parsed = onboardingSchema.safeParse({
    memberType: formData.get("memberType"),
    defaultLocationId: formData.get("defaultLocationId"),
  });
  if (!parsed.success) {
    return { ...validationFailure(parsed.error), values };
  }

  return guardAction<OnboardingFormState>(
    async () => {
      // The list was sent with the page: the place may have been removed since.
      const location = await getLocationById(parsed.data.defaultLocationId);
      if (!location) {
        const message =
          "Ce lieu n'est plus proposé. Choisissez-en un autre dans la liste.";
        return { error: message, fieldErrors: { defaultLocationId: message }, values };
      }

      const updated = await updateUser(user.id, {
        memberType: parsed.data.memberType,
        onboardingCompletedAt: new Date().toISOString(),
      });
      if (!updated) {
        return { error: MESSAGES.notSaved, values };
      }
      await updatePreference(user.id, {
        defaultLocationId: parsed.data.defaultLocationId,
      });

      redirect(withFlash("/tableau-de-bord", "profil-complete"));
    },
    (error) => ({ error, values }),
  );
}
