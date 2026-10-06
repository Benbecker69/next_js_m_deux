"use client";

// Inside the (app) layout: the sidebar stays in place, so the member can go
// elsewhere even when one page fails. Covers every member and admin page.
import { ErrorScreen } from "@/components/error-screen";

export default function AppError({
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
      homeHref="/tableau-de-bord"
      homeLabel="Retour au tableau de bord"
    />
  );
}
