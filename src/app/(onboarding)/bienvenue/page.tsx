import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Bienvenue",
};

export default async function OnboardingWelcomePage() {
  const user = await requireUser();

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">
        Bienvenue, {user.name.split(" ")[0]}.
      </h1>
      <p className="mt-4 text-sm text-ink-muted">
        Encore une minute avant de réserver votre premier espace : dites-nous qui vous
        êtes et quel lieu vous utiliserez le plus souvent.
      </p>
      <div className="mt-8">
        <Link href="/profil" className={buttonVariants({ size: "lg" })}>
          Continuer
        </Link>
      </div>
    </div>
  );
}
