import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Globe, Shield } from "lucide-react";
import { LogoutConfirm } from "@/components/logout-confirm";
import { UserAvatar } from "@/components/user-avatar";
import { requireOnboarded } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/locale";
import { SettingsTabs } from "./_components/settings-tabs";

// "Mon compte": who is signed in, then three tabs (profile, security,
// preferences). On a phone it is also where the rarer destinations live —
// administration, the public site, signing out — since the tab bar only has
// room for the pages used every day; from md up the sidebar already has them.
export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const [user, t] = await Promise.all([requireOnboarded(), getT()]);
  const nav = t.member.nav;

  const TABS = [
    { href: "/parametres/profil", label: t.settings.tabProfile },
    { href: "/parametres/securite", label: t.settings.tabSecurity },
    { href: "/parametres/preferences", label: t.settings.tabPreferences },
  ];

  const links = [
    ...(user.role === "admin"
      ? [{ href: "/admin", label: nav.admin, Icon: Shield }]
      : []),
    { href: "/", label: nav.site, Icon: Globe },
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-3xl font-medium text-ink">{nav.account}</h1>

      <div className="mt-6 flex items-center gap-4 rounded-sm border border-line bg-surface p-5">
        <UserAvatar name={user.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-medium text-ink">
            {user.name}
          </p>
          <p className="truncate text-sm text-ink-muted">{user.email}</p>
        </div>
        <p className="shrink-0 text-right text-sm text-ink-muted">
          <span className="block font-display text-2xl font-medium tabular-nums text-ink">
            {user.credits}
          </span>
          {user.credits === 1 ? nav.credit : nav.credits}
        </p>
      </div>

      <div className="mt-6">
        <SettingsTabs tabs={TABS} />
      </div>
      <div className="mt-8">{children}</div>

      <div className="mt-12 md:hidden">
        <ul className="divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface">
          {links.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 p-4 text-ink transition-colors hover:bg-paper"
              >
                <Icon className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} />
                <span className="flex-1">{label}</span>
                <ChevronRight className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 px-1">
          <LogoutConfirm
            labels={{
              logout: nav.logout,
              confirm: nav.logoutConfirm,
              yes: nav.yes,
              no: nav.no,
            }}
          />
        </div>
      </div>
    </div>
  );
}
