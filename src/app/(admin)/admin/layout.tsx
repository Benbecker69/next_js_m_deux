import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireAdmin } from "@/lib/auth/session";
import { AdminNav } from "./_components/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col justify-between border-b border-line p-6 md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div>
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-medium text-ink">Repère</span>
            <span className="text-xs text-ochre">Admin</span>
          </Link>
          <AdminNav />
        </div>
        <div className="mt-6 flex flex-col gap-4 md:mt-0">
          <ThemeToggle />
          <div className="border-t border-line pt-4">
            <p className="text-sm text-ink">{user.name}</p>
            <p className="text-xs text-ink-muted">Administrateur</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/tableau-de-bord"
                className="text-xs text-ink-muted transition-colors hover:text-ink"
              >
                ← Retour à l&apos;espace membre
              </Link>
              <form action="/deconnexion" method="post">
                <button
                  type="submit"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>
      <main id="contenu" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
