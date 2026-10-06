import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LogoutButton } from "@/components/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getLocale, getDictionary } from "@/lib/i18n/locale";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export async function SiteHeader() {
  const [user, locale] = await Promise.all([getSession(), getLocale()]);
  const t = getDictionary(locale);

  // Ordered by what a visitor wants to know: where, how much, how it works.
  const NAV_LINKS = [
    { href: "/lieux", label: t.nav.locations },
    { href: "/tarifs", label: t.nav.pricing },
    { href: "/fonctionnalites", label: t.nav.features },
    { href: "/vision-mobile", label: t.nav.mobileVision },
    { href: "/faq", label: t.nav.faq },
  ];

  return (
    // Stays in view while scrolling: the way to book is never out of reach.
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-stretch justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-stretch gap-8">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <NavLinks links={NAV_LINKS} />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher locale={locale} />
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/tableau-de-bord" className={buttonVariants({ size: "sm" })}>
                {t.site.mySpace}
              </Link>
              <LogoutButton label={t.common.logout} />
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="px-2 text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {t.common.login}
              </Link>
              <Link href="/inscription" className={buttonVariants({ size: "sm" })}>
                {t.site.createAccount}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center md:hidden">
          <MobileNav
            navLinks={NAV_LINKS}
            locale={locale}
            user={user ? { name: user.name } : null}
            labels={{
              login: t.common.login,
              bookSpace: t.site.createAccount,
              logout: t.common.logout,
              dashboard: t.site.mySpace,
              openMenu: t.nav.openMenu,
              closeMenu: t.nav.closeMenu,
            }}
          />
        </div>
      </div>
    </header>
  );
}
