import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LocationPhoto } from "@/components/location-photo";
import { SpacePhoto } from "@/components/space-photo";
import { SPACE_TYPE_LABELS } from "@/types/domain";
import { getSession } from "@/lib/auth/session";
import { summarizeLocation } from "@/lib/catalog";
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
  const [locations, spaces, t, user] = await Promise.all([
    getCachedLocations(),
    getCachedSpaces(),
    getT(),
    getSession(),
  ]);
  const location = locations.find((item) => item.slug === slug);
  if (!location) notFound();

  const { spaces: locationSpaces, fromPrice } = summarizeLocation(location, spaces);
  const d = t.site.locationDetail;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/lieux"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        {t.locations.backToAll}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div>
          <LocationPhoto
            slug={location.slug}
            alt={location.name}
            sizes="(min-width: 1024px) 48rem, 100vw"
            priority
          />
          <h1 className="mt-8 font-display text-4xl font-medium text-ink">
            {location.name}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-ink-muted">
            <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {location.city}
          </p>

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium text-ink">{d.about}</h2>
            <p className="mt-3 max-w-2xl text-ink">{location.description}</p>
          </section>

          {location.amenities.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-xl font-medium text-ink">
                {t.locations.amenities}
              </h2>
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {location.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-3 text-ink">
                    <Check className="h-4 w-4 shrink-0 text-pine" strokeWidth={2} />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium text-ink">
              {t.locations.availableSpaces}
            </h2>
            <ul className="mt-4 divide-y divide-line rounded-sm border border-line bg-surface">
              {locationSpaces.map((space) => (
                <li key={space.id} className="flex items-center gap-4 p-4">
                  <SpacePhoto type={space.type} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{space.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-ink-muted">
                      {/* Only when the name is not already the type itself. */}
                      {space.name !== SPACE_TYPE_LABELS[space.type] && (
                        <span>{SPACE_TYPE_LABELS[space.type]}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {space.capacity} {d.capacity}
                      </span>
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-sm text-ink-muted">
                    <span className="font-display text-lg font-medium tabular-nums text-ink">
                      {space.pricePerHour}
                    </span>
                    <br />
                    {t.locations.perHour}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Stays in view while the description scrolls: the way to book is
            always next to what is being read. */}
        <aside className="rounded-sm border border-line bg-surface p-6 lg:sticky lg:top-24">
          {fromPrice !== null && (
            <p className="text-sm text-ink-muted">
              {d.from}{" "}
              <span className="font-display text-3xl font-medium tabular-nums text-ink">
                {fromPrice}
              </span>{" "}
              {t.locations.perHour}
            </p>
          )}
          <h2 className="mt-4 font-display text-lg font-medium text-ink">
            {d.bookTitle}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">{d.bookBody}</p>
          <Link
            // A signed-in member goes straight to this location's spaces.
            href={user ? `/reserver?lieu=${location.id}` : "/inscription"}
            className={buttonVariants({ className: "mt-5 w-full" })}
          >
            {user ? d.bookCta : d.signupCta}
          </Link>
          {!user && (
            <p className="mt-3 text-center text-xs text-ink-muted">{d.signupHint}</p>
          )}
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-sm font-medium text-ink">{d.address}</p>
            <p className="mt-1 text-sm text-ink-muted">{location.address}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
