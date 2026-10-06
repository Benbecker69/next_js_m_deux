import Link from "next/link";
import { Logo } from "@/components/logo";
import { getSession } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/locale";

export async function SiteFooter() {
  const [user, t] = await Promise.all([getSession(), getT()]);

  const COLUMNS = [
    {
      title: t.site.footerDiscover,
      links: [
        { href: "/lieux", label: t.nav.locations },
        { href: "/tarifs", label: t.nav.pricing },
        { href: "/fonctionnalites", label: t.nav.features },
        { href: "/vision-mobile", label: t.nav.mobileVision },
        { href: "/faq", label: t.nav.faq },
      ],
    },
    {
      title: t.site.footerAccount,
      // What "account" means depends on whether someone is signed in.
      links: user
        ? [
            { href: "/tableau-de-bord", label: t.site.mySpace },
            { href: "/reserver", label: t.common.bookSpace },
            { href: "/reservations", label: t.appNav.myReservations },
          ]
        : [
            { href: "/connexion", label: t.common.login },
            { href: "/inscription", label: t.site.createAccount },
          ],
    },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-ink-muted">{t.footer.tagline}</p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-sm font-medium text-ink">{column.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 text-xs text-ink-muted sm:flex-row sm:justify-between">
          <p>{t.footer.copyright}</p>
          <p>{t.site.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
