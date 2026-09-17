"use client";

import { useActionState, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/lib/feedback/toast-provider";
import { useActionToast } from "@/lib/feedback/use-action-toast";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { SPACE_TYPE_LABELS, type Space, type SpaceType } from "@/types/domain";
import {
  deleteSpaceAction,
  toggleSpaceStatusAction,
  type SpaceFormState,
} from "../_actions";

const SPACE_TYPES: SpaceType[] = [
  "poste-flex",
  "bureau-prive",
  "salle-reunion",
  "phone-booth",
];
const initialState: SpaceFormState = { error: null, success: false };

// Delete uses a two-step inline confirm (like reservation cancellation)
// rather than window.confirm() — consistent with the rest of the app, and
// native dialogs don't fit the design system.
export function SpacesManager({
  spaces,
  createAction,
  t,
  genericError,
}: {
  spaces: Space[];
  createAction: (state: SpaceFormState, formData: FormData) => Promise<SpaceFormState>;
  t: Dictionary["adminSpaces"];
  genericError: string;
}) {
  const [state, formAction, pending] = useActionState(createAction, initialState);
  useActionToast(state, t.added);
  const values = state.values;
  const [, startTransition] = useTransition();
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const toggleStatus = (spaceId: string) => {
    setRowError(null);
    startTransition(async () => {
      try {
        await toggleSpaceStatusAction(spaceId);
        showSuccess(t.statusUpdated);
      } catch (error) {
        const message = error instanceof Error ? error.message : genericError;
        setRowError(message);
        showError(message);
      }
    });
  };

  const remove = (spaceId: string) => {
    setRowError(null);
    setConfirmingDeleteId(null);
    startTransition(async () => {
      try {
        await deleteSpaceAction(spaceId);
        showSuccess(t.deleted);
      } catch (error) {
        const message = error instanceof Error ? error.message : genericError;
        setRowError(message);
        showError(message);
      }
    });
  };

  return (
    <div className="mt-4">
      {rowError && (
        <Alert variant="error" className="mb-4">
          {rowError}
        </Alert>
      )}

      {spaces.length === 0 ? (
        <p className="text-sm text-ink-muted">{t.empty}</p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {spaces.map((space) => (
            <li
              key={space.id}
              className="flex flex-col gap-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="text-ink">{space.name}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {SPACE_TYPE_LABELS[space.type]} · {space.capacity} {t.capacitySuffix} ·{" "}
                  {space.pricePerHour} {t.creditsPerHour}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={space.status === "active" ? "success" : "warning"}>
                  {space.status === "active" ? t.statusActive : t.statusMaintenance}
                </Badge>
                <button
                  type="button"
                  className="text-xs text-ink-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
                  onClick={() => toggleStatus(space.id)}
                >
                  {t.toggle}
                </button>
                {confirmingDeleteId === space.id ? (
                  <span className="animate-toast-in flex items-center gap-2 text-xs">
                    <span className="text-ink-muted">{t.confirmShort}</span>
                    <button
                      type="button"
                      className="text-danger underline-offset-2 hover:underline"
                      onClick={() => remove(space.id)}
                    >
                      {t.yes}
                    </button>
                    <button
                      type="button"
                      className="text-ink-muted underline-offset-2 hover:underline"
                      onClick={() => setConfirmingDeleteId(null)}
                    >
                      {t.no}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="text-xs text-danger underline-offset-2 hover:underline"
                    onClick={() => setConfirmingDeleteId(space.id)}
                  >
                    {t.delete}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        action={formAction}
        className="mt-8 grid gap-4 border-t border-line pt-6 sm:grid-cols-2"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="space-name">{t.name}</Label>
          <Input id="space-name" name="name" defaultValue={values?.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="space-type">{t.type}</Label>
          <select
            id="space-type"
            name="type"
            defaultValue={values?.type ?? "poste-flex"}
            className="h-10 rounded-sm border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            {SPACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SPACE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="space-capacity">{t.capacity}</Label>
          <Input
            id="space-capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={values?.capacity ?? 1}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="space-price">{t.pricePerHour}</Label>
          <Input
            id="space-price"
            name="pricePerHour"
            type="number"
            min={1}
            defaultValue={values?.pricePerHour ?? 4}
            required
          />
        </div>

        {state.error && (
          <Alert variant="error" className="sm:col-span-2">
            {state.error}
          </Alert>
        )}
        {state.success && (
          <Alert variant="success" className="sm:col-span-2">
            {t.added}
          </Alert>
        )}

        <div className="sm:col-span-2">
          <Button type="submit" variant="secondary" disabled={pending}>
            {pending ? t.adding : t.addSpace}
          </Button>
        </div>
      </form>
    </div>
  );
}
