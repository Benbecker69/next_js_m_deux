import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { listLocations } from "@/lib/data/locations";
import { listReservations } from "@/lib/data/reservations";
import { listSpaces } from "@/lib/data/spaces";
import { listUsers } from "@/lib/data/users";
import { RESERVATION_STATUS_LABELS, type ReservationStatus } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import { getLocale, getDictionary, INTL_LOCALE } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Réservations",
};

export default async function AdminReservationsPage({
  searchParams,
}: PageProps<"/admin/reservations">) {
  const [, resolvedSearchParams, reservations, spaces, locations, users, locale] =
    await Promise.all([
      requireAdmin(),
      searchParams,
      listReservations(),
      listSpaces(),
      listLocations(),
      listUsers(),
      getLocale(),
    ]);
  const t = getDictionary(locale);
  const STATUS_FILTERS: { value: ReservationStatus | "all"; label: string }[] = [
    { value: "all", label: t.adminReservationsPage.filterAll },
    { value: "confirmed", label: t.adminReservationsPage.filterConfirmed },
    { value: "completed", label: t.adminReservationsPage.filterCompleted },
    { value: "cancelled", label: t.adminReservationsPage.filterCancelled },
  ];
  const statusParam = resolvedSearchParams.status;
  const activeStatus = typeof statusParam === "string" ? statusParam : "all";

  const now = new Date();
  const withDisplayStatus = reservations.map((reservation) => ({
    ...reservation,
    displayStatus:
      reservation.status === "confirmed" && new Date(reservation.endAt) < now
        ? ("completed" as const)
        : reservation.status,
  }));

  const filtered =
    activeStatus === "all"
      ? withDisplayStatus
      : withDisplayStatus.filter(
          (reservation) => reservation.displayStatus === activeStatus,
        );

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-ink">
        {t.adminReservationsPage.title}
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={
              filter.value === "all"
                ? "/admin/reservations"
                : `/admin/reservations?status=${filter.value}`
            }
            className={cn(
              "rounded-sm border border-line px-3 py-1.5 text-sm transition-colors",
              activeStatus === filter.value
                ? "border-pine bg-pine/10 text-pine"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="mt-8 text-sm text-ink-muted">
          {t.adminReservationsPage.noneForFilter}
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-t border-line">
          {sorted.map((reservation) => {
            const space = spaces.find((item) => item.id === reservation.spaceId);
            const location = space
              ? locations.find((item) => item.id === space.locationId)
              : null;
            const member = users.find((item) => item.id === reservation.userId);
            const badge = RESERVATION_STATUS_LABELS[reservation.displayStatus];
            return (
              <li key={reservation.id} className="py-4">
                <Link
                  href={`/admin/reservations/${reservation.id}`}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink">
                      {member?.name ?? "Utilisateur"} · {space?.name ?? "Espace"} —{" "}
                      {location?.name ?? ""}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {new Date(reservation.startAt).toLocaleString(INTL_LOCALE[locale], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
