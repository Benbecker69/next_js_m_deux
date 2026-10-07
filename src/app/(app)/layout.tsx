import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarPlus, Globe } from "lucide-react";
import { Logo } from "@/components/logo";
import { LogoutConfirm } from "@/components/logout-confirm";
import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import { requireOnboarded } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/locale";
import { AppNav, AppTabBar } from "./_components/app-nav";
import { OfflineBanner } from "./_components/offline-banner";

// The frame of the signed-in area. One set of pages, shown two ways: a
// sidebar from md up, a tab bar at the bottom of the screen below md (see
// app-nav.tsx). Guarded on the server: an unauthenticated or not-yet-onboarded
// request is redirected before anything here renders.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const [user, t] = await Promise.all([requireOnboarded(), getT()]);
  const nav = t.member.nav;
  const isAdmin = user.role === "admin";

  const home = { href: "/tableau-de-bord", label: nav.home };
  const account = { href: "/parametres", label: nav.account };

  // Sidebar: daily pages, then the account, then administration — admins only.
  const sidebarGroups = [
    [
      home,
      { href: "/reservations", label: nav.reservations },
      { href: "/arrivees", label: nav.arrivals },
    ],
    [account],
    ...(isAdmin ? [[{ href: "/admin", label: nav.admin }]] : []),
  ];

  // Tab bar: five places at most, with labels short enough for a phone.
  const tabs = [
    home,
    { href: "/reserver", label: nav.bookShort },
    { href: "/reservations", label: nav.reservationsShort },
    { href: "/arrivees", label: nav.arrivals },
    { href: "/parametres", label: nav.accountShort },
  ];

  const creditsWord = user.credits === 1 ? nav.credit : nav.credits;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Phone: a slim bar with the brand and the balance. */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper px-4 py-3 md:hidden">
        <Link href="/tableau-de-bord">
          <Logo />
        </Link>
        <Link
          href="/parametres"
          className="rounded-sm border border-line bg-surface px-3 py-1 text-sm text-ink"
        >
          <span className="font-medium tabular-nums">{user.credits}</span> {creditsWord}
        </Link>
      </header>

      {/* Desktop: the sidebar stays in view while the page scrolls. */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:overflow-y-auto md:border-r md:border-line md:p-5">
        <Link href="/tableau-de-bord" className="px-1">
          <Logo />
        </Link>

        {/* The one thing most visits are for, above everything else. */}
        <Link href="/reserver" className={buttonVariants({ className: "mt-8 w-full" })}>
          <CalendarPlus className="h-4 w-4" strokeWidth={1.75} />
          {nav.book}
        </Link>

        <div className="mt-6">
          <AppNav groups={sidebarGroups} label={nav.label} />
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-6">
          <div className="rounded-sm border border-line bg-surface p-4">
            <p className="text-xs text-ink-muted">{nav.balance}</p>
            <p className="mt-1 text-sm text-ink-muted">
              <span className="font-display text-3xl font-medium tabular-nums text-ink">
                {user.credits}
              </span>{" "}
              {creditsWord}
            </p>
          </div>

          <Link
            href="/parametres"
            className="flex min-w-0 items-center gap-3 rounded-sm transition-opacity hover:opacity-80"
          >
            <UserAvatar name={user.name} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">
                {user.name}
              </span>
              <span className="block truncate text-xs text-ink-muted">{user.email}</span>
            </span>
          </Link>

          <div className="flex flex-col gap-3 border-t border-line pt-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <Globe className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {nav.site}
            </Link>
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
      </aside>

      <div className="min-w-0 flex-1">
        <OfflineBanner label={nav.offline} />
        {/* Bottom padding below md: the tab bar must never cover the page's end. */}
        <main id="contenu" className="pb-24 md:pb-0">
          {children}
        </main>
      </div>

      <AppTabBar items={tabs} label={nav.label} />
    </div>
  );
}
