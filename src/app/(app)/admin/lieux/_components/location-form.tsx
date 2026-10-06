"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { FieldError, fieldProps } from "@/components/ui/field-error";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Location } from "@/types/domain";
import type { FieldErrors } from "@/lib/feedback/action-result";
import { useActionToast } from "@/lib/feedback/use-action-toast";

export type LocationFormValuesInput = {
  name: string;
  city: string;
  address: string;
  lat: string;
  lng: string;
  description: string;
  amenities: string;
};

export type LocationFormState = {
  error: string | null;
  success: boolean;
  fieldErrors?: FieldErrors;
  // Echoed back (raw, as typed) so a failed submission doesn't clear a form
  // this long.
  values?: LocationFormValuesInput;
};

type LocationFormValues = Pick<
  Location,
  "name" | "city" | "address" | "description" | "lat" | "lng" | "amenities"
>;

export function LocationForm({
  action,
  initialValues,
  submitLabel,
  t,
}: {
  action: (state: LocationFormState, formData: FormData) => Promise<LocationFormState>;
  initialValues?: LocationFormValues;
  submitLabel: string;
  t: Dictionary["adminLocationForm"];
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
    success: false,
  });
  useActionToast(state, t.saved);
  const values = state.values;
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{t.name}</Label>
          <Input
            id="name"
            name="name"
            defaultValue={values?.name ?? initialValues?.name}
            required
            {...fieldProps("name", errors?.name)}
          />
          <FieldError field="name" message={errors?.name} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">{t.city}</Label>
          <Input
            id="city"
            name="city"
            defaultValue={values?.city ?? initialValues?.city}
            required
            {...fieldProps("city", errors?.city)}
          />
          <FieldError field="city" message={errors?.city} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">{t.address}</Label>
        <Input
          id="address"
          name="address"
          defaultValue={values?.address ?? initialValues?.address}
          required
          {...fieldProps("address", errors?.address)}
        />
        <FieldError field="address" message={errors?.address} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lat">{t.latitude}</Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="any"
            defaultValue={values?.lat ?? initialValues?.lat}
            required
            {...fieldProps("lat", errors?.lat)}
          />
          <FieldError field="lat" message={errors?.lat} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lng">{t.longitude}</Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="any"
            defaultValue={values?.lng ?? initialValues?.lng}
            required
            {...fieldProps("lng", errors?.lng)}
          />
          <FieldError field="lng" message={errors?.lng} />
        </div>
      </div>
      <p className="-mt-3 text-xs text-ink-muted">{t.coordinatesHint}</p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">{t.description}</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={values?.description ?? initialValues?.description}
          required
          rows={4}
          {...fieldProps("description", errors?.description)}
        />
        <FieldError field="description" message={errors?.description} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amenities">{t.amenities}</Label>
        <Input
          id="amenities"
          name="amenities"
          defaultValue={values?.amenities ?? initialValues?.amenities.join(", ")}
          placeholder={t.amenitiesPlaceholder}
        />
        <p className="text-xs text-ink-muted">{t.amenitiesHint}</p>
      </div>

      {/* A field error is already shown under its field. */}
      {state.error && !errors && <Alert variant="error">{state.error}</Alert>}
      {state.success && <Alert variant="success">{t.saved}</Alert>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.saving : submitLabel}
        </Button>
      </div>
    </form>
  );
}
