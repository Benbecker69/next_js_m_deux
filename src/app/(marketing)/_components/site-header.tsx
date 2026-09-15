import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/fonctionnalites", label: "Fonctionnalités" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/lieux", label: "Lieux" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="font-display text-lg font-medium text-ink">
          Repère
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

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/connexion"
            className="hidden text-sm text-ink-muted transition-colors hover:text-ink sm:inline"
          >
            Se connecter
          </Link>
          <Link href="/inscription" className={buttonVariants({ size: "sm" })}>
            Réserver un espace
          </Link>
        </div>
      </div>
    </header>
  );
}
