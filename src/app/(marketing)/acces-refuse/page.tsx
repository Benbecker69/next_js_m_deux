import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// Landing spot for requireAdmin() when a signed-in, non-admin member tries
// an /admin route — see lib/auth/session.ts. Deliberately not a redirect
// straight to "/": a silent bounce with no explanation reads as a bug, not
// a permission boundary. Lives in (marketing) so it keeps the site header
// (with the member's own "tableau de bord" link) instead of a bare page.
export const metadata: Metadata = {
  title: "Accès refusé",
  robots: { index: false },
};

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-20">
      <p className="text-sm text-ink-muted">403</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-ink">Accès refusé.</h1>
      <p className="mt-4 text-ink-muted">
        Cette page est réservée aux administrateurs. Si vous pensez que c&apos;est une
        erreur, contactez un administrateur de votre organisation.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/tableau-de-bord" className={buttonVariants()}>
          Aller à mon tableau de bord
        </Link>
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
