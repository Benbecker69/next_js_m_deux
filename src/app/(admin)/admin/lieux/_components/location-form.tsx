"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { Location } from "@/types/domain";

export type LocationFormState = {
  error: string | null;
  success: boolean;
};

type LocationFormValues = Pick<
  Location,
  "name" | "city" | "address" | "description" | "lat" | "lng" | "amenities"
>;

export function LocationForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (state: LocationFormState, formData: FormData) => Promise<LocationFormState>;
  initialValues?: LocationFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" defaultValue={initialValues?.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" defaultValue={initialValues?.city} required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          name="address"
          defaultValue={initialValues?.address}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="any"
            defaultValue={initialValues?.lat}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="any"
            defaultValue={initialValues?.lng}
            required
          />
        </div>
      </div>
      <p className="-mt-3 text-xs text-ink-muted">
        Coordonnées approximatives — utilisées pour le tri « autour de moi ».
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={initialValues?.description}
          required
          rows={4}
          className="rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amenities">Équipements</Label>
        <Input
          id="amenities"
          name="amenities"
          defaultValue={initialValues?.amenities.join(", ")}
          placeholder="Wi-fi fibre, Café inclus, Casiers"
        />
        <p className="text-xs text-ink-muted">Séparés par des virgules.</p>
      </div>

      {state.error && <Alert variant="error">{state.error}</Alert>}
      {state.success && <Alert variant="success">Enregistré.</Alert>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
