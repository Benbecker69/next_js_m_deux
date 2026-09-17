import type { ReactNode } from "react";
import { requireOnboarded } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/locale";
import { SettingsTabs } from "./_components/settings-tabs";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const [, t] = await Promise.all([requireOnboarded(), getT()]);

  const TABS = [
    { href: "/parametres/profil", label: t.settings.tabProfile },
    { href: "/parametres/preferences", label: t.settings.tabPreferences },
    { href: "/parametres/securite", label: t.settings.tabSecurity },
  ];

  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">{t.settings.title}</h1>
      <div className="mt-6">
        <SettingsTabs tabs={TABS} />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
