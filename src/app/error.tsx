"use client";

// Root-level error boundary — the app-wide safety net for any route that
// doesn't define its own error.tsx (see tableau-de-bord/error.tsx for a
// scoped example). Must be a Client Component: Next.js passes it `reset`,
// a closure that needs to run in the browser to re-render the segment.
import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-20">
      <Link href="/">
        <Logo />
      </Link>
      <p className="mt-10 text-sm text-ink-muted">Erreur</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-ink">
        Quelque chose s&apos;est mal passé.
      </h1>
      <p className="mt-4 text-ink-muted">
        Cette page n&apos;a pas pu s&apos;afficher correctement. Vous pouvez réessayer, ou
        revenir à l&apos;accueil.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button type="button" onClick={reset} className={buttonVariants()}>
          Réessayer
        </button>
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
