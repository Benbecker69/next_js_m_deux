"use client";

import { Fragment, useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/lib/feedback/toast-provider";
import { useActionToast } from "@/lib/feedback/use-action-toast";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { User } from "@/types/domain";
import { deleteUserAdminAction, type UserFormState } from "../_actions";

const initialState: UserFormState = { error: null, success: false };

export function UserForm({
  user,
  isSelf,
  action,
  t,
  genericError,
}: {
  user: User;
  isSelf: boolean;
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  t: Dictionary["adminUserDetail"];
  genericError: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast(state, t.saved);
  const [deletePending, startDeleteTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { showError } = useToast();

  const remove = () => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      try {
        await deleteUserAdminAction(user.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : genericError;
        setConfirmingDelete(false);
        setDeleteError(message);
        showError(message);
      }
    });
  };

  return (
    <Fragment>
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">{t.role}</Label>
          <select
            id="role"
            name="role"
            defaultValue={user.role}
            disabled={isSelf}
            className="h-10 rounded-sm border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="member">{t.member}</option>
            <option value="admin">{t.administrator}</option>
          </select>
          {isSelf && <p className="text-xs text-ink-muted">{t.cannotEditOwnRole}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="credits">{t.credits}</Label>
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
        {state.success && <Alert variant="success">{t.saved}</Alert>}

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? t.saving : t.save}
          </Button>
        </div>
      </form>

      {!isSelf && (
        <div className="mt-4 border-t border-line pt-6">
          <p className="text-xs font-medium text-ink-muted">{t.dangerZone}</p>
          {deleteError && (
            <Alert variant="error" className="mt-3">
              {deleteError}
            </Alert>
          )}
          {confirmingDelete ? (
            <div className="animate-toast-in mt-3 flex flex-col gap-3 rounded-sm border border-danger/30 bg-danger/5 p-4">
              <p className="text-sm text-ink">{t.confirmDeletePrompt}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deletePending}
                  onClick={remove}
                >
                  {deletePending ? t.deleting : t.confirmDelete}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={deletePending}
                  onClick={() => setConfirmingDelete(false)}
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="mt-2 text-xs text-danger underline-offset-2 hover:underline"
              onClick={() => setConfirmingDelete(true)}
            >
              {t.deleteUser}
            </button>
          )}
        </div>
      )}
    </Fragment>
  );
}
