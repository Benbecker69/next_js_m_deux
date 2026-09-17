"use server";

import { redirect } from "next/navigation";
import { verifyUserCredentials } from "@/lib/data/users";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";
import { withFlash } from "@/lib/feedback/flash-messages";

export type LoginFormState = {
  error: string | null;
  // Echoed back so a failed submission doesn't make the user retype the
  // email too — never the password (see login-form.tsx's `defaultValue`).
  email?: string;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "");

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide.", email };
  }

  const user = await verifyUserCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    // Deliberately generic — doesn't reveal whether the email exists.
    return { error: "E-mail ou mot de passe incorrect.", email };
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
