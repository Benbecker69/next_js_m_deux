"use server";

import { redirect } from "next/navigation";
import { createUser, getUserByEmail } from "@/lib/data/users";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation/auth";

export type RegisterFormState = {
  error: string | null;
};

const SIGNUP_BONUS_CREDITS = 20;

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse e-mail." };
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
