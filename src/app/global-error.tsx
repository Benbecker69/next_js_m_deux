"use client";

// Replaces the root layout when the layout itself fails, so it has to render
// its own <html> and <body> and import the stylesheet again. The fonts loaded
// by the layout are not available here: the screen falls back to the system
// fonts, which is fine for a page nobody should ever see.
import "./globals.css";
import { ErrorScreen } from "@/components/error-screen";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen font-sans antialiased">
        <title>Erreur — Repère</title>
        <ErrorScreen
          error={error}
          retry={retry}
          fullPage
          title="Repère est momentanément indisponible."
          description="Le site n'a pas pu démarrer correctement. Le problème vient de notre côté : réessayez dans quelques instants."
        />
      </body>
    </html>
  );
}
