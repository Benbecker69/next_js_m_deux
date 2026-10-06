"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useRunAction } from "@/lib/feedback/use-run-action";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { adminCancelReservationAction } from "../_actions";

export function CancelReservationButton({
  reservationId,
  t,
}: {
  reservationId: string;
  t: Dictionary["adminReservationsPage"];
}) {
  const { run, pending, error } = useRunAction();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
        {t.cancel}
      </Button>
    );
  }

  return (
    <div className="animate-toast-in flex flex-col gap-3 rounded-sm border border-danger/30 bg-danger/5 p-4">
      <p className="text-sm text-ink">{t.confirmCancelPrompt}</p>
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={() => run(() => adminCancelReservationAction(reservationId))}
        >
          {pending ? t.cancelling : t.confirm}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={pending}
        >
          {t.back}
        </Button>
      </div>
    </div>
  );
}
