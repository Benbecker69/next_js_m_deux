"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { FieldError, fieldProps } from "@/components/ui/field-error";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Location } from "@/types/domain";
import { useActionToast } from "@/lib/feedback/use-action-toast";
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
  useActionToast(state, t.preferencesSaved);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="defaultLocationId">{t.defaultLocation}</Label>
        <Select
          id="defaultLocationId"
          name="defaultLocationId"
          defaultValue={defaultLocationId ?? ""}
          {...fieldProps("defaultLocationId", errors?.defaultLocationId)}
        >
          <option value="">{t.none}</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} — {location.city}
            </option>
          ))}
        </Select>
        <FieldError field="defaultLocationId" message={errors?.defaultLocationId} />
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

      {state.error && !errors && <Alert variant="error">{state.error}</Alert>}
      {state.success && <Alert variant="success">{t.preferencesSaved}</Alert>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.saving : t.save}
        </Button>
      </div>
    </form>
  );
}
