import type { Metadata } from "next";
import { requireOnboarded } from "@/lib/auth/session";
import { listLocations } from "@/lib/data/locations";
import { listSpaces } from "@/lib/data/spaces";
import type { Location } from "@/types/domain";
import { SpaceBrowser } from "./_components/space-browser";

export const metadata: Metadata = {
  title: "Réserver un espace",
};

export default async function ReservePage() {
  await requireOnboarded();
  const [spaces, locations] = await Promise.all([listSpaces(), listLocations()]);
  const locationById = new Map<string, Location>(
    locations.map((location) => [location.id, location]),
  );

  const activeSpaces = spaces
    .filter((space) => space.status === "active")
    .flatMap((space) => {
      const location = locationById.get(space.locationId);
      return location ? [{ ...space, location }] : [];
    });

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">Réserver un espace</h1>
      <p className="mt-2 text-sm text-ink-muted">
        {activeSpaces.length} espaces disponibles dans {locations.length} lieux.
      </p>
      <div className="mt-8">
        <SpaceBrowser spaces={activeSpaces} />
      </div>
    </div>
  );
}
