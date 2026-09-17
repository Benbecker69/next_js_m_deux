import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { UserAvatar } from "@/components/user-avatar";
import { LogoutButton } from "@/components/logout-button";
import { requireAdmin } from "@/lib/auth/session";
import { getLocale, getDictionary } from "@/lib/i18n/locale";
import { AdminNav } from "./_components/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [user, locale] = await Promise.all([requireAdmin(), getLocale()]);
  const t = getDictionary(locale);

  const NAV_ITEMS = [
    { href: "/admin", label: t.adminNav.overview },
    { href: "/admin/lieux", label: t.adminNav.locations },
    { href: "/admin/utilisateurs", label: t.adminNav.users },
    { href: "/admin/reservations", label: t.adminNav.reservations },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col justify-between border-b border-line p-6 md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div>
          <Link href="/admin" className="flex items-center gap-2">
            <Logo />
            <span className="text-xs text-ochre">Admin</span>
          </Link>
          <AdminNav items={NAV_ITEMS} />
        </div>
        <div className="mt-6 flex flex-col gap-4 md:mt-0">
          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} />
            <ThemeToggle />
          </div>
          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/parametres/profil"
                className="flex min-w-0 items-center gap-3 rounded-sm transition-opacity hover:opacity-80"
              >
                <UserAvatar name={user.name} />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">{user.name}</span>
                  <span className="block text-xs text-ink-muted">
                    {t.adminNav.administrator}
                  </span>
                </span>
              </Link>
              <LogoutButton label={t.common.logout} />
            </div>
            <Link
              href="/tableau-de-bord"
              className="mt-3 block text-xs text-ink-muted transition-colors hover:text-ink"
            >
              {t.adminNav.backToMemberArea}
            </Link>
          </div>
        </div>
      </aside>
      <main id="contenu" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
