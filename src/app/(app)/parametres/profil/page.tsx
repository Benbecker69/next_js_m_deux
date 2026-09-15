import type { Metadata } from "next";
import { requireOnboarded } from "@/lib/auth/session";
import { ProfileForm } from "./_components/profile-form";

export const metadata: Metadata = {
  title: "Profil",
};

export default async function SettingsProfilePage() {
  const user = await requireOnboarded();
  return <ProfileForm name={user.name} memberType={user.memberType} />;
}
