import type { Metadata } from "next";
import { requireOnboarded } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sécurité",
};

export default async function SettingsSecurityPage() {
  const user = await requireOnboarded();

  return (
    <div className="flex flex-col gap-6">
      <dl className="divide-y divide-line border-t border-line text-sm">
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">E-mail</dt>
          <dd className="text-ink">{user.email}</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">Rôle</dt>
          <dd className="text-ink">
            {user.role === "admin" ? "Administrateur" : "Membre"}
          </dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">Membre depuis</dt>
          <dd className="text-ink">
            {new Date(user.createdAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}
          </dd>
        </div>
      </dl>
      <p className="text-sm text-ink-muted">
        La gestion du mot de passe arrivera avec l&apos;authentification réelle
        (l&apos;accès se fait pour l&apos;instant en mode démonstration, sans mot de passe
        stocké).
      </p>
    </div>
  );
}
