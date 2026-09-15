import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireOnboarded } from "@/lib/auth/session";
import { AppNav } from "./_components/app-nav";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireOnboarded();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col justify-between border-b border-line p-6 md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div>
          <Link
            href="/tableau-de-bord"
            className="font-display text-lg font-medium text-ink"
          >
            Repère
          </Link>
          <AppNav />
        </div>
        <div className="mt-6 flex flex-col gap-4 md:mt-0">
          <ThemeToggle />
          <div className="border-t border-line pt-4">
            <p className="text-sm text-ink">{user.name}</p>
            <p className="text-xs text-ink-muted">{user.credits} crédits</p>
            <form action="/deconnexion" method="post" className="mt-3">
              <button
                type="submit"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main id="contenu" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
