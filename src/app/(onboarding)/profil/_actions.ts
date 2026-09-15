"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { updatePreference } from "@/lib/data/preferences";
import { updateUser } from "@/lib/data/users";
import { onboardingSchema } from "@/lib/validation/profile";

export type OnboardingFormState = {
  error: string | null;
};

export async function completeOnboardingAction(
  _prevState: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const user = await requireUser();

  const parsed = onboardingSchema.safeParse({
    memberType: formData.get("memberType"),
    defaultLocationId: formData.get("defaultLocationId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  await updateUser(user.id, {
    memberType: parsed.data.memberType,
    onboardingCompletedAt: new Date().toISOString(),
  });
  await updatePreference(user.id, { defaultLocationId: parsed.data.defaultLocationId });

  redirect("/tableau-de-bord");
}
