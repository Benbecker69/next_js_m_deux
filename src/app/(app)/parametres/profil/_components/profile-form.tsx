"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { MemberType } from "@/types/domain";
import { updateProfileAction, type ProfileFormState } from "../_actions";

const MEMBER_TYPES: { value: MemberType; label: string }[] = [
  { value: "freelance", label: "Freelance" },
  { value: "entreprise", label: "Entreprise" },
  { value: "etudiant", label: "Étudiant" },
];

const initialState: ProfileFormState = { error: null, success: false };

export function ProfileForm({
  name,
  memberType,
}: {
  name: string;
  memberType: MemberType | null;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Vous êtes</legend>
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
      {state.success && <Alert variant="success">Profil mis à jour.</Alert>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
