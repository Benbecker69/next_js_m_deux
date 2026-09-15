import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/fonctionnalites", label: "Fonctionnalités" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/lieux", label: "Lieux" },
  { href: "/faq", label: "FAQ" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <p className="font-display text-lg font-medium text-ink">Repère</p>
          <p className="mt-2 text-sm text-ink-muted">
            Trouvez et réservez un espace de coworking près de chez vous.
          </p>
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
        <p className="mx-auto max-w-6xl text-xs text-ink-muted">
          © 2026 Repère. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
