import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n/locale";

// Landing spot for requireAdmin() when a signed-in, non-admin member tries
// an /admin route — see lib/auth/session.ts. Deliberately not a redirect
// straight to "/": a silent bounce with no explanation reads as a bug, not
// a permission boundary. Lives in (marketing) so it keeps the site header
// (with the member's own "tableau de bord" link) instead of a bare page.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.errors.forbiddenMetaTitle, robots: { index: false } };
}

export default async function AccessDeniedPage() {
  const t = await getT();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-20">
      <p className="text-sm text-ink-muted">{t.errors.forbiddenCode}</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-ink">
        {t.errors.forbiddenTitle}
      </h1>
      <p className="mt-4 text-ink-muted">{t.errors.forbiddenBody}</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/tableau-de-bord" className={buttonVariants()}>
          {t.errors.goToDashboard}
        </Link>
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          {t.common.backToHome}
        </Link>
      </div>
    </div>
  );
}
