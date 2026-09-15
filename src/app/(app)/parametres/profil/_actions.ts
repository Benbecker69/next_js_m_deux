"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth/session";
import { updateUser } from "@/lib/data/users";
import { profileSchema } from "@/lib/validation/profile";

export type ProfileFormState = {
  error: string | null;
  success: boolean;
};

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireOnboarded();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    memberType: formData.get("memberType"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
      success: false,
    };
  }

  await updateUser(user.id, {
    name: parsed.data.name,
    memberType: parsed.data.memberType,
  });
  revalidatePath("/tableau-de-bord", "layout");

  return { error: null, success: true };
}
