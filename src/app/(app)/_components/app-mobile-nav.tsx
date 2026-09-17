"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { LogoutButton } from "@/components/logout-button";
import type { Locale } from "@/lib/i18n/locale-constants";
import { AppNav } from "./app-nav";

// Below md the persistent left sidebar (member + admin nav, locale/theme,
// profile) has no room to sit inline — that's what used to push real page
// content far down the screen on a phone. This collapses all of it behind a
// slim top bar with a menu trigger; md+ keeps the sidebar exactly as-is.
export function AppMobileNav({
  items,
  locale,
  user,
  labels,
}: {
  items: { href: string; label: string }[];
  locale: Locale;
  user: { name: string; credits: number };
  labels: { creditsSuffix: string; logout: string; openMenu: string; closeMenu: string };
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
    <div className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
      <Link href="/tableau-de-bord">
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        <UserAvatar name={user.name} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={labels.openMenu}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-ink/30"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      {open && (
        <div className="animate-toast-in fixed inset-0 z-50 flex flex-col bg-paper">
          <div className="flex min-h-16 items-center justify-between border-b border-line px-4">
            <Link href="/tableau-de-bord" onClick={() => setOpen(false)}>
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

          <div className="flex-1 overflow-y-auto px-4">
            <AppNav items={items} onNavigate={() => setOpen(false)} />
          </div>

          <div className="flex flex-col gap-4 border-t border-line px-4 py-4">
            <div className="flex items-center gap-2">
              <LocaleSwitcher locale={locale} />
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
              <Link
                href="/parametres/profil"
                onClick={() => setOpen(false)}
                className="flex min-w-0 items-center gap-3"
              >
                <UserAvatar name={user.name} />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">{user.name}</span>
                  <span className="block text-xs text-ink-muted">
                    {user.credits} {labels.creditsSuffix}
                  </span>
                </span>
              </Link>
              <LogoutButton label={labels.logout} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
