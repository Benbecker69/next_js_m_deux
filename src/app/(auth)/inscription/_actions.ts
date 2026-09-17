"use server";

import { redirect } from "next/navigation";
import { createUser, getUserByEmail } from "@/lib/data/users";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation/auth";

export type RegisterFormState = {
  error: string | null;
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
    return {
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
      values,
    };
  }

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse e-mail.", values };
  }

  const user = await createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    credits: SIGNUP_BONUS_CREDITS,
  });
  await createSession(user.id);
  redirect("/bienvenue");
}
