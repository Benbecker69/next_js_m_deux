"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/lib/feedback/toast-provider";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { adminCancelReservationAction } from "../_actions";

export function CancelReservationButton({
  reservationId,
  t,
  genericError,
}: {
  reservationId: string;
  t: Dictionary["adminReservationsPage"];
  genericError: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { showSuccess } = useToast();

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
          onClick={() => {
            startTransition(async () => {
              try {
                await adminCancelReservationAction(reservationId);
                showSuccess(t.cancelSuccess);
              } catch (err) {
                setError(err instanceof Error ? err.message : genericError);
              }
            });
          }}
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
