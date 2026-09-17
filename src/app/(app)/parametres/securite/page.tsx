import type { Metadata } from "next";
import { requireOnboarded } from "@/lib/auth/session";
import { getLocale, getDictionary, INTL_LOCALE } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Sécurité",
};

export default async function SettingsSecurityPage() {
  const [user, locale] = await Promise.all([requireOnboarded(), getLocale()]);
  const t = getDictionary(locale);

  return (
    <div className="flex flex-col gap-6">
      <dl className="divide-y divide-line border-t border-line text-sm">
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">{t.settings.email}</dt>
          <dd className="text-ink">{user.email}</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">{t.settings.role}</dt>
          <dd className="text-ink">
            {user.role === "admin" ? t.settings.admin : t.settings.member}
          </dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">{t.settings.memberSince}</dt>
          <dd className="text-ink">
            {new Date(user.createdAt).toLocaleDateString(INTL_LOCALE[locale], {
              dateStyle: "long",
            })}
          </dd>
        </div>
      </dl>
      <p className="text-sm text-ink-muted">{t.settings.securityNote}</p>
    </div>
  );
}
