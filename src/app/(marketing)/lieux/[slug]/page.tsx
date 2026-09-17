import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { LocationArt } from "@/components/location-art";
import { SPACE_TYPE_LABELS } from "@/types/domain";
import { getCachedLocations } from "@/lib/data/locations";
import { getCachedSpaces } from "@/lib/data/spaces";
import { getT } from "@/lib/i18n/locale";

export async function generateStaticParams() {
  const locations = await getCachedLocations();
  return locations.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locations = await getCachedLocations();
  const location = locations.find((item) => item.slug === slug);
  if (!location) return {};
  return {
    title: location.name,
    description: location.description,
  };
}

export default async function LocationDetailPage({ params }: PageProps<"/lieux/[slug]">) {
  const { slug } = await params;
  const [locations, spaces, t] = await Promise.all([
    getCachedLocations(),
    getCachedSpaces(),
    getT(),
  ]);
  const location = locations.find((item) => item.slug === slug);
  if (!location) notFound();

  const locationSpaces = spaces.filter((space) => space.locationId === location.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link
        href="/lieux"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        {t.locations.backToAll}
      </Link>
      <LocationArt slug={location.slug} className="mt-6" />
      <h1 className="mt-6 font-display text-3xl font-medium text-ink">{location.name}</h1>
      <p className="mt-2 text-ink-muted">{location.address}</p>
      <p className="mt-6 text-ink">{location.description}</p>

      <div className="mt-10 border-t border-line pt-6">
        <h2 className="font-display text-lg font-medium text-ink">
          {t.locations.availableSpaces}
        </h2>
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {locationSpaces.map((space) => (
            <li
              key={space.id}
              className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-ink">
                {space.name !== SPACE_TYPE_LABELS[space.type]
                  ? `${space.name} · ${SPACE_TYPE_LABELS[space.type]}`
                  : space.name}
              </span>
              <span className="text-ink-muted">
                {space.pricePerHour} {t.locations.perHour}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 border-t border-line pt-6">
        <h2 className="font-display text-lg font-medium text-ink">
          {t.locations.amenities}
        </h2>
        <p className="mt-4 text-sm text-ink-muted">{location.amenities.join(" · ")}</p>
      </div>

      <div className="mt-10">
        <Link href="/inscription" className={buttonVariants({ size: "lg" })}>
          {t.locations.bookHere}
        </Link>
      </div>
    </div>
  );
}
