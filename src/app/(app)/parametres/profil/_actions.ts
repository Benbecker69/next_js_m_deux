"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth/session";
import { updateUser } from "@/lib/data/users";
import { joinName } from "@/lib/member/name";
import { profileFormSchema } from "@/lib/validation/profile";
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
  values?: { firstName: string; lastName: string };
};

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireOnboarded();
  const values = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
  };

  const parsed = profileFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    memberType: formData.get("memberType"),
  });
  if (!parsed.success) {
    return { ...validationFailure(parsed.error), success: false, values };
  }

  return guardAction<ProfileFormState>(
    async () => {
      // The form shows two fields; the database keeps one `name`.
      const updated = await updateUser(user.id, {
        name: joinName(parsed.data.firstName, parsed.data.lastName),
        memberType: parsed.data.memberType,
      });
      if (!updated) {
        return { error: MESSAGES.notSaved, success: false, values };
      }
      revalidatePath("/tableau-de-bord", "layout");

      return { error: null, success: true };
    },
    (error) => ({ error, success: false, values }),
  );
}
