import type { Metadata } from "next";
import { requireOnboarded } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/locale";
import { ProfileForm } from "./_components/profile-form";

export const metadata: Metadata = {
  title: "Profil",
};

export default async function SettingsProfilePage() {
  const [user, t] = await Promise.all([requireOnboarded(), getT()]);
  return <ProfileForm name={user.name} memberType={user.memberType} t={t.settings} />;
}
