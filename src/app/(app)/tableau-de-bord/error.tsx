"use client";

// Scoped to the dashboard: same screen as the rest of the member area, with
// a sentence that names what failed to load.
import { ErrorScreen } from "@/components/error-screen";

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorScreen
      error={error}
      retry={retry}
      title="Votre tableau de bord n'a pas pu être chargé."
      description="Vos crédits et vos réservations n'ont pas pu être récupérés. Ils ne sont pas touchés : réessayez, ou passez par « Mes réservations »."
      homeHref="/reservations"
      homeLabel="Voir mes réservations"
    />
  );
}
