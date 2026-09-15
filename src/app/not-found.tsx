import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// Root-level boundary: catches any URL that matches no route in the app.
// Rendered inside the root layout only (route-group headers/footers don't
// apply here, since the URL never matched a segment inside those groups) —
// so this page is deliberately self-contained rather than assuming nav exists.
export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-20">
      <Link href="/" className="font-display text-lg font-medium text-ink">
        Repère
      </Link>
      <p className="mt-10 text-sm text-ink-muted">404</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-ink">
        Ce repère n&apos;existe pas.
      </h1>
      <p className="mt-4 text-ink-muted">
        La page que vous cherchez a disparu, ou n&apos;a jamais existé. Vérifiez
        l&apos;adresse, ou repartez d&apos;un point connu.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/" className={buttonVariants()}>
          Retour à l&apos;accueil
        </Link>
        <Link href="/lieux" className={buttonVariants({ variant: "secondary" })}>
          Voir les lieux
        </Link>
      </div>
    </div>
  );
}
