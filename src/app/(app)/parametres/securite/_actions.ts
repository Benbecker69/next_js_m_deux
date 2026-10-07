"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth/session";
import {
  getUserByEmail,
  updateUserEmail,
  updateUserPassword,
  verifyUserPasswordById,
} from "@/lib/data/users";
import {
  MESSAGES,
  fieldFailure,
  validationFailure,
  type FieldErrors,
} from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";
import { revokeOtherMobileSessions } from "@/lib/mobile/auth";
import { changeEmailSchema, changePasswordSchema } from "@/lib/validation/auth";

// Changing the email or the password — the two things the mobile app's
// "Sécurité" screen does. Both ask for the current password: being signed in
// is not proof that the person typing is the account's owner (a session left
// open on a shared computer is signed in too).

const WRONG_PASSWORD =
  "Ce mot de passe n'est pas le bon. Vérifiez votre saisie : rien n'a été modifié.";

export type EmailFormState = {
  error: string | null;
  success: boolean;
  fieldErrors?: FieldErrors;
  /** Echoed back so a refused address stays in the field. Never a password. */
  values?: { email: string };
  /** Changes on every success: the form uses it as its `key` to empty itself. */
  resetKey?: number;
};

export async function changeEmailAction(
  _prevState: EmailFormState,
  formData: FormData,
): Promise<EmailFormState> {
  const user = await requireOnboarded();
  const values = { email: String(formData.get("email") ?? "") };

  const parsed = changeEmailSchema.safeParse({
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
  });
  if (!parsed.success) {
    return { ...validationFailure(parsed.error), success: false, values };
  }
  const email = parsed.data.email.toLowerCase();

  return guardAction<EmailFormState>(
    async () => {
      if (email === user.email.toLowerCase()) {
        return {
          ...fieldFailure("email", "C'est déjà l'adresse de votre compte."),
          success: false,
          values,
        };
      }
      if (!(await verifyUserPasswordById(user.id, parsed.data.currentPassword))) {
        return {
          ...fieldFailure("currentPassword", WRONG_PASSWORD),
          success: false,
          values,
        };
      }

      const taken = fieldFailure(
        "email",
        `L'adresse ${email} est déjà utilisée par un autre compte. Choisissez-en une autre.`,
      );
      const existing = await getUserByEmail(email);
      if (existing && existing.id !== user.id) {
        return { ...taken, success: false, values };
      }

      const result = await updateUserEmail(user.id, email);
      // Two people asking for the same address at the same instant: the
      // check above passed for both, the database's unique index did not.
      if (result === "email_taken") {
        return { ...taken, success: false, values };
      }
      if (result === "error") {
        return { error: MESSAGES.notSaved, success: false, values };
      }

      // The sidebar and this page both show the address.
      revalidatePath("/tableau-de-bord", "layout");
      return { error: null, success: true, resetKey: Date.now() };
    },
    (error) => ({ error, success: false, values }),
  );
}

export type PasswordFormState = {
  error: string | null;
  success: boolean;
  fieldErrors?: FieldErrors;
  resetKey?: number;
};

export async function changePasswordAction(
  _prevState: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const user = await requireOnboarded();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ...validationFailure(parsed.error), success: false };
  }

  return guardAction<PasswordFormState>(
    async () => {
      if (!(await verifyUserPasswordById(user.id, parsed.data.currentPassword))) {
        return { ...fieldFailure("currentPassword", WRONG_PASSWORD), success: false };
      }

      const updated = await updateUserPassword(user.id, parsed.data.newPassword);
      if (!updated) {
        return { error: MESSAGES.notSaved, success: false };
      }
      // A phone that only knew the old password, or a stolen token, stops
      // working: every mobile session of this account is revoked (the site
      // has no mobile session of its own to keep, hence the empty id).
      await revokeOtherMobileSessions(user.id, "");

      return { error: null, success: true, resetKey: Date.now() };
    },
    (error) => ({ error, success: false }),
  );
}
