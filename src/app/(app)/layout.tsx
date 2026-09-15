import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { LogoutButton } from "@/components/logout-button";
import { requireOnboarded } from "@/lib/auth/session";
import { AppNav } from "./_components/app-nav";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireOnboarded();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col justify-between border-b border-line p-6 md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div>
          <Link href="/tableau-de-bord">
            <Logo />
          </Link>
          <AppNav />
        </div>
        <div className="mt-6 flex flex-col gap-4 md:mt-0">
          <ThemeToggle />
          <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
            <Link
              href="/parametres/profil"
              className="flex min-w-0 items-center gap-3 rounded-sm transition-opacity hover:opacity-80"
            >
              <UserAvatar name={user.name} />
              <span className="min-w-0">
                <span className="block truncate text-sm text-ink">{user.name}</span>
                <span className="block text-xs text-ink-muted">
                  {user.credits} crédits
                </span>
              </span>
            </Link>
            <LogoutButton label="Déconnexion" />
          </div>
        </div>
      </aside>
      <main id="contenu" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
