"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { deleteUser, getUserById, updateUser } from "@/lib/data/users";
import { adminUserSchema } from "@/lib/validation/user";
import { withFlash } from "@/lib/feedback/flash-messages";
import {
  MESSAGES,
  validationFailure,
  type ActionResult,
  type FieldErrors,
} from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";

export type UserFormState = {
  error: string | null;
  success: boolean;
  fieldErrors?: FieldErrors;
  // Echoed back so a refused value stays in the field to be corrected.
  values?: { credits: string };
};

const USER_NOT_FOUND =
  "Cet utilisateur est introuvable. Son compte a peut-être été supprimé : revenez à la liste.";

export async function updateUserAdminAction(
  userId: string,
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requireAdmin();
  const values = { credits: String(formData.get("credits") ?? "") };
  // A disabled <select> (an admin's own role) is not submitted at all.
  const isSelf = userId === admin.id;

  const parsed = adminUserSchema.safeParse({
    role: isSelf ? "admin" : formData.get("role"),
    // An empty field must not silently become 0 credits.
    credits: values.credits.trim() === "" ? Number.NaN : Number(values.credits),
  });
  if (!parsed.success) {
    return { ...validationFailure(parsed.error), success: false, values };
  }

  return guardAction<UserFormState>(
    async () => {
      const target = await getUserById(userId);
      if (!target) {
        return { error: USER_NOT_FOUND, success: false, values };
      }

      const updated = await updateUser(userId, parsed.data);
      if (!updated) {
        return { error: MESSAGES.notSaved, success: false, values };
      }
      revalidatePath(`/admin/utilisateurs/${userId}`);
      revalidatePath("/admin/utilisateurs");
      // The member's own sidebar shows this balance.
      revalidatePath("/tableau-de-bord", "layout");

      return { error: null, success: true };
    },
    (error) => ({ error, success: false, values }),
  );
}

/** On success this redirects to the list: it only ever *returns* a failure. */
export async function deleteUserAdminAction(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  return guardAction<ActionResult>(
    async () => {
      if (userId === admin.id) {
        return {
          ok: false,
          error:
            "Vous ne pouvez pas supprimer votre propre compte : demandez à un autre administrateur de le faire.",
        };
      }

      const target = await getUserById(userId);
      if (!target) {
        return { ok: false, error: USER_NOT_FOUND };
      }

      const deleted = await deleteUser(userId);
      if (!deleted) {
        return {
          ok: false,
          error: `Le compte de ${target.name} n'a pas pu être supprimé. Réessayez dans un instant.`,
        };
      }
      revalidatePath("/admin/utilisateurs");
      redirect(withFlash("/admin/utilisateurs", "utilisateur-supprime"));
    },
    (error) => ({ ok: false, error }),
  );
}
