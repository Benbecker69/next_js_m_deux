"use server";

import { redirect } from "next/navigation";
import { createUser, getUserByEmail } from "@/lib/data/users";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation/auth";
import { withFlash } from "@/lib/feedback/flash-messages";
import { validationFailure, type FieldErrors } from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";

export type RegisterFormState = {
  error: string | null;
  fieldErrors?: FieldErrors;
  // Echoed back so a failed submission can re-fill the form instead of
  // making the user retype everything — never the password (see
  // register-form.tsx, which reads these as `defaultValue`).
  values?: { name: string; email: string };
};

const SIGNUP_BONUS_CREDITS = 20;

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ...validationFailure(parsed.error), values };
  }

  return guardAction<RegisterFormState>(
    async () => {
      const existing = await getUserByEmail(parsed.data.email);
      if (existing) {
        const message = `Un compte existe déjà avec l'adresse ${parsed.data.email}. Connectez-vous, ou utilisez une autre adresse.`;
        return { error: message, fieldErrors: { email: message }, values };
      }

      const user = await createUser({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        credits: SIGNUP_BONUS_CREDITS,
      });
      await createSession(user.id);
      redirect(withFlash("/bienvenue", "compte-cree"));
    },
    (error) => ({ error, values }),
  );
}
