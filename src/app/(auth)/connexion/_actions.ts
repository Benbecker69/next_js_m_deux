"use server";

import { redirect } from "next/navigation";
import { getUserByEmail } from "@/lib/data/users";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";
import { withFlash } from "@/lib/feedback/flash-messages";

export type LoginFormState = {
  error: string | null;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  // Mock auth: any password is accepted for a known email — there is no
  // password store yet. Real verification arrives with the real backend,
  // see CLAUDE.md "Décisions actées". Never write this to a real backend.
  const user = await getUserByEmail(parsed.data.email);
  if (!user) {
    return { error: "Aucun compte ne correspond à cette adresse e-mail." };
  }

  await createSession(user.id);
  // /bienvenue is itself a welcome screen for a not-yet-onboarded user, so a
  // flash toast on top of it would be redundant — reserved for the direct
  // return to the dashboard.
  redirect(
    user.onboardingCompletedAt
      ? withFlash("/tableau-de-bord", "connexion-reussie")
      : "/bienvenue",
  );
}
