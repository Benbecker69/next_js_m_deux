"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { WifiOff, TriangleAlert } from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { useOnline } from "@/lib/feedback/use-online";
import { applyStoredTheme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils/cn";

/**
 * What every `error.tsx` renders: what happened, what the user can do about
 * it, a real retry, and a reference to quote. The texts are in French and
 * live here (an error boundary is a Client Component rendered when the
 * server failed — it cannot rely on a server-side dictionary).
 *
 * In production Next.js hides the message of a server error and only
 * forwards `error.digest`: that reference is shown so the incident can be
 * found in the server log. The one cause the browser can tell on its own is
 * a lost connection, which gets its own wording.
 */
export function ErrorScreen({
  error,
  retry,
  title = "Cette page n'a pas pu s'afficher.",
  description = "Un problème est survenu de notre côté pendant le chargement. Vos données ne sont pas touchées : réessayez, cela suffit souvent.",
  homeHref = "/",
  homeLabel = "Retour à l'accueil",
  fullPage = false,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  /** Standalone screen with the logo, for a boundary outside any layout. */
  fullPage?: boolean;
}) {
  const [retrying, startTransition] = useTransition();
  // The screen changes by itself when the connection drops or comes back.
  const online = useOnline();

  useEffect(() => {
    console.error(error);
    applyStoredTheme();
  }, [error]);

  const Icon = online ? TriangleAlert : WifiOff;

  return (
    <div
      role="alert"
      className={cn(
        "mx-auto max-w-lg px-6",
        fullPage ? "flex min-h-screen flex-col justify-center py-20" : "py-16",
      )}
    >
      {fullPage && (
        <Link href="/" className="mb-10">
          <Logo />
        </Link>
      )}
      <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-danger/30 bg-danger/10 text-danger">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-medium text-ink">
        {online ? title : "Vous êtes hors ligne."}
      </h1>
      <p className="mt-3 text-ink-muted">
        {online
          ? description
          : "La page n'a pas pu être chargée parce que votre appareil n'est plus connecté à internet. Vérifiez votre connexion, puis réessayez."}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={retrying}
          // `retry` re-fetches the segment's data from the server, unlike
          // `reset`, which only re-renders what the browser already has.
          onClick={() => startTransition(() => retry())}
          className={buttonVariants()}
        >
          {retrying ? "Nouvelle tentative…" : "Réessayer"}
        </button>
        <Link href={homeHref} className={buttonVariants({ variant: "secondary" })}>
          {homeLabel}
        </Link>
      </div>

      {online && error.digest && (
        <p className="mt-8 border-t border-line pt-4 text-xs text-ink-muted">
          Si le problème persiste, communiquez cette référence au support :{" "}
          <code className="rounded-sm bg-surface px-1.5 py-0.5 font-mono text-ink">
            {error.digest}
          </code>
        </p>
      )}
    </div>
  );
}
