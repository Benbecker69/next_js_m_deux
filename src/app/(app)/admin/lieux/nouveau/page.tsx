import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/locale";
import { LocationForm } from "../_components/location-form";
import { createLocationAction } from "./_actions";

export const metadata: Metadata = {
  title: "Nouveau lieu",
};

export default async function NewLocationPage() {
  const [, t] = await Promise.all([requireAdmin(), getT()]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-ink">
        {t.adminLocationForm.createTitle}
      </h1>
      <div className="mt-8">
        <LocationForm
          action={createLocationAction}
          submitLabel={t.adminLocationForm.create}
          t={t.adminLocationForm}
        />
      </div>
    </div>
  );
}
