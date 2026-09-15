import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n/locale";

// Scoped to (marketing): notFound() called from a page inside this group
// (e.g. /lieux/[slug] for an unknown slug) still renders within the
// SiteHeader/SiteFooter layout — without this file, it fell through to the
// root not-found.tsx, which duplicates its own logo under the site header.
// The root one stays as the fallback for a URL that matches no route at all.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.errors.notFoundMetaTitle, robots: { index: false } };
}

export default async function MarketingNotFound() {
  const t = await getT();

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <p className="text-sm text-ink-muted">{t.errors.notFoundCode}</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-ink">
        {t.errors.notFoundTitle}
      </h1>
      <p className="mt-4 text-ink-muted">{t.errors.notFoundBody}</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/" className={buttonVariants()}>
          {t.common.backToHome}
        </Link>
        <Link href="/lieux" className={buttonVariants({ variant: "secondary" })}>
          {t.common.seeLocations}
        </Link>
      </div>
    </div>
  );
}
