import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { listLocations } from "@/lib/data/locations";
import { listSpaces } from "@/lib/data/spaces";

export const metadata: Metadata = {
  title: "Lieux",
};

export default async function AdminLocationsPage() {
  const [, locations, spaces] = await Promise.all([
    requireAdmin(),
    listLocations(),
    listSpaces(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ink">Lieux</h1>
        <Link href="/admin/lieux/nouveau" className={buttonVariants({ size: "sm" })}>
          Ajouter un lieu
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-line border-t border-line">
        {locations.map((location) => {
          const count = spaces.filter((space) => space.locationId === location.id).length;
          return (
            <li key={location.id} className="py-4">
              <Link
                href={`/admin/lieux/${location.id}`}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-ink">{location.name}</p>
                  <p className="mt-1 text-xs text-ink-muted">{location.city}</p>
                </div>
                <p className="text-sm text-ink-muted">
                  {count} espace{count > 1 ? "s" : ""}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
