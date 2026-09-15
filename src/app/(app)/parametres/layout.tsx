import type { ReactNode } from "react";
import { requireOnboarded } from "@/lib/auth/session";
import { SettingsTabs } from "./_components/settings-tabs";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  await requireOnboarded();

  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">Paramètres</h1>
      <div className="mt-6">
        <SettingsTabs />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
