import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { getLocationById } from "@/lib/data/locations";
import { getReservationById } from "@/lib/data/reservations";
import { getSpaceById } from "@/lib/data/spaces";
import { RESERVATION_STATUS_LABELS } from "@/types/domain";
import { CancelReservationButton } from "./_components/cancel-reservation-button";

export const metadata: Metadata = {
  title: "Détail de la réservation",
};

export default async function ReservationDetailPage({
  params,
}: PageProps<"/reservations/[id]">) {
  const { id } = await params;
  const [user, reservation] = await Promise.all([
    requireOnboarded(),
    getReservationById(id),
  ]);
  if (!reservation || reservation.userId !== user.id) notFound();

  const space = await getSpaceById(reservation.spaceId);
  const location = space ? await getLocationById(space.locationId) : null;

  const canCancel =
    reservation.status === "confirmed" && new Date(reservation.startAt) > new Date();
  const badge = RESERVATION_STATUS_LABELS[reservation.status];

  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <Link
        href="/reservations"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        ← Mes réservations
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ink">
          {space?.name ?? "Espace"}
        </h1>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        {location?.name} — {location?.city}
      </p>

      <dl className="mt-8 divide-y divide-line border-t border-line text-sm">
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">Créneau</dt>
          <dd className="text-ink">
            {new Date(reservation.startAt).toLocaleString("fr-FR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">Crédits débités</dt>
          <dd className="text-ink">{reservation.creditsSpent}</dd>
        </div>
      </dl>

      {canCancel && (
        <div className="mt-8">
          <CancelReservationButton reservationId={reservation.id} />
        </div>
      )}
    </div>
  );
}
