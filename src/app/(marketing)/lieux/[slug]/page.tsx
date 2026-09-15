import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { SPACE_TYPE_LABELS } from "@/types/domain";
import { getLocationBySlug, listLocations } from "@/lib/data/locations";
import { listSpacesByLocation } from "@/lib/data/spaces";

export async function generateStaticParams() {
  const locations = await listLocations();
  return locations.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return {};
  return {
    title: location.name,
    description: location.description,
  };
}

export default async function LocationDetailPage({ params }: PageProps<"/lieux/[slug]">) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) notFound();

  const spaces = await listSpacesByLocation(location.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link
        href="/lieux"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        ← Tous les lieux
      </Link>
      <h1 className="mt-4 font-display text-3xl font-medium text-ink">{location.name}</h1>
      <p className="mt-2 text-ink-muted">{location.address}</p>
      <p className="mt-6 text-ink">{location.description}</p>

      <div className="mt-10 border-t border-line pt-6">
        <h2 className="font-display text-lg font-medium text-ink">Espaces disponibles</h2>
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {spaces.map((space) => (
            <li key={space.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-ink">
                {space.name !== SPACE_TYPE_LABELS[space.type]
                  ? `${space.name} · ${SPACE_TYPE_LABELS[space.type]}`
                  : space.name}
              </span>
              <span className="text-ink-muted">{space.pricePerHour} crédits / heure</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 border-t border-line pt-6">
        <h2 className="font-display text-lg font-medium text-ink">Équipements</h2>
        <p className="mt-4 text-sm text-ink-muted">{location.amenities.join(" · ")}</p>
      </div>

      <div className="mt-10">
        <Link href="/inscription" className={buttonVariants({ size: "lg" })}>
          Réserver un espace ici
        </Link>
      </div>
    </div>
  );
}
