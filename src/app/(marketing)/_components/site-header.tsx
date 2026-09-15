import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";

const NAV_LINKS = [
  { href: "/fonctionnalites", label: "Fonctionnalités" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/lieux", label: "Lieux" },
  { href: "/vision-mobile", label: "Vision mobile" },
  { href: "/faq", label: "FAQ" },
];

export async function SiteHeader() {
  const user = await getSession();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6">
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

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/tableau-de-bord"
                className="hidden text-sm text-ink-muted transition-colors hover:text-ink sm:inline"
              >
                {user.name.split(" ")[0]}
              </Link>
              <form action="/deconnexion" method="post">
                <button
                  type="submit"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="hidden text-sm text-ink-muted transition-colors hover:text-ink sm:inline"
              >
                Se connecter
              </Link>
              <Link href="/inscription" className={buttonVariants({ size: "sm" })}>
                Réserver un espace
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
