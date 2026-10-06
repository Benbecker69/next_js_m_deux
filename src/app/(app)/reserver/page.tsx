import type { Metadata } from "next";
import { requireOnboarded } from "@/lib/auth/session";
import { isSpaceType } from "@/lib/catalog";
import { listLocations } from "@/lib/data/locations";
import { listSpaces } from "@/lib/data/spaces";
import type { Location } from "@/types/domain";
import { getT } from "@/lib/i18n/locale";
import { SpaceBrowser } from "./_components/space-browser";

export const metadata: Metadata = {
  title: "Réserver un espace",
};

export default async function ReservePage({ searchParams }: PageProps<"/reserver">) {
  const [, spaces, locations, t, params] = await Promise.all([
    requireOnboarded(),
    listSpaces(),
    listLocations(),
    getT(),
    searchParams,
  ]);
  const locationById = new Map<string, Location>(
    locations.map((location) => [location.id, location]),
  );

  const activeSpaces = spaces
    .filter((space) => space.status === "active")
    .flatMap((space) => {
      const location = locationById.get(space.locationId);
      return location ? [{ ...space, location }] : [];
    });

  // `/reserver?lieu=<id>&type=<type>` opens the list already filtered — a
  // location page links here with its own id. Unknown values are ignored.
  const initialLocationId =
    typeof params.lieu === "string" && locationById.has(params.lieu) ? params.lieu : "";
  const initialType = isSpaceType(params.type) ? params.type : "";

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-ink">{t.booking.title}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t.bookingFlow.lead}</p>

      <div className="mt-8">
        <SpaceBrowser
          spaces={activeSpaces}
          locations={locations}
          initialLocationId={initialLocationId}
          initialType={initialType}
          t={t.booking}
          f={t.bookingFlow}
        />
      </div>
    </div>
  );
}
