import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/session";
import { getLocationById } from "@/lib/data/locations";
import { listReservationsBySpace } from "@/lib/data/reservations";
import { getSpaceById } from "@/lib/data/spaces";
import { SPACE_TYPE_LABELS } from "@/types/domain";
import { CreneauPicker } from "./_components/creneau-picker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}): Promise<Metadata> {
  const { spaceId } = await params;
  const space = await getSpaceById(spaceId);
  return { title: space ? `Réserver — ${space.name}` : "Réserver" };
}

export default async function ReserveSpacePage({
  params,
}: PageProps<"/reserver/[spaceId]">) {
  const { spaceId } = await params;
  const user = await requireOnboarded();
  const space = await getSpaceById(spaceId);
  if (!space || space.status !== "active") notFound();

  const [location, existingReservations] = await Promise.all([
    getLocationById(space.locationId),
    listReservationsBySpace(space.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <Link
        href="/reserver"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        ← Tous les espaces
      </Link>
      <h1 className="mt-4 font-display text-2xl font-medium text-ink">{space.name}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {SPACE_TYPE_LABELS[space.type]} · {location?.name} — {location?.city}
      </p>

      <div className="mt-8">
        <CreneauPicker
          space={space}
          existingReservations={existingReservations}
          credits={user.credits}
        />
      </div>
    </div>
  );
}
