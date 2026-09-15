import type { Metadata } from "next";
import { requireOnboarded } from "@/lib/auth/session";
import { getPreferenceByUser } from "@/lib/data/preferences";
import { listLocations } from "@/lib/data/locations";
import { PreferencesForm } from "./_components/preferences-form";

export const metadata: Metadata = {
  title: "Préférences",
};

export default async function SettingsPreferencesPage() {
  const user = await requireOnboarded();
  const [preference, locations] = await Promise.all([
    getPreferenceByUser(user.id),
    listLocations(),
  ]);

  return (
    <PreferencesForm
      locations={locations}
      defaultLocationId={preference.defaultLocationId}
      notificationsEnabled={preference.notificationsEnabled}
    />
  );
}
