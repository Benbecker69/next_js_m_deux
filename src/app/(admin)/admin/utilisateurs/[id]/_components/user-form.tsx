"use client";

import { Fragment, useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { User } from "@/types/domain";
import { deleteUserAdminAction, type UserFormState } from "../_actions";

const initialState: UserFormState = { error: null, success: false };

export function UserForm({
  user,
  isSelf,
  action,
}: {
  user: User;
  isSelf: boolean;
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [deletePending, startDeleteTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const remove = () => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      try {
        await deleteUserAdminAction(user.id);
      } catch (err) {
        setConfirmingDelete(false);
        setDeleteError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  };

  return (
    <Fragment>
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Rôle</Label>
          <select
            id="role"
            name="role"
            defaultValue={user.role}
            disabled={isSelf}
            className="h-10 rounded-sm border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="member">Membre</option>
            <option value="admin">Administrateur</option>
          </select>
          {isSelf && (
            <p className="text-xs text-ink-muted">
              Vous ne pouvez pas modifier votre propre rôle.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="credits">Crédits</Label>
          <Input
            id="credits"
            name="credits"
            type="number"
            min={0}
            defaultValue={user.credits}
            required
          />
        </div>

        {state.error && <Alert variant="error">{state.error}</Alert>}
        {state.success && <Alert variant="success">Enregistré.</Alert>}

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>

      {!isSelf && (
        <div className="mt-4 border-t border-line pt-6">
          <p className="text-xs font-medium text-ink-muted">Zone de danger</p>
          {deleteError && (
            <Alert variant="error" className="mt-3">
              {deleteError}
            </Alert>
          )}
          {confirmingDelete ? (
            <div className="animate-toast-in mt-3 flex flex-col gap-3 rounded-sm border border-danger/30 bg-danger/5 p-4">
              <p className="text-sm text-ink">
                Supprimer définitivement ce compte ? Cette action est irréversible.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deletePending}
                  onClick={remove}
                >
                  {deletePending ? "Suppression…" : "Confirmer la suppression"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={deletePending}
                  onClick={() => setConfirmingDelete(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="mt-2 text-xs text-danger underline-offset-2 hover:underline"
              onClick={() => setConfirmingDelete(true)}
            >
              Supprimer cet utilisateur
            </button>
          )}
        </div>
      )}
    </Fragment>
  );
}
