import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { getLocationById } from "@/lib/data/locations";
import { getReservationById } from "@/lib/data/reservations";
import { getSpaceById } from "@/lib/data/spaces";
import { getUserById } from "@/lib/data/users";
import { RESERVATION_STATUS_LABELS } from "@/types/domain";
import { getLocale, getDictionary, INTL_LOCALE } from "@/lib/i18n/locale";
import { CancelReservationButton } from "./_components/cancel-reservation-button";

export const metadata: Metadata = {
  title: "Détail de la réservation",
};

export default async function AdminReservationDetailPage({
  params,
}: PageProps<"/admin/reservations/[id]">) {
  const { id } = await params;
  const [, reservation, locale] = await Promise.all([
    requireAdmin(),
    getReservationById(id),
    getLocale(),
  ]);
  if (!reservation) notFound();
  const t = getDictionary(locale);

  const [space, member] = await Promise.all([
    getSpaceById(reservation.spaceId),
    getUserById(reservation.userId),
  ]);
  const location = space ? await getLocationById(space.locationId) : null;
  const badge = RESERVATION_STATUS_LABELS[reservation.status];

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
      <Link
        href="/admin/reservations"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        {t.adminReservationsPage.backToList}
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
          <dt className="text-ink-muted">{t.adminReservationsPage.member}</dt>
          <dd className="text-ink">
            {member?.name ?? "—"} ({member?.email ?? "—"})
          </dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">{t.adminReservationsPage.slot}</dt>
          <dd className="text-ink">
            {new Date(reservation.startAt).toLocaleString(INTL_LOCALE[locale], {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">{t.adminReservationsPage.creditsSpent}</dt>
          <dd className="text-ink">{reservation.creditsSpent}</dd>
        </div>
      </dl>

      {reservation.status === "confirmed" && (
        <div className="mt-8">
          <CancelReservationButton
            reservationId={reservation.id}
            t={t.adminReservationsPage}
            genericError={t.errors.generic}
          />
        </div>
      )}
    </div>
  );
}
