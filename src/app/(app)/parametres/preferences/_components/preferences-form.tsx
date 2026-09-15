"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Location } from "@/types/domain";
import { updatePreferencesAction, type PreferencesFormState } from "../_actions";

const initialState: PreferencesFormState = { error: null, success: false };

export function PreferencesForm({
  locations,
  defaultLocationId,
  notificationsEnabled,
}: {
  locations: Location[];
  defaultLocationId: string | null;
  notificationsEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updatePreferencesAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="defaultLocationId">Lieu par défaut</Label>
        <select
          id="defaultLocationId"
          name="defaultLocationId"
          defaultValue={defaultLocationId ?? ""}
          className="h-10 rounded-sm border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <option value="">Aucun</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} — {location.city}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="notificationsEnabled"
          defaultChecked={notificationsEnabled}
          className="h-4 w-4 accent-[var(--pine)]"
        />
        Recevoir un e-mail de rappel avant chaque réservation
      </label>

      <p className="text-xs text-ink-muted">
        L&apos;apparence (clair/sombre) se règle depuis le sélecteur dans la barre
        latérale.
      </p>

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-pine">
          Préférences mises à jour.
        </p>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
