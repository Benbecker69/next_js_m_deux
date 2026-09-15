"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { Location } from "@/types/domain";
import { completeOnboardingAction, type OnboardingFormState } from "../_actions";

const MEMBER_TYPES = [
  {
    value: "freelance",
    label: "Freelance",
    description: "Vous travaillez seul·e, en indépendant.",
  },
  {
    value: "entreprise",
    label: "Entreprise",
    description: "Vous représentez une équipe ou une société.",
  },
  { value: "etudiant", label: "Étudiant", description: "Vous êtes en formation." },
] as const;

const initialState: OnboardingFormState = { error: null };

export function OnboardingForm({ locations }: { locations: Location[] }) {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <fieldset>
        <legend className="text-sm font-medium text-ink">Vous êtes</legend>
        <div className="mt-3 flex flex-col gap-2">
          {MEMBER_TYPES.map((type) => (
            <label
              key={type.value}
              className="flex cursor-pointer items-start gap-3 rounded-sm border border-line p-3 has-[:checked]:border-pine has-[:checked]:bg-pine/5"
            >
              <input
                type="radio"
                name="memberType"
                value={type.value}
                required
                className="mt-1 accent-[var(--pine)]"
              />
              <span>
                <span className="block text-sm text-ink">{type.label}</span>
                <span className="block text-xs text-ink-muted">{type.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="defaultLocationId">Lieu par défaut</Label>
        <select
          id="defaultLocationId"
          name="defaultLocationId"
          required
          defaultValue=""
          className="h-10 rounded-sm border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <option value="" disabled>
            Choisissez un lieu
          </option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} — {location.city}
            </option>
          ))}
        </select>
      </div>

      {state.error && <Alert variant="error">{state.error}</Alert>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Terminer"}
      </Button>
    </form>
  );
}
