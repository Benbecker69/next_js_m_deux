"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
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
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-xl font-medium text-ink">
        Une erreur est survenue
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Le tableau de bord n&apos;a pas pu être chargé. Réessayez, ou revenez plus tard.
      </p>
      <div className="mt-6">
        <Button onClick={reset}>Réessayer</Button>
      </div>
    </div>
  );
}
