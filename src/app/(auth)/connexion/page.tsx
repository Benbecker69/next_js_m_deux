import type { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Accédez à votre espace Repère.",
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">Connexion</h1>
      <p className="mt-2 text-sm text-ink-muted">Accédez à votre espace Repère.</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
