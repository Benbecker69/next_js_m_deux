"use client";

import { useActionState, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/lib/feedback/toast-provider";
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
}: {
  spaces: Space[];
  createAction: (state: SpaceFormState, formData: FormData) => Promise<SpaceFormState>;
}) {
  const [state, formAction, pending] = useActionState(createAction, initialState);
  const [, startTransition] = useTransition();
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const { showSuccess } = useToast();

  const toggleStatus = (spaceId: string) => {
    setRowError(null);
    startTransition(async () => {
      try {
        await toggleSpaceStatusAction(spaceId);
        showSuccess("Statut de l'espace mis à jour.");
      } catch (error) {
        setRowError(error instanceof Error ? error.message : "Une erreur est survenue.");
      }
    });
  };

  const remove = (spaceId: string) => {
    setRowError(null);
    setConfirmingDeleteId(null);
    startTransition(async () => {
      try {
        await deleteSpaceAction(spaceId);
        showSuccess("Espace supprimé.");
      } catch (error) {
        setRowError(error instanceof Error ? error.message : "Une erreur est survenue.");
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
        <p className="text-sm text-ink-muted">Aucun espace pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {spaces.map((space) => (
            <li
              key={space.id}
              className="flex items-center justify-between gap-4 py-3 text-sm"
            >
              <div>
                <p className="text-ink">{space.name}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {SPACE_TYPE_LABELS[space.type]} · {space.capacity} pers. ·{" "}
                  {space.pricePerHour} crédits/h
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={space.status === "active" ? "success" : "warning"}>
                  {space.status === "active" ? "Actif" : "Maintenance"}
                </Badge>
                <button
                  type="button"
                  className="text-xs text-ink-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
                  onClick={() => toggleStatus(space.id)}
                >
                  Basculer
                </button>
                {confirmingDeleteId === space.id ? (
                  <span className="animate-toast-in flex items-center gap-2 text-xs">
                    <span className="text-ink-muted">Sûr ?</span>
                    <button
                      type="button"
                      className="text-danger underline-offset-2 hover:underline"
                      onClick={() => remove(space.id)}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      className="text-ink-muted underline-offset-2 hover:underline"
                      onClick={() => setConfirmingDeleteId(null)}
                    >
                      Non
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="text-xs text-danger underline-offset-2 hover:underline"
                    onClick={() => setConfirmingDeleteId(space.id)}
                  >
                    Supprimer
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
          <Label htmlFor="space-name">Nom</Label>
          <Input id="space-name" name="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="space-type">Type</Label>
          <select
            id="space-type"
            name="type"
            defaultValue="poste-flex"
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
          <Label htmlFor="space-capacity">Capacité</Label>
          <Input
            id="space-capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={1}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="space-price">Crédits / heure</Label>
          <Input
            id="space-price"
            name="pricePerHour"
            type="number"
            min={1}
            defaultValue={4}
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
            Espace ajouté.
          </Alert>
        )}

        <div className="sm:col-span-2">
          <Button type="submit" variant="secondary" disabled={pending}>
            {pending ? "Ajout…" : "Ajouter l'espace"}
          </Button>
        </div>
      </form>
    </div>
  );
}
