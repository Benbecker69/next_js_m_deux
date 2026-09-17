"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { MemberType } from "@/types/domain";
import { useActionToast } from "@/lib/feedback/use-action-toast";
import { updateProfileAction, type ProfileFormState } from "../_actions";

const initialState: ProfileFormState = { error: null, success: false };

export function ProfileForm({
  name,
  memberType,
  t,
}: {
  name: string;
  memberType: MemberType | null;
  t: Dictionary["settings"];
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  useActionToast(state, t.profileSaved);

  const MEMBER_TYPES: { value: MemberType; label: string }[] = [
    { value: "freelance", label: t.freelance },
    { value: "entreprise", label: t.company },
    { value: "etudiant", label: t.student },
  ];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t.name}</Label>
        <Input id="name" name="name" defaultValue={state.name ?? name} required />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">{t.youAre}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEMBER_TYPES.map((type) => (
            <label key={type.value} className="cursor-pointer">
              <input
                type="radio"
                name="memberType"
                value={type.value}
                defaultChecked={memberType === type.value}
                className="peer sr-only"
              />
              <span className="inline-block rounded-sm border border-line px-3 py-1.5 text-sm text-ink-muted peer-checked:border-pine peer-checked:bg-pine/10 peer-checked:text-pine">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && <Alert variant="error">{state.error}</Alert>}
      {state.success && <Alert variant="success">{t.profileSaved}</Alert>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.saving : t.save}
        </Button>
      </div>
    </form>
  );
}
