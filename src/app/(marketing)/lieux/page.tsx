import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listLocations } from "@/lib/data/locations";
import { listSpaces } from "@/lib/data/spaces";

export const metadata: Metadata = {
  title: "Les lieux",
  description: "Tous les espaces de coworking référencés par Repère, ville par ville.",
};

export default async function LocationsPage() {
  const [locations, spaces] = await Promise.all([listLocations(), listSpaces()]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-3xl font-medium text-ink">Les lieux</h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        {locations.length} lieux référencés pour l&apos;instant, ajoutés un par un après
        visite.
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
            <Link key={location.slug} href={`/lieux/${location.slug}`}>
              <Card className="h-full transition-colors hover:border-pine">
                <CardHeader>
                  <CardTitle>{location.name}</CardTitle>
                  <CardDescription>{location.city}</CardDescription>
                </CardHeader>
                <p className="text-sm text-ink-muted">{location.description}</p>
                {Number.isFinite(startingPrice) && (
                  <p className="mt-4 text-sm text-ink">
                    À partir de {startingPrice} crédits / heure
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
