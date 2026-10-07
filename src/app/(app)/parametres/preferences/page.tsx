import type { Metadata } from "next";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireOnboarded } from "@/lib/auth/session";
import { getPreferenceByUser } from "@/lib/data/preferences";
import { listLocations } from "@/lib/data/locations";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { PreferencesForm } from "./_components/preferences-form";

export const metadata: Metadata = {
  title: "Préférences",
};

export default async function SettingsPreferencesPage() {
  const user = await requireOnboarded();
  const [preference, locations, locale] = await Promise.all([
    getPreferenceByUser(user.id),
    listLocations(),
    getLocale(),
  ]);
  const t = getDictionary(locale);
  const account = t.member.account;

  return (
    <div className="flex flex-col gap-10">
      {/* Language and appearance apply at once and are remembered by the
          browser (a cookie, localStorage): they are not part of the form
          below, which saves to the account. */}
      <section>
        <h2 className="font-display text-xl font-medium text-ink">
          {account.displayTitle}
        </h2>
        <dl className="mt-4 divide-y divide-line border-y border-line">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm text-ink">{account.language}</dt>
            <dd>
              <LocaleSwitcher locale={locale} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm text-ink">{account.theme}</dt>
            <dd>
              <ThemeToggle />
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="font-display text-xl font-medium text-ink">
          {account.bookingTitle}
        </h2>
        <div className="mt-4">
          <PreferencesForm
            locations={locations}
            defaultLocationId={preference.defaultLocationId}
            notificationsEnabled={preference.notificationsEnabled}
            t={t.settings}
          />
        </div>
      </section>
    </div>
  );
}
