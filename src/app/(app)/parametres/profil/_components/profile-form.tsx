"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { FieldError, fieldProps } from "@/components/ui/field-error";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { splitName } from "@/lib/member/name";
import type { MemberType } from "@/types/domain";
import { useActionToast } from "@/lib/feedback/use-action-toast";
import { updateProfileAction, type ProfileFormState } from "../_actions";

const initialState: ProfileFormState = { error: null, success: false };

export function ProfileForm({
  name,
  memberType,
  t,
  labels,
}: {
  name: string;
  memberType: MemberType | null;
  t: Dictionary["settings"];
  labels: Pick<Dictionary["member"]["account"], "firstName" | "lastName">;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  useActionToast(state, t.profileSaved);
  const errors = state.fieldErrors;
  // The single stored name, shown as the two fields people expect.
  const saved = splitName(name);

  const MEMBER_TYPES: { value: MemberType; label: string }[] = [
    { value: "freelance", label: t.freelance },
    { value: "entreprise", label: t.company },
    { value: "etudiant", label: t.student },
  ];

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">{labels.firstName}</Label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={state.values?.firstName ?? saved.firstName}
            required
            {...fieldProps("firstName", errors?.firstName)}
          />
          <FieldError field="firstName" message={errors?.firstName} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">{labels.lastName}</Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={state.values?.lastName ?? saved.lastName}
            required
            {...fieldProps("lastName", errors?.lastName)}
          />
          <FieldError field="lastName" message={errors?.lastName} />
        </div>
      </div>

      <fieldset {...fieldProps("memberType", errors?.memberType)}>
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
              <span className="inline-block rounded-sm border border-line bg-surface px-4 py-2 text-sm text-ink-muted transition-colors peer-checked:border-pine peer-checked:bg-pine/10 peer-checked:text-pine peer-focus-visible:ring-2 peer-focus-visible:ring-focus">
                {type.label}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-2">
          <FieldError field="memberType" message={errors?.memberType} />
        </div>
      </fieldset>

      {state.error && !errors && <Alert variant="error">{state.error}</Alert>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.saving : t.save}
        </Button>
      </div>
    </form>
  );
}
