"use server";

import { redirect } from "next/navigation";
import { createUser, getUserByEmail } from "@/lib/data/users";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation/auth";
import type { User } from "@/types/domain";

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

  // Mock auth: the password is validated but never stored — see connexion/_actions.ts.
  const now = new Date().toISOString();
  const user: User = {
    id: crypto.randomUUID(),
    name: parsed.data.name,
    email: parsed.data.email,
    role: "member",
    memberType: null,
    credits: SIGNUP_BONUS_CREDITS,
    avatarUrl: null,
    onboardingCompletedAt: null,
    createdAt: now,
  };
  await createUser(user);
  await createSession(user.id);
  redirect("/bienvenue");
}
