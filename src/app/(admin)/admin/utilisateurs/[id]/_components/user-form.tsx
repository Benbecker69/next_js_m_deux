"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { User } from "@/types/domain";
import type { UserFormState } from "../_actions";

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

  return (
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
  );
}
