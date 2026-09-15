import type { Metadata } from "next";
import { RegisterForm } from "./_components/register-form";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte Repère pour réserver un espace de coworking.",
};

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">Créer un compte</h1>
      <p className="mt-2 text-sm text-ink-muted">
        20 crédits offerts à l&apos;inscription pour commencer.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
