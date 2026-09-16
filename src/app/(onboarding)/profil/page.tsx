import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { listLocations } from "@/lib/data/locations";
import { OnboardingForm } from "./_components/onboarding-form";

export const metadata: Metadata = {
  title: "Votre profil",
};

export default async function OnboardingProfilePage() {
  const [, locations] = await Promise.all([requireUser(), listLocations()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">Votre profil</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Ces informations nous aident à personnaliser votre expérience.
      </p>
      <div className="mt-8">
        <OnboardingForm locations={locations} />
      </div>
    </div>
  );
}
