import type { Metadata } from "next";
import Link from "next/link";
import { LocationArt } from "@/components/location-art";
import { getCachedLocations } from "@/lib/data/locations";
import { getCachedSpaces } from "@/lib/data/spaces";
import { getT } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.locations.title, description: t.locations.metaDescription };
}

export default async function LocationsPage() {
  const [locations, spaces, t] = await Promise.all([
    getCachedLocations(),
    getCachedSpaces(),
    getT(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-3xl font-medium text-ink">{t.locations.title}</h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        {locations.length} {t.locations.subtitle}
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {locations.map((location) => {
          const locationSpaces = spaces.filter(
            (space) => space.locationId === location.id,
          );
          const startingPrice = Math.min(
            ...locationSpaces.map((space) => space.pricePerHour),
          );
          return (
            <Link
              key={location.slug}
              href={`/lieux/${location.slug}`}
              className="group block transition-transform duration-150 hover:-translate-y-0.5"
            >
              <LocationArt
                slug={location.slug}
                variant="top"
                className="transition-colors duration-150 group-hover:border-pine"
              />
              <div className="rounded-b-sm border border-t-0 border-line bg-surface p-6 shadow-sm transition-[border-color,box-shadow] duration-150 group-hover:border-pine group-hover:shadow-md">
                <h3 className="font-display text-lg font-medium text-ink">
                  {location.name}
                </h3>
                <p className="text-sm text-ink-muted">{location.city}</p>
                <p className="mt-3 text-sm text-ink-muted">{location.description}</p>
                {Number.isFinite(startingPrice) && (
                  <p className="mt-4 text-sm text-ink">
                    {t.locations.startingFrom} {startingPrice} {t.locations.perHour}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
