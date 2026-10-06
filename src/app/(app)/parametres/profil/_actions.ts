"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth/session";
import { updateUser } from "@/lib/data/users";
import { profileSchema } from "@/lib/validation/profile";
import {
  MESSAGES,
  validationFailure,
  type FieldErrors,
} from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";

export type ProfileFormState = {
  error: string | null;
  success: boolean;
  fieldErrors?: FieldErrors;
  // Echoed back so a failed submission doesn't clear what was typed.
  name?: string;
};

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireOnboarded();
  const name = String(formData.get("name") ?? "");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    memberType: formData.get("memberType"),
  });
  if (!parsed.success) {
    return { ...validationFailure(parsed.error), success: false, name };
  }

  return guardAction<ProfileFormState>(
    async () => {
      const updated = await updateUser(user.id, {
        name: parsed.data.name,
        memberType: parsed.data.memberType,
      });
      if (!updated) {
        return { error: MESSAGES.notSaved, success: false, name };
      }
      revalidatePath("/tableau-de-bord", "layout");

      return { error: null, success: true };
    },
    (error) => ({ error, success: false, name }),
  );
}
