import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getLocationById } from "@/lib/data/locations";
import { listSpacesByLocation } from "@/lib/data/spaces";
import { getT } from "@/lib/i18n/locale";
import { LocationForm } from "../_components/location-form";
import { SpacesManager } from "./_components/spaces-manager";
import { createSpaceAction, updateLocationAction } from "./_actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const location = await getLocationById(id);
  return { title: location ? location.name : "Lieu" };
}

export default async function AdminLocationDetailPage({
  params,
}: PageProps<"/admin/lieux/[id]">) {
  const { id } = await params;
  // requireAdmin() doesn't need `location`, getLocationById() doesn't need
  // the admin check to resolve — independent, so they run in parallel
  // instead of one blocking the other.
  const [, location, t] = await Promise.all([
    requireAdmin(),
    getLocationById(id),
    getT(),
  ]);
  if (!location) notFound();

  const spaces = await listSpacesByLocation(location.id);
  const boundUpdateLocation = updateLocationAction.bind(null, location.id);
  const boundCreateSpace = createSpaceAction.bind(null, location.id);

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">{location.name}</h1>
      <p className="mt-1 text-sm text-ink-muted">{location.city}</p>

      <div className="mt-8">
        <LocationForm
          action={boundUpdateLocation}
          initialValues={location}
          submitLabel={t.adminLocationForm.save}
          t={t.adminLocationForm}
        />
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <h2 className="font-display text-lg font-medium text-ink">
          {t.adminSpaces.title}
        </h2>
        <SpacesManager
          spaces={spaces}
          createAction={boundCreateSpace}
          t={t.adminSpaces}
          genericError={t.errors.generic}
        />
      </div>
    </div>
  );
}
