"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

/**
 * "Sign out", written out and asked twice: a first click only reveals
 * "Sign out? Yes / No" in place, so a slip of the mouse does not end the
 * session — the same two-step confirm as the mobile app's alert, without a
 * native dialog. The "Yes" is a plain form POST to the `/deconnexion` Route
 * Handler: signing out still works if the page's JavaScript has not loaded.
 */
export function LogoutConfirm({
  labels,
}: {
  labels: { logout: string; confirm: string; yes: string; no: string };
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-danger"
      >
        <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        {labels.logout}
      </button>
    );
  }

  return (
    <form
      action="/deconnexion"
      method="post"
      className="animate-toast-in flex items-center gap-3 text-sm"
    >
      <span className="text-ink">{labels.confirm}</span>
      <button
        type="submit"
        className="font-medium text-danger underline-offset-2 hover:underline"
      >
        {labels.yes}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-ink-muted underline-offset-2 hover:underline"
      >
        {labels.no}
      </button>
    </form>
  );
}
