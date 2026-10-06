"use client";

import { Fragment, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { FieldError, fieldProps } from "@/components/ui/field-error";
import { useRunAction } from "@/lib/feedback/use-run-action";
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
}: {
  user: User;
  isSelf: boolean;
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  t: Dictionary["adminUserDetail"];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast(state, t.saved);
  const errors = state.fieldErrors;
  const deletion = useRunAction();
  const deletePending = deletion.pending;
  const deleteError = deletion.error;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // On success the action redirects to the list (with its own toast): only
  // a refusal ever comes back here.
  const remove = () => {
    deletion.run(() => deleteUserAdminAction(user.id));
  };

  return (
    <Fragment>
      <form action={formAction} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">{t.role}</Label>
          <Select
            id="role"
            name="role"
            defaultValue={user.role}
            disabled={isSelf}
            {...fieldProps("role", errors?.role)}
          >
            <option value="member">{t.member}</option>
            <option value="admin">{t.administrator}</option>
          </Select>
          <FieldError field="role" message={errors?.role} />
          {isSelf && <p className="text-xs text-ink-muted">{t.cannotEditOwnRole}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="credits">{t.credits}</Label>
          <Input
            id="credits"
            name="credits"
            type="number"
            min={0}
            defaultValue={state.values?.credits ?? user.credits}
            required
            {...fieldProps("credits", errors?.credits)}
          />
          <FieldError field="credits" message={errors?.credits} />
        </div>

        {state.error && !errors && <Alert variant="error">{state.error}</Alert>}
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
