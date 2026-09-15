import Link from "next/link";
import { Logo } from "@/components/logo";
import { getT } from "@/lib/i18n/locale";

export async function SiteFooter() {
  const t = await getT();

  const FOOTER_LINKS = [
    { href: "/fonctionnalites", label: t.nav.features },
    { href: "/tarifs", label: t.nav.pricing },
    { href: "/lieux", label: t.nav.locations },
    { href: "/vision-mobile", label: t.nav.mobileVision },
    { href: "/faq", label: t.nav.faq },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-2 text-sm text-ink-muted">{t.footer.tagline}</p>
        </div>

        <nav
          aria-label="Liens du pied de page"
          className="flex flex-wrap gap-x-8 gap-y-2"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line px-6 py-4">
        <p className="mx-auto max-w-6xl text-xs text-ink-muted">{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
