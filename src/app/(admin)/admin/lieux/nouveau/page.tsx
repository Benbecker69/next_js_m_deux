import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { LocationForm } from "../_components/location-form";
import { createLocationAction } from "./_actions";

export const metadata: Metadata = {
  title: "Nouveau lieu",
};

export default async function NewLocationPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">Nouveau lieu</h1>
      <div className="mt-8">
        <LocationForm action={createLocationAction} submitLabel="Créer le lieu" />
      </div>
    </div>
  );
}
