"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { LogoutButton } from "@/components/logout-button";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/locale-constants";

// Below md, the desktop header's nav links and right-hand controls have
// nowhere to go — this swaps them for a single trigger that opens a
// full-screen panel with the same links and controls, stacked and touch-sized.
export function MobileNav({
  navLinks,
  locale,
  user,
  labels,
}: {
  navLinks: { href: string; label: string }[];
  locale: Locale;
  user: { name: string } | null;
  labels: {
    login: string;
    bookSpace: string;
    logout: string;
    dashboard: string;
    openMenu: string;
    closeMenu: string;
  };
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.openMenu}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-ink/30"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open && (
        <div className="animate-toast-in fixed inset-0 z-50 flex flex-col bg-paper">
          <div className="flex min-h-16 items-center justify-between border-b border-line px-4">
            <Link href="/" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.closeMenu}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-ink/30"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>

          <nav
            aria-label="Navigation principale"
            className="flex flex-col gap-1 px-4 py-6"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-sm px-2 py-3 text-lg text-ink transition-colors hover:text-pine"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-4 border-t border-line px-4 py-4">
            <div className="flex items-center gap-3">
              <LocaleSwitcher locale={locale} />
              <ThemeToggle />
            </div>
            {user ? (
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/tableau-de-bord"
                  onClick={() => setOpen(false)}
                  className="flex min-w-0 items-center gap-3"
                >
                  <UserAvatar name={user.name} />
                  <span className="truncate text-sm text-ink">{labels.dashboard}</span>
                </Link>
                <LogoutButton label={labels.logout} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/connexion"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  {labels.login}
                </Link>
                <Link
                  href="/inscription"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({})}
                >
                  {labels.bookSpace}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
