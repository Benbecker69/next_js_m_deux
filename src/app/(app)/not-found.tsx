import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n/locale";

// Scoped to (app): notFound() from a member or admin page (a reservation,
// a space, a user that no longer exists) renders here, inside the sidebar
// layout, instead of falling through to the root not-found.tsx and losing
// the navigation.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.errors.notFoundMetaTitle, robots: { index: false } };
}

export default async function AppNotFound() {
  const t = await getT();

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <p className="text-sm text-ink-muted">{t.errors.notFoundCode}</p>
      <h1 className="mt-2 font-display text-2xl font-medium text-ink">
        {t.errors.appNotFoundTitle}
      </h1>
      <p className="mt-3 text-ink-muted">{t.errors.appNotFoundBody}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/tableau-de-bord" className={buttonVariants()}>
          {t.errors.goToDashboard}
        </Link>
        <Link href="/reservations" className={buttonVariants({ variant: "secondary" })}>
          {t.appNav.myReservations}
        </Link>
      </div>
    </div>
  );
}
