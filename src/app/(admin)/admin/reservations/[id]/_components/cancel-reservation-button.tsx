"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/lib/feedback/toast-provider";
import { adminCancelReservationAction } from "../_actions";

export function CancelReservationButton({ reservationId }: { reservationId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { showSuccess } = useToast();

  if (!confirming) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
        Annuler cette réservation
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-danger/30 bg-danger/5 p-4">
      <p className="text-sm text-ink">
        Confirmer l&apos;annulation ? Les crédits seront recrédités au membre.
      </p>
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
                showSuccess("Réservation annulée, crédits recrédités au membre.");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Une erreur est survenue.");
              }
            });
          }}
        >
          {pending ? "Annulation…" : "Confirmer"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={pending}
        >
          Retour
        </Button>
      </div>
    </div>
  );
}
