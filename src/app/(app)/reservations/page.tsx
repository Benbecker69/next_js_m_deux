import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireOnboarded } from "@/lib/auth/session";
import { listLocations } from "@/lib/data/locations";
import { listReservationsByUser } from "@/lib/data/reservations";
import { listSpaces } from "@/lib/data/spaces";
import { RESERVATION_STATUS_LABELS, type ReservationStatus } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import { getLocale, getDictionary, INTL_LOCALE } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Mes réservations",
};

// Filtering by status lives in the URL (searchParams), not client state — a
// bookmarkable/shareable link and a server-rendered result, no client JS
// needed for something this simple.
export default async function ReservationsPage({
  searchParams,
}: PageProps<"/reservations">) {
  const [user, resolvedSearchParams, locale] = await Promise.all([
    requireOnboarded(),
    searchParams,
    getLocale(),
  ]);
  const t = getDictionary(locale);
  const STATUS_FILTERS: { value: ReservationStatus | "all"; label: string }[] = [
    { value: "all", label: t.myReservations.filterAll },
    { value: "confirmed", label: t.myReservations.filterUpcoming },
    { value: "completed", label: t.myReservations.filterPast },
    { value: "cancelled", label: t.myReservations.filterCancelled },
  ];
  const statusParam = resolvedSearchParams.status;
  const activeStatus = typeof statusParam === "string" ? statusParam : "all";

  const [reservations, spaces, locations] = await Promise.all([
    listReservationsByUser(user.id),
    listSpaces(),
    listLocations(),
  ]);

  const now = new Date();
  // Reservations don't flip themselves to "completed" once the slot has
  // passed — derive that for display rather than mutate stored data.
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
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-ink">
        {t.myReservations.title}
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={
              filter.value === "all"
                ? "/reservations"
                : `/reservations?status=${filter.value}`
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

      <div className="mt-8">
        {sorted.length === 0 ? (
          <EmptyState
            title={t.myReservations.emptyTitle}
            description={t.myReservations.emptyDescription}
          />
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {sorted.map((reservation) => {
              const space = spaces.find((item) => item.id === reservation.spaceId);
              const location = space
                ? locations.find((item) => item.id === space.locationId)
                : null;
              const badge = RESERVATION_STATUS_LABELS[reservation.displayStatus];
              return (
                <li key={reservation.id} className="py-4">
                  <Link
                    href={`/reservations/${reservation.id}`}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-ink">
                        {space?.name ?? "Espace"} · {location?.name ?? ""}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {new Date(reservation.startAt).toLocaleString(
                          INTL_LOCALE[locale],
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )}
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
    </div>
  );
}
