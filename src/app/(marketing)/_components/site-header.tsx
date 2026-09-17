import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { UserAvatar } from "@/components/user-avatar";
import { LogoutButton } from "@/components/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getLocale, getDictionary } from "@/lib/i18n/locale";

export async function SiteHeader() {
  const [user, locale] = await Promise.all([getSession(), getLocale()]);
  const t = getDictionary(locale);

  const NAV_LINKS = [
    { href: "/fonctionnalites", label: t.nav.features },
    { href: "/tarifs", label: t.nav.pricing },
    { href: "/lieux", label: t.nav.locations },
    { href: "/vision-mobile", label: t.nav.mobileVision },
    { href: "/faq", label: t.nav.faq },
  ];

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2 sm:flex-nowrap sm:gap-x-6 sm:px-6 sm:py-0">
        <Link href="/">
          <Logo />
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-6 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-nowrap sm:gap-3">
          <LocaleSwitcher locale={locale} />
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/tableau-de-bord" aria-label={user.name}>
                <UserAvatar name={user.name} />
              </Link>
              <LogoutButton label={t.common.logout} />
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                {t.common.login}
              </Link>
              <Link href="/inscription" className={buttonVariants({ size: "sm" })}>
                {t.common.bookSpace}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
