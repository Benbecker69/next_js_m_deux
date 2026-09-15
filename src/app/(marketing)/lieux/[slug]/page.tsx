import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { MARKETING_LOCATIONS } from "../_data";

type Params = { slug: string };

export function generateStaticParams() {
  return MARKETING_LOCATIONS.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = MARKETING_LOCATIONS.find((item) => item.slug === slug);
  if (!location) return {};
  return {
    title: location.name,
    description: location.description,
  };
}

export default async function LocationDetailPage({ params }: PageProps<"/lieux/[slug]">) {
  const { slug } = await params;
  const location = MARKETING_LOCATIONS.find((item) => item.slug === slug);
  if (!location) notFound();

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
          {location.spaces.map((space) => (
            <li
              key={space.type}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="text-ink">{space.type}</span>
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
