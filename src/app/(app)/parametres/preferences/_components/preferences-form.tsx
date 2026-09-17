"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Location } from "@/types/domain";
import { updatePreferencesAction, type PreferencesFormState } from "../_actions";

const initialState: PreferencesFormState = { error: null, success: false };

export function PreferencesForm({
  locations,
  defaultLocationId,
  notificationsEnabled,
  t,
}: {
  locations: Location[];
  defaultLocationId: string | null;
  notificationsEnabled: boolean;
  t: Dictionary["settings"];
}) {
  const [state, formAction, pending] = useActionState(
    updatePreferencesAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="defaultLocationId">{t.defaultLocation}</Label>
        <select
          id="defaultLocationId"
          name="defaultLocationId"
          defaultValue={defaultLocationId ?? ""}
          className="h-10 rounded-sm border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <option value="">{t.none}</option>
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
        {t.emailReminder}
      </label>

      <p className="text-xs text-ink-muted">{t.themeHint}</p>

      {state.error && <Alert variant="error">{state.error}</Alert>}
      {state.success && <Alert variant="success">{t.preferencesSaved}</Alert>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.saving : t.save}
        </Button>
      </div>
    </form>
  );
}
