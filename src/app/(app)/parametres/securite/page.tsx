import type { Metadata } from "next";
import { requireOnboarded } from "@/lib/auth/session";
import { getLocale, getDictionary, INTL_LOCALE } from "@/lib/i18n/locale";
import { EmailForm, PasswordForm } from "./_components/security-forms";

export const metadata: Metadata = {
  title: "Sécurité",
};

export default async function SettingsSecurityPage() {
  const [user, locale] = await Promise.all([requireOnboarded(), getLocale()]);
  const t = getDictionary(locale);
  const labels = {
    ...t.member.account,
    saving: t.settings.saving,
    passwordHint: t.auth.passwordHint,
  };

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="font-display text-xl font-medium text-ink">
          {t.member.account.emailTitle}
        </h2>
        <div className="mt-4">
          <EmailForm currentEmail={user.email} t={labels} />
        </div>
      </section>

      <section className="border-t border-line pt-10">
        <h2 className="font-display text-xl font-medium text-ink">
          {t.member.account.passwordTitle}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">{t.settings.securityNote}</p>
        <div className="mt-4">
          <PasswordForm t={labels} />
        </div>
      </section>

      <section className="border-t border-line pt-10">
        <h2 className="font-display text-xl font-medium text-ink">
          {t.member.account.detailsTitle}
        </h2>
        <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-ink-muted">{t.settings.role}</dt>
            <dd className="text-ink">
              {user.role === "admin" ? t.settings.admin : t.settings.member}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-ink-muted">{t.settings.memberSince}</dt>
            <dd className="text-ink">
              {new Date(user.createdAt).toLocaleDateString(INTL_LOCALE[locale], {
                dateStyle: "long",
              })}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
